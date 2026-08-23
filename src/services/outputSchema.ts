// ============================================================
// PRODEXA AI — Centralized Expected Output Schema
// ============================================================
// This is the SINGLE SOURCE OF TRUTH for all output headers.
// Do NOT hardcode header names anywhere else in the codebase.
// All components (UI preview, CSV export, XLSX export, schema
// validator) must import and reference EXPECTED_OUTPUT_HEADERS.
// ============================================================

/**
 * Official Expected Output schema headers.
 * Spelling, capitalization, spacing, and order are exact.
 */
export const EXPECTED_OUTPUT_HEADERS = [
  "Part Number",
  "Product Name",
  "Brand",
  "Category",
  "Quality Score",
  "Status",
  "Commerce Readiness",
  "Attributes Count",
  "Last Updated",
] as const;

export type ExpectedOutputHeader = (typeof EXPECTED_OUTPUT_HEADERS)[number];

/**
 * A single row in the Expected Output.
 */
export type ExpectedOutputRow = Record<ExpectedOutputHeader, string | number>;

/**
 * Creates an empty Expected Output row with all required headers.
 */
export function createEmptyOutputRow(): ExpectedOutputRow {
  return Object.fromEntries(
    EXPECTED_OUTPUT_HEADERS.map((h) => [h, ""])
  ) as ExpectedOutputRow;
}

/**
 * Maps a processed Product object to the Expected Output schema row.
 * This is the canonical mapping function — used by every downstream
 * consumer (preview table, CSV export, XLSX export, validator).
 */
export function mapProductToOutputRow(product: {
  partNumber: string;
  name: string;
  description?: string;
  brand: string;
  category: string;
  qualityScore: number;
  status: string;
  commerceReadiness: { status: string };
  attributes: unknown[];
  lastUpdated: string;
}): ExpectedOutputRow {
  return {
    "Part Number": product.partNumber,
    "Product Name": product.description || product.name,
    "Brand": product.brand,
    "Category": product.category,
    "Quality Score": product.qualityScore,
    "Status": product.status.toUpperCase(),
    "Commerce Readiness": product.commerceReadiness.status,
    "Attributes Count": product.attributes.length,
    "Last Updated": product.lastUpdated,
  };
}

// ============================================================
// Schema Validation Result
// ============================================================

export interface SchemaValidationResult {
  valid: boolean;
  missingHeaders: string[];
  unexpectedHeaders: string[];
  rowCount: number;
  inputRowCount: number;
  duplicateRows: number[];
  emptyRequiredFields: { row: number; field: string }[];
  errors: string[];
  warnings: string[];
}

/**
 * Validates that the generated output rows conform to the Expected Output schema.
 */
export function validateOutputSchema(
  rows: ExpectedOutputRow[],
  inputRowCount: number
): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Header validation — check every expected header is present in a sample row
  const sampleKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const missingHeaders = EXPECTED_OUTPUT_HEADERS.filter(
    (h) => !sampleKeys.includes(h)
  );
  const unexpectedHeaders = sampleKeys.filter(
    (k) => !(EXPECTED_OUTPUT_HEADERS as readonly string[]).includes(k)
  );

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
  }
  if (unexpectedHeaders.length > 0) {
    warnings.push(`Unexpected headers in output: ${unexpectedHeaders.join(", ")}`);
  }

  // Row count validation
  if (rows.length !== inputRowCount) {
    warnings.push(
      `Output row count (${rows.length}) differs from input row count (${inputRowCount})`
    );
  }

  // Duplicate detection (by Part Number)
  const partNumbers = rows.map((r) => r["Part Number"]);
  const seenParts = new Map<string | number, number>();
  const duplicateRows: number[] = [];
  partNumbers.forEach((pn, idx) => {
    const key = String(pn).toLowerCase().replace(/[\s\-_]/g, "");
    if (seenParts.has(key)) {
      duplicateRows.push(idx + 1);
    } else {
      seenParts.set(key, idx + 1);
    }
  });
  if (duplicateRows.length > 0) {
    warnings.push(`Duplicate Part Numbers detected at output rows: ${duplicateRows.join(", ")}`);
  }

  // Required fields check
  const emptyRequiredFields: { row: number; field: string }[] = [];
  const requiredFields: ExpectedOutputHeader[] = [
    "Part Number",
    "Product Name",
    "Brand",
    "Category",
  ];
  rows.forEach((row, idx) => {
    requiredFields.forEach((field) => {
      const val = row[field];
      if (val === "" || val === null || val === undefined) {
        emptyRequiredFields.push({ row: idx + 1, field });
      }
    });
  });
  if (emptyRequiredFields.length > 0) {
    warnings.push(`${emptyRequiredFields.length} empty required field(s) detected.`);
  }

  const valid = errors.length === 0;
  return {
    valid,
    missingHeaders,
    unexpectedHeaders,
    rowCount: rows.length,
    inputRowCount,
    duplicateRows,
    emptyRequiredFields,
    errors,
    warnings,
  };
}
