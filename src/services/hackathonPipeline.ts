// ============================================================
// PRODEXA AI — Hackathon Pipeline Service
// ============================================================
// Orchestrates: File Parse → Input Validate → Normalize →
// Enrich (row-by-row) → Map to Expected Output → Validate Output
// ============================================================

import { ParserEngine } from "./parserEngine";
import { AIEngine } from "./aiEngine";
import { mapProductToOutputRow, validateOutputSchema } from "./outputSchema";
import type { ExpectedOutputRow, SchemaValidationResult } from "./outputSchema";
import type { Product } from "../types/prodexa";
import * as XLSX from "xlsx";

// ============================================================
// Types
// ============================================================

export interface InputValidationResult {
  totalRowsDetected: number;
  validRows: number;
  rowsWithWarnings: number;
  blockingErrors: number;
  headers: string[];
  columnCount: number;
  missingProductIds: number[];
  missingProductNames: number[];
  emptyRows: number[];
  duplicateHeaders: string[];
  unexpectedTypes: { row: number; field: string; issue: string }[];
  warnings: { row: number; message: string }[];
  errors: { row: number; message: string }[];
}

export interface ProcessingProgress {
  total: number;
  processed: number;
  succeeded: number;
  warnings: number;
  failed: number;
  currentProduct: string;
  stage: string;
}

export interface HackathonPipelineResult {
  products: Product[];
  outputRows: ExpectedOutputRow[];
  schemaValidation: SchemaValidationResult;
  processingStats: {
    total: number;
    succeeded: number;
    warned: number;
    failed: number;
    durationMs: number;
  };
}

// ============================================================
// XLSX Parser (browser-side via SheetJS)
// ============================================================

export function parseXLSXToCSV(buffer: ArrayBuffer): { headers: string[]; rows: Record<string, string>[] } {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (jsonRows.length === 0) return { headers: [], rows: [] };

    // Get raw headers, preservation of indices is critical
    const rawHeaders = (jsonRows[0] as unknown[]).map((h) => String(h ?? "").trim());
    
    // The actual headers we expose (only non-empty ones)
    const headers = rawHeaders.filter((h) => h.length > 0);

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < jsonRows.length; i++) {
      const raw = jsonRows[i] as unknown[];
      const rowObj: Record<string, string> = {};
      let hasValue = false;
      
      rawHeaders.forEach((h, colIdx) => {
        if (h.length > 0) {
          const val = String(raw[colIdx] ?? "").trim();
          rowObj[h] = val;
          if (val) hasValue = true;
        }
      });
      if (hasValue) rows.push(rowObj);
    }

    return { headers, rows };
  } catch (err) {
    throw new Error(`XLSX parse error: ${(err as Error).message}`);
  }
}

// ============================================================
// Input Validator
// ============================================================

export function validateInput(
  headers: string[],
  rows: Record<string, string>[]
): InputValidationResult {
  const result: InputValidationResult = {
    totalRowsDetected: rows.length,
    validRows: 0,
    rowsWithWarnings: 0,
    blockingErrors: 0,
    headers,
    columnCount: headers.length,
    missingProductIds: [],
    missingProductNames: [],
    emptyRows: [],
    duplicateHeaders: [],
    unexpectedTypes: [],
    warnings: [],
    errors: [],
  };

  // Duplicate headers
  const seen = new Map<string, number>();
  headers.forEach((h) => {
    const lower = h.toLowerCase();
    seen.set(lower, (seen.get(lower) ?? 0) + 1);
  });
  result.duplicateHeaders = headers.filter((h) => (seen.get(h.toLowerCase()) ?? 0) > 1);
  if (result.duplicateHeaders.length > 0) {
    result.errors.push({ row: 0, message: `Duplicate headers: ${result.duplicateHeaders.join(", ")}` });
    result.blockingErrors++;
  }

  // Empty dataset
  if (rows.length === 0) {
    result.errors.push({ row: 0, message: "Dataset contains no data rows." });
    result.blockingErrors++;
    return result;
  }

  // Detect identifier columns heuristically
  const mappings = ParserEngine.inferColumnMappings(headers, rows.slice(0, 3));
  const partCol = mappings.find((m) => m.mappedField === "partNumber")?.rawHeader;
  const nameCol = mappings.find((m) => m.mappedField === "description")?.rawHeader;

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const values = Object.values(row);
    const allEmpty = values.every((v) => !v || v.trim() === "");

    if (allEmpty) {
      result.emptyRows.push(rowNum);
      result.warnings.push({ row: rowNum, message: "Empty row detected — will be skipped." });
      result.rowsWithWarnings++;
      return;
    }

    let rowHasWarning = false;

    // Missing product identifier
    if (partCol && (!row[partCol] || row[partCol].trim() === "")) {
      result.missingProductIds.push(rowNum);
      result.warnings.push({ row: rowNum, message: `Row ${rowNum}: Missing product identifier (${partCol}). Auto-ID will be assigned.` });
      rowHasWarning = true;
    }

    // Missing product name/description
    if (nameCol && (!row[nameCol] || row[nameCol].trim() === "")) {
      result.missingProductNames.push(rowNum);
      result.warnings.push({ row: rowNum, message: `Row ${rowNum}: Missing description/name. Enrichment will be attempted.` });
      rowHasWarning = true;
    }

    if (rowHasWarning) {
      result.rowsWithWarnings++;
    } else {
      result.validRows++;
    }
  });

  // Adjust valid rows to exclude truly empty rows
  result.validRows = rows.length - result.emptyRows.length - result.rowsWithWarnings;
  if (result.validRows < 0) result.validRows = 0;

  return result;
}

