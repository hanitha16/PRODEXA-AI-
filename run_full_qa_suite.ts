// ============================================================
// PRODEXA AI — Automated Comprehensive QA Test Suite
// ============================================================

import { authService } from "../src/services/authService";
import { ParserEngine } from "../src/services/parserEngine";
import { AIEngine, CATEGORY_SCHEMAS } from "../src/services/aiEngine";
import { NormalizationEngine } from "../src/services/normalizationEngine";
import { ExportEngine } from "../src/services/exportEngine";
import { catalogStore } from "../src/services/catalogStore";
import { PRODEXA_TEST_CATALOG_CSV } from "../src/data/testCatalog";

// Mock localStorage for node environment if not present
if (typeof localStorage === "undefined") {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function test(suite: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, name, passed: true });
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message });
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

console.log("\n========================================================");
console.log("PRODEXA AI — COMPLETE QA & VALIDATION TEST SUITE");
console.log("========================================================\n");

// ----------------------------------------------------------------
// 1. AUTHENTICATION & DEMO MODES
// ----------------------------------------------------------------
console.log("[1/6] Running Authentication Tests...");

test("Auth", "Default judge account exists and logs in", () => {
  const err = authService.login("judge@prodexa.ai", "prodexa2024");
  assert(err === null, `Expected successful login, got: ${err}`);
  const user = authService.getCurrentUser();
  assert(user !== null, "Expected active session user");
  assert(user?.email === "judge@prodexa.ai", "Expected judge email");
});

test("Auth", "Unknown email returns generic error without user enumeration", () => {
  const err = authService.login("nonexistent@acme.com", "wrongpassword");
  assert(err === "Invalid email or password.", `Expected generic message, got: ${err}`);
});

test("Auth", "Incorrect password returns generic error", () => {
  const err = authService.login("judge@prodexa.ai", "wrongpassword");
  assert(err === "Invalid email or password.", `Expected generic message, got: ${err}`);
});

test("Auth", "Sign Up validates full name, work email, company, password strength", () => {
  const errEmptyName = authService.signUp("", "test@enterprise.com", "pass1234", "Corp");
  assert(errEmptyName === "Full name is required.", "Expected name validation");

  const errInvalidEmail = authService.signUp("John Doe", "invalid-email", "pass1234", "Corp");
  assert(errInvalidEmail?.includes("valid work email") === true, "Expected email format validation");

  const errShortPass = authService.signUp("John Doe", "john@enterprise.com", "123", "Corp");
  assert(errShortPass?.includes("at least 6 characters") === true, "Expected password length validation");

  const successSignUp = authService.signUp("Sarah Connor", "sarah@cyberdyne.io", "Skynet2024!", "Cyberdyne Systems", "Chief Data Architect");
  assert(successSignUp === null, `Expected success, got: ${successSignUp}`);

  const user = authService.getCurrentUser();
  assert(user?.email === "sarah@cyberdyne.io", "Expected new user session");
  assert(user?.company === "Cyberdyne Systems", "Expected company stored");
  assert(!user?._demoPasswordHash.includes("Skynet2024!"), "Password must be hashed, never plain text");
});

test("Auth", "Google & Microsoft OAuth Demo Session creation works cleanly", () => {
  const googleUser = authService.loginDemoSession("Google");
  assert(googleUser.email === "demo.google@prodexa.ai", "Expected google demo email");
  assert(googleUser.isDemoSession === true, "Expected isDemoSession flag");
  assert(authService.isDemoSession() === true, "Expected authService.isDemoSession() true");

  const msUser = authService.loginDemoSession("Microsoft");
  assert(msUser.email === "demo.microsoft@prodexa.ai", "Expected MS demo email");
});

test("Auth", "Safe Prototype Password Reset flow functions correctly", () => {
  const err = authService.resetPassword("sarah@cyberdyne.io", "NewSafePassword2024!");
  assert(err === null, `Expected successful reset, got: ${err}`);
  const loginWithNew = authService.login("sarah@cyberdyne.io", "NewSafePassword2024!");
  assert(loginWithNew === null, "Expected login with updated password to succeed");
});

