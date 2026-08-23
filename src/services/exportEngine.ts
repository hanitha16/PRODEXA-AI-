// ============================================================
// PRODEXA AI — Real Multi-Format Export Engine
// ============================================================

import type { Product } from "../types/prodexa";

export class ExportEngine {
  /**
   * Generates formatted CSV for products and attributes
   */
  public static generateCSV(products: Product[]): string {
    const headers = [
      "ID",
      "Part Number",
      "Product Name",
      "Brand",
      "Category",
      "Subcategory",
      "Quality Score",
      "Status",
      "Completeness %",
      "Commerce Readiness",
      "Missing Attributes Count",
      "Open Conflicts Count",
      "Total Attributes",
      "Last Updated",
    ];

    const productRows = products.map(p => [
      p.id,
      `"${p.partNumber}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      `"${p.subcategory || ""}"`,
      p.qualityScore,
      p.status.toUpperCase(),
      p.completeness,
      `"${p.commerceReadiness.status}"`,
      p.missingAttributes?.length || 0,
      p.conflicts?.filter(c => c.status === "OPEN").length || 0,
      p.attributes.length,
      p.lastUpdated,
    ].join(","));

    const attrHeaders = [
      "Product ID",
      "Part Number",
      "Attribute Name",
      "Normalized Value",
      "Raw Value",
      "Unit",
      "Validation Status",
      "Confidence %",
      "Sources Count",
      "Primary Source",
      "Source Row",
      "Decision Rationale",
    ];

    const attrRows = products.flatMap(p =>
      p.attributes.map(a => [
        p.id,
        `"${p.partNumber}"`,
        `"${a.name}"`,
        `"${(a.value || "").replace(/"/g, '""')}"`,
        `"${(a.rawValue || a.originalValue || a.value || "").replace(/"/g, '""')}"`,
        `"${a.unit || ""}"`,
        a.status,
        a.confidence,
        a.sources.length,
        `"${a.sources[0]?.name || ""}"`,
        a.sources[0]?.rowNumber || "",
        `"${(a.rationale?.summary || "").replace(/"/g, '""')}"`,
      ].join(","))
    );

    return [
      "=== PRODEXA AI ENTERPRISE CATALOG EXPORT ===",
      `Export Timestamp,${new Date().toISOString()}`,
      `Total Products,${products.length}`,
      "",
      "--- PRODUCTS SUMMARY ---",
      headers.join(","),
      ...productRows,
      "",
      "--- DETAILED ATTRIBUTES & LINEAGE ---",
      attrHeaders.join(","),
      ...attrRows,
    ].join("\n");
  }

  /**
   * Generates structured JSON export
   */
  public static generateJSON(products: Product[]): string {
    const exportPayload = {
      exportMetadata: {
        generator: "PRODEXA AI Intelligence Engine v2.4",
        exportedAt: new Date().toISOString(),
        totalProducts: products.length,
        averageQualityScore: products.length > 0 ? Number((products.reduce((acc, p) => acc + p.qualityScore, 0) / products.length).toFixed(1)) : 0,
        commerceReadyCount: products.filter(p => p.commerceReadiness.status === "COMMERCE READY").length,
      },
      products: products.map(p => ({
        id: p.id,
        partNumber: p.partNumber,
        normalizedPartNumber: p.normalizedPartNumber,
        name: p.name,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory,
        description: p.description,
        enrichedDescription: p.enrichedDescription,
        qualityScore: p.qualityScore,
        status: p.status,
        completeness: p.completeness,
        commerceReadiness: p.commerceReadiness,
        lastUpdated: p.lastUpdated,
        attributes: p.attributes.map(a => ({
          id: a.id,
          name: a.name,
          value: a.value,
          rawValue: a.rawValue,
          unit: a.unit,
          status: a.status,
          confidence: a.confidence,
          sources: a.sources,
          evidence: a.evidence,
          rationale: a.rationale,
        })),
        sources: p.sources,
        conflicts: p.conflicts,
        missingAttributes: p.missingAttributes,
        duplicateInfo: p.duplicateInfo,
        history: p.history,
      })),
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  /**
   * Generates real XML-based SpreadsheetML Workbook (.xlsx compatible XML)
   */
  public static generateExcelWorkbook(products: Product[]): string {
    const escapeXml = (unsafe: string | number | undefined) => {
      if (unsafe === undefined || unsafe === null) return "";
      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#1E3A8A" ss:Bold="1"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Product Catalog">
  <Table>
   <Row ss:Height="25">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Part Number</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Product Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Brand</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Quality Score</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Commerce Readiness</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Attributes Count</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Last Updated</Data></Cell>
   </Row>`;

    products.forEach(p => {
      xml += `
   <Row ss:Height="20">
    <Cell><Data ss:Type="String">${escapeXml(p.partNumber)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.brand)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.category)}</Data></Cell>
    <Cell><Data ss:Type="Number">${p.qualityScore}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.status.toUpperCase())}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.commerceReadiness.status)}</Data></Cell>
    <Cell><Data ss:Type="Number">${p.attributes.length}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(p.lastUpdated)}</Data></Cell>
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Enriched Attributes">
  <Table>
   <Row ss:Height="25">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Part Number</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Attribute</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Normalized Value</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Raw Input</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Unit</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Confidence %</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Source</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Rationale</Data></Cell>
   </Row>`;

    products.forEach(p => {
      p.attributes.forEach(a => {
        xml += `
   <Row ss:Height="18">
    <Cell><Data ss:Type="String">${escapeXml(p.partNumber)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(a.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(a.value)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(a.rawValue || a.originalValue || a.value)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(a.unit || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(a.status)}</Data></Cell>
    <Cell><Data ss:Type="Number">${a.confidence}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(a.sources[0]?.name || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(a.rationale?.summary || "")}</Data></Cell>
   </Row>`;
      });
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    return xml;
  }

  /**
   * Triggers client-side browser file download
   */
  public static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