// ============================================================
// Hackathon Pipeline — Main Processor
// ============================================================

export async function runHackathonPipeline(
  fileName: string,
  headers: string[],
  rows: Record<string, string>[],
  onProgress: (progress: ProcessingProgress) => void
): Promise<HackathonPipelineResult> {
  const startTime = Date.now();
  const datasetId = `hackathon_${Date.now()}`;

  // Filter out fully empty rows
  const validRows = rows.filter((row) => {
    const values = Object.values(row);
    return values.some((v) => v && v.trim() !== "");
  });

  const total = validRows.length;
  let processed = 0;
  let succeeded = 0;
  let warned = 0;
  let failed = 0;

  const mappings = ParserEngine.inferColumnMappings(headers, validRows.slice(0, 3));
  const products: Product[] = [];
  const outputRows: ExpectedOutputRow[] = [];

  // Process each row independently
  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];
    const rowNum = i + 1;

    // Derive a display name for progress
    const partCol = mappings.find((m) => m.mappedField === "partNumber")?.rawHeader;
    const descCol = mappings.find((m) => m.mappedField === "description")?.rawHeader;
    const productLabel =
      (partCol && row[partCol]) ||
      (descCol && row[descCol]?.slice(0, 30)) ||
      `Row ${rowNum}`;

    onProgress({
      total,
      processed,
      succeeded,
      warnings: warned,
      failed,
      currentProduct: productLabel,
      stage: "Enriching",
    });

    try {
      // Build product from single row using existing pipeline
      const singleRowProducts = ParserEngine.buildProductsFromRows(
        datasetId,
        fileName,
        headers,
        [row],
        mappings
      );

      if (singleRowProducts.length > 0) {
        const product = singleRowProducts[0];
        // Override the product ID to maintain row association
        product.id = `hackathon_${datasetId}_row_${rowNum}`;
        product.sourceRowNumber = rowNum;

        products.push(product);
        outputRows.push(mapProductToOutputRow(product));

        if (
          product.missingAttributes.length > 0 ||
          product.conflicts.some((c) => c.status === "OPEN")
        ) {
          warned++;
        } else {
          succeeded++;
        }
      }
    } catch {
      failed++;
      // Add a fallback row so row count stays consistent
      outputRows.push({
        "Part Number": row[mappings.find((m) => m.mappedField === "partNumber")?.rawHeader ?? ""] || `ROW-${rowNum}`,
        "Product Name": row[mappings.find((m) => m.mappedField === "description")?.rawHeader ?? ""] || "Unknown Product",
        "Brand": row[mappings.find((m) => m.mappedField === "brand")?.rawHeader ?? ""] || "Unknown",
        "Category": "Unclassified",
        "Quality Score": 0,
        "Status": "FAILED",
        "Commerce Readiness": "INCOMPLETE",
        "Attributes Count": 0,
        "Last Updated": new Date().toISOString(),
      });
    }

    processed++;

    // Yield to the event loop so the UI can update
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // Duplicate detection across all products
  if (products.length > 1) {
    AIEngine.detectDuplicates(products);
  }

  onProgress({
    total,
    processed,
    succeeded,
    warnings: warned,
    failed,
    currentProduct: "Complete",
    stage: "Validating output schema",
  });

  // Final schema validation
  const schemaValidation = validateOutputSchema(outputRows, validRows.length);

  return {
    products,
    outputRows,
    schemaValidation,
    processingStats: {
      total,
      succeeded,
      warned,
      failed,
      durationMs: Date.now() - startTime,
    },
  };
}

// ============================================================
// Hackathon Export — CSV (using centralized schema)
// ============================================================

import { EXPECTED_OUTPUT_HEADERS } from "./outputSchema";

export function generateHackathonCSV(outputRows: ExpectedOutputRow[]): string {
  const escapeCSV = (val: string | number): string => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = EXPECTED_OUTPUT_HEADERS.map(escapeCSV).join(",");
  const dataLines = outputRows.map((row) =>
    EXPECTED_OUTPUT_HEADERS.map((h) => escapeCSV(row[h])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

// ============================================================
// Hackathon Export — XLSX (real .xlsx via SheetJS)
// ============================================================

export function generateHackathonXLSX(outputRows: ExpectedOutputRow[]): Uint8Array {
  const worksheetData = [
    [...EXPECTED_OUTPUT_HEADERS],
    ...outputRows.map((row) => EXPECTED_OUTPUT_HEADERS.map((h) => row[h])),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Style header row (column widths)
  const colWidths = EXPECTED_OUTPUT_HEADERS.map((h) => ({
    wch: Math.max(h.length + 4, 18),
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expected Output");

  const xlsxBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Uint8Array(xlsxBuffer);
}

// ============================================================
// File Download Utility
// ============================================================

export function downloadBlob(content: string | Uint8Array, filename: string, mimeType: string) {
  const blob =
    typeof content === "string"
      ? new Blob([content], { type: mimeType })
      : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