test("Auth", "Logout clears user session state", () => {
  authService.logout();
  assert(authService.getCurrentUser() === null, "Expected user to be null after logout");
  assert(authService.isLoggedIn() === false, "Expected isLoggedIn false");
});

// ----------------------------------------------------------------
// 2. PARSER ENGINE & COLUMN INGESTION
// ----------------------------------------------------------------
console.log("\n[2/6] Running Parser & Ingestion Engine Tests...");

test("Parser", "RFC-4180 CSV parser handles quotes, commas, multiline correctly", () => {
  const csv = `part_number,brand,description,specs\nPS-100,"Acme, Inc.","Sensor 0-10 bar, piezoresistive","G1/2 thread, 24V"`;
  const { headers, rows } = ParserEngine.parseCSV(csv);
  assert(headers.length === 4, `Expected 4 headers, got ${headers.length}`);
  assert(rows.length === 1, `Expected 1 row, got ${rows.length}`);
  assert(rows[0]["brand"] === "Acme, Inc.", `Expected quoted comma preserved, got: ${rows[0]["brand"]}`);
  assert(rows[0]["specs"] === "G1/2 thread, 24V", "Expected quoted specs preserved");
});

test("Parser", "Auto-infers column mappings with high confidence", () => {
  const headers = ["product_code", "manufacturer_name", "product_description", "voltage", "pressure_range"];
  const rows = [{ product_code: "PS-100", manufacturer_name: "Acme", product_description: "Sensor", voltage: "24V", pressure_range: "10bar" }];
  const mappings = ParserEngine.inferColumnMappings(headers, rows);
  
  const partMap = mappings.find(m => m.rawHeader === "product_code");
  assert(partMap?.mappedField === "partNumber" && partMap.confidence >= 95, "Expected partNumber mapping");
  
  const brandMap = mappings.find(m => m.rawHeader === "manufacturer_name");
  assert(brandMap?.mappedField === "brand" && brandMap.confidence >= 95, "Expected brand mapping");
  
  const voltMap = mappings.find(m => m.rawHeader === "voltage");
  assert(voltMap?.mappedField === "voltage" && voltMap.confidence >= 90, "Expected voltage mapping");
});

test("Parser", "Builds 15 industrial products with complete traceability", () => {
  const { headers, rows } = ParserEngine.parseCSV(PRODEXA_TEST_CATALOG_CSV);
  const mappings = ParserEngine.inferColumnMappings(headers, rows);
  const products = ParserEngine.buildProductsFromRows("test_ds", "prodexa_test_catalog.csv", headers, rows, mappings);
  assert(products.length === 15, `Expected 15 products, got ${products.length}`);
  products.forEach(p => {
    assert(!!p.id, "Every product must have unique ID");
    assert(!!p.name, "Every product must have name");
    assert(!!p.partNumber, "Every product must have part number");
    assert(p.attributes.length >= 2, "Every product must have extracted attributes");
    assert(p.sources.length >= 1, "Every product must have traceable sources");
  });
});

// ----------------------------------------------------------------
// 3. CATEGORY SCHEMAS & ATTRIBUTE ONTOLOGIES
// ----------------------------------------------------------------
console.log("\n[3/6] Running Category Understanding & Schemas Tests...");

const requiredCategories = [
  "Pressure Sensors",
  "Circuit Breakers",
  "PLC Modules",
  "Electric Motors",
  "Hydraulic Valves",
  "Industrial Pumps",
  "Industrial Filters",
  "Temperature Sensors",
];

requiredCategories.forEach(cat => {
  test("Ontology", `Validates schema for ${cat}`, () => {
    const schema = CATEGORY_SCHEMAS[cat];
    assert(schema !== undefined, `Category schema must exist for ${cat}`);
    assert(schema.mandatoryAttributes.length >= 3, `Mandatory attributes needed for ${cat}`);
    assert(schema.subcategories.length >= 2, `Subcategories needed for ${cat}`);
    assert(schema.standardSources.length >= 1, `Authoritative sources required for ${cat}`);
  });
});

test("Ontology", "AIEngine accurately identifies product category from partial descriptions", () => {
  const p1 = AIEngine.identifyProduct("6ES7-214", "Siemens", "SIMATIC S7-1200 Digital Input Module");
  assert(p1.category === "PLC Modules", `Expected PLC Modules, got ${p1.category}`);

  const p2 = AIEngine.identifyProduct("CB-220", "Schneider", "3-Pole Molded Case 32A 10kA Circuit Breaker");
  assert(p2.category === "Circuit Breakers", `Expected Circuit Breakers, got ${p2.category}`);

  const p3 = AIEngine.identifyProduct("PS-100", "Acme", "Industrial Pressure Sensor 0-10 bar piezoresistive");
  assert(p3.category === "Pressure Sensors", `Expected Pressure Sensors, got ${p3.category}`);

  const p4 = AIEngine.identifyProduct("MTR-750", "ABB", "Three-Phase Induction Motor 7.5kW 1450RPM");
  assert(p4.category === "Electric Motors", `Expected Electric Motors, got ${p4.category}`);
});

// ----------------------------------------------------------------
// 4. MULTI-SOURCE VALIDATION, CONFLICTS & DUPLICATES
// ----------------------------------------------------------------
console.log("\n[4/6] Running Validation, Conflict & Confidence Tests...");

test("Validation", "Field confidence calculation derives score from source quality & agreement", () => {
  const srcA = { id: "s1", name: "OEM Datasheet", type: "datasheet" as const, reliability: 98 };
  const srcB = { id: "s2", name: "Distributor Catalog", type: "distributor" as const, reliability: 92 };

  const verifiedConf = AIEngine.calculateFieldConfidence([srcA, srcB], true, true, false);
  assert(verifiedConf.score >= 90, `Expected high confidence >=90, got ${verifiedConf.score}`);
  assert(verifiedConf.rationale.factors.length > 0, "Expected decision factors in rationale");

  const conflictConf = AIEngine.calculateFieldConfidence([srcA, srcB], true, true, true);
  assert(conflictConf.score < 70, `Expected lower confidence under conflict, got ${conflictConf.score}`);
  assert(conflictConf.rationale.summary.includes("Discrepancy"), "Expected conflict summary");
});

test("Validation", "Duplicate detector flags duplicate part numbers and groups variants", () => {
  const { headers, rows } = ParserEngine.parseCSV(PRODEXA_TEST_CATALOG_CSV);
  const mappings = ParserEngine.inferColumnMappings(headers, rows);
  const products = ParserEngine.buildProductsFromRows("test_ds", "prodexa_test_catalog.csv", headers, rows, mappings);
  const { duplicateMap, duplicateGroups } = AIEngine.detectDuplicates(products);

  assert(duplicateGroups.length >= 1, `Expected duplicate groups flagged, got ${duplicateGroups.length}`);
  const ps100Dups = products.filter(p => p.partNumber === "PS-100");
  assert(ps100Dups.length >= 2, "Expected at least 2 PS-100 records in demo dataset");
});

test("Validation", "Product Intelligence Score dynamically derived from 5 quality pillars", () => {
  const sampleAttrs = [
    { id: "1", name: "Pressure Range", value: "0-10 bar", status: "VERIFIED" as const, confidence: 98, sources: [], evidence: [{ id: "e1", sourceId: "s1", sourceName: "OEM", sourceType: "datasheet" as const, reliability: 98, matchType: "exact" as const, timestamp: new Date().toISOString() }] },
    { id: "2", name: "Supply Voltage", value: "24 V DC", status: "VERIFIED" as const, confidence: 96, sources: [], evidence: [{ id: "e2", sourceId: "s1", sourceName: "OEM", sourceType: "datasheet" as const, reliability: 98, matchType: "exact" as const, timestamp: new Date().toISOString() }] },
  ];
  const sources = [{ id: "s1", name: "OEM Datasheet", type: "datasheet" as const, reliability: 98 }];
  const score = AIEngine.calculateProductScore(sampleAttrs, sources, [], 0, 2);
  assert(score.score >= 90, `Expected score >=90, got ${score.score}`);
  assert(score.completeness === 100, `Expected 100% completeness, got ${score.completeness}`);
});

// ----------------------------------------------------------------
// 5. MISSING DATA RECOVERY & NORMALIZATION
// ----------------------------------------------------------------
console.log("\n[5/6] Running Missing Data Recovery & Normalization Tests...");

test("Normalization", "Normalizes pressure units, voltage, temperature, and materials per standards", () => {
  const normPressure = NormalizationEngine.normalize("Pressure Range", "10 bar");
  assert(normPressure.normalizedValue === "10 bar", `Expected '10 bar', got ${normPressure.normalizedValue}`);

  const normVolt = NormalizationEngine.normalize("Supply Voltage", "24VDC");
  assert(normVolt.normalizedValue.includes("24") && normVolt.normalizedValue.includes("V"), `Expected normalized voltage, got ${normVolt.normalizedValue}`);

  const normMaterial = NormalizationEngine.normalize("Wetted Material", "SS316");
  assert(normMaterial.normalizedValue.includes("Stainless Steel 316"), `Expected standardized steel alloy, got ${normMaterial.normalizedValue}`);
});

test("Recovery", "Find Missing Information retrieves engineering values with source evidence", () => {
  const dummyProduct: any = {
    id: "p_test",
    brand: "Acme Industrial",
    category: "Pressure Sensors",
    attributes: [],
  };
  const recovery = AIEngine.recoverMissingAttribute(dummyProduct, "Operating Temperature");
  assert(!!recovery.value, "Expected recovered value");
  assert(recovery.confidence >= 85, `Expected confidence >=85, got ${recovery.confidence}`);
  assert(recovery.sources.length >= 1, "Expected source citation attached");
});

// ----------------------------------------------------------------
// 6. EXPORT ENGINE & CATALOG STORE
// ----------------------------------------------------------------
console.log("\n[6/6] Running Export & Catalog Store Operations...");

test("Export", "Generates RFC-4180 CSV Export containing all attributes and provenance", () => {
  const products = catalogStore.getProducts();
  const csv = ExportEngine.generateCSV(products);
  assert(csv.length > 500, "Expected non-empty CSV output");
  assert(csv.includes("Part Number"), "CSV must include Part Number header");
  assert(csv.includes("Quality Score"), "CSV must include Quality Score header");
  assert(csv.includes("PS-100"), "CSV must include sample product PS-100");
});

test("Export", "Generates structured JSON Export with complete schema", () => {
  const products = catalogStore.getProducts();
  const jsonStr = ExportEngine.generateJSON(products);
  const parsed = JSON.parse(jsonStr);
  assert(parsed.exportMetadata.totalProducts === products.length, "Expected matching total product count in JSON");
  assert(Array.isArray(parsed.products), "Expected products array");
  assert(parsed.products[0].attributes.length >= 1, "Expected attribute objects in JSON");
});

test("Export", "Generates Excel Workbook XML structure (.xlsx compatible)", () => {
  const products = catalogStore.getProducts();
  const xml = ExportEngine.generateExcelWorkbook(products);
  assert(xml.includes("<Workbook"), "Expected XML Workbook header");
  assert(xml.includes("<Worksheet ss:Name=\"Product Catalog\">"), "Expected Product Catalog sheet");
  assert(xml.includes("<Worksheet ss:Name=\"Enriched Attributes\">"), "Expected Enriched Attributes sheet");
});

test("Store", "Resolving conflict updates attribute value and re-computes product status", () => {
  catalogStore.seedDefaultData();
  const cb220 = catalogStore.getProducts().find(p => p.partNumber === "CB-220");
  assert(cb220 !== undefined, "CB-220 must exist");
  assert(cb220?.conflicts.length === 1, "CB-220 must have open conflict");

  const confId = cb220!.conflicts[0].id;
  const resolved = catalogStore.resolveConflict(confId, "10 kA", "Test Lead");
  assert(resolved === true, "Expected resolveConflict to return true");

  const updatedCb220 = catalogStore.getProductById(cb220!.id);
  const resolvedConf = updatedCb220?.conflicts.find(c => c.id === confId);
  assert(resolvedConf?.status === "RESOLVED", "Conflict status must be RESOLVED");
  assert(resolvedConf?.resolvedValue === "10 kA", "Resolved value must be 10 kA");
});

// ----------------------------------------------------------------
// Summary
// ----------------------------------------------------------------
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log("\n========================================================");
console.log(`TEST SUMMARY: ${passed}/${total} PASSED (${failed} failed)`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
