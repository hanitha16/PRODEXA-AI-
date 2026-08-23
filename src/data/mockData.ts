export interface Product {
  id: string;
  name: string;
  category: string;
  partNumber: string;
  qualityScore: number;
  status: "ready" | "review" | "conflict" | "processing";
  lastUpdated: string;
  completeness: number;
  attributes: Attribute[];
  sources: Source[];
  history: HistoryEntry[];
}
export interface Attribute {
  id: string;
  name: string;
  value: string;
  unit?: string;
  status: "VERIFIED" | "NORMALIZED" | "AI DERIVED" | "UNCERTAIN" | "CONFLICT";
  confidence: number;
  sources: Source[];
  originalValue?: string;
}
export interface Source {
  id: string;
  name: string;
  type: "datasheet" | "website" | "distributor" | "manual";
  url: string;
  reliability: number;
}
export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}
export interface DashboardStats {
  totalProducts: number;
  processed: number;
  needsReview: number;
  avgQuality: number;
  trends: { totalDelta: number; processedDelta: number; reviewDelta: number; qualityDelta: number };
  qualityDistribution: { label: string; value: number; color: string }[];
  activityData: { day: string; processed: number; enriched: number; validated: number }[];
}
export interface DuplicateGroup {
  id: string;
  similarity: number;
  products: { id: string; partNumber: string; name: string }[];
  reason: string;
}

const sources: Source[] = [
  { id: "s1", name: "Official Datasheet", type: "datasheet", url: "#", reliability: 98 },
  { id: "s2", name: "Manufacturer Website", type: "website", url: "#", reliability: 95 },
  { id: "s3", name: "Authorized Distributor Page", type: "distributor", url: "#", reliability: 90 },
  { id: "s4", name: "Technical Manual v3.2", type: "manual", url: "#", reliability: 97 },
  { id: "s5", name: "Industry Catalog 2024", type: "datasheet", url: "#", reliability: 88 },
];
export const mockProducts: Product[] = [
  {
    id: "p1", name: "Industrial Centrifugal Pump", category: "Pumps", partNumber: "ICP-4500-SS",
    qualityScore: 92, status: "ready", lastUpdated: "2024-01-15T10:30:00Z", completeness: 94,
    attributes: [
      { id:"a1", name:"Product Name", value:"Industrial Centrifugal Pump", status:"VERIFIED", confidence:99, sources:[sources[0],sources[1],sources[2]] },
      { id:"a2", name:"Category", value:"Industrial Pumps", status:"NORMALIZED", confidence:95, sources:[sources[0],sources[1]] },
      { id:"a3", name:"Material", value:"Stainless Steel", originalValue:"SS", status:"AI DERIVED", confidence:98, sources:[sources[0],sources[3]] },
      { id:"a4", name:"Flow Rate", value:"100", unit:"L/min", status:"VERIFIED", confidence:97, sources:[sources[0],sources[1],sources[2]] },
      { id:"a5", name:"Voltage", value:"220", unit:"V", status:"VERIFIED", confidence:98, sources:[sources[0],sources[1],sources[2]] },
      { id:"a6", name:"Weight", value:"10", unit:"kg", status:"CONFLICT", confidence:72, sources:[sources[0],sources[3]] },
      { id:"a7", name:"Application", value:"Water Handling", status:"AI DERIVED", confidence:91, sources:[sources[1],sources[4]] },
      { id:"a8", name:"Max Pressure", value:"12", unit:"bar", status:"VERIFIED", confidence:96, sources:[sources[0],sources[1]] },
    ],
    sources: sources.slice(0,4),
    history: [
      { id:"h1", timestamp:"2024-01-15T10:30:00Z", action:"AI Extraction Completed", user:"PRODEXA AI" },
      { id:"h2", timestamp:"2024-01-15T10:35:00Z", action:"Material normalized", user:"PRODEXA AI", field:"Material", oldValue:"SS", newValue:"Stainless Steel" },
      { id:"h3", timestamp:"2024-01-15T11:00:00Z", action:"Conflict flagged on Weight", user:"PRODEXA AI" },
      { id:"h4", timestamp:"2024-01-15T14:20:00Z", action:"Weight conflict resolved", user:"John Martinez", field:"Weight", oldValue:"22 lb", newValue:"10 kg" },
    ]
  },
  {
    id: "p2", name: "Hydraulic Control Valve", category: "Hydraulic Valves", partNumber: "HCV-2200-BR",
    qualityScore: 78, status: "review", lastUpdated: "2024-01-14T08:15:00Z", completeness: 81,
    attributes: [
      { id:"b1", name:"Product Name", value:"Hydraulic Control Valve", status:"VERIFIED", confidence:99, sources:[sources[0],sources[1]] },
      { id:"b2", name:"Material", value:"Brass", status:"VERIFIED", confidence:94, sources:[sources[0]] },
      { id:"b3", name:"Max Pressure", value:"350", unit:"bar", status:"CONFLICT", confidence:68, sources:[sources[0],sources[3]] },
      { id:"b4", name:"Port Size", value:"1/2 inch", status:"NORMALIZED", confidence:92, sources:[sources[0],sources[1]] },
      { id:"b5", name:"Temperature Range", value:"-20 to 80 degC", status:"VERIFIED", confidence:95, sources:[sources[0]] },
    ],
    sources: sources.slice(0,3),
    history: [
      { id:"h5", timestamp:"2024-01-14T08:15:00Z", action:"AI Extraction Completed", user:"PRODEXA AI" },
      { id:"h6", timestamp:"2024-01-14T08:20:00Z", action:"Pressure conflict detected", user:"PRODEXA AI" },
    ]
  },
  {
    id: "p3", name: "Three-Phase Electric Motor", category: "Electric Motors", partNumber: "TEM-7500-IE3",
    qualityScore: 95, status: "ready", lastUpdated: "2024-01-13T16:45:00Z", completeness: 98,
    attributes: [
      { id:"c1", name:"Product Name", value:"Three-Phase Electric Motor", status:"VERIFIED", confidence:99, sources:[sources[0],sources[1],sources[2]] },
      { id:"c2", name:"Power Rating", value:"7.5", unit:"kW", status:"VERIFIED", confidence:99, sources:[sources[0],sources[1]] },
      { id:"c3", name:"Efficiency Class", value:"Premium Efficiency", status:"AI DERIVED", confidence:96, sources:[sources[0],sources[3]] },
      { id:"c4", name:"Speed", value:"1450", unit:"RPM", status:"VERIFIED", confidence:98, sources:[sources[0],sources[1],sources[2]] },
      { id:"c5", name:"Frame Size", value:"132M", status:"NORMALIZED", confidence:93, sources:[sources[0]] },
      { id:"c6", name:"IP Rating", value:"IP55", status:"VERIFIED", confidence:97, sources:[sources[0],sources[1]] },
    ],
    sources: sources.slice(0,4),
    history: [
      { id:"h7", timestamp:"2024-01-13T16:45:00Z", action:"AI Extraction Completed", user:"PRODEXA AI" },
      { id:"h8", timestamp:"2024-01-13T17:00:00Z", action:"All attributes validated", user:"PRODEXA AI" },
    ]
  },
  {
    id: "p4", name: "Industrial Pressure Sensor", category: "Pressure Sensors", partNumber: "IPS-600-SS",
    qualityScore: 88, status: "ready", lastUpdated: "2024-01-12T09:20:00Z", completeness: 91,
    attributes: [
      { id:"d1", name:"Product Name", value:"Industrial Pressure Sensor", status:"VERIFIED", confidence:99, sources:[sources[0],sources[1]] },
      { id:"d2", name:"Measurement Range", value:"0-600", unit:"bar", status:"VERIFIED", confidence:97, sources:[sources[0],sources[1]] },
      { id:"d3", name:"Output Signal", value:"4-20 mA", status:"NORMALIZED", confidence:95, sources:[sources[0]] },
      { id:"d4", name:"Accuracy", value:"+-0.5%", status:"VERIFIED", confidence:93, sources:[sources[0],sources[3]] },
      { id:"d5", name:"Process Connection", value:"G 1/2 inch", status:"UNCERTAIN", confidence:74, sources:[sources[4]] },
    ],
    sources: sources.slice(0,3),
    history: [ { id:"h9", timestamp:"2024-01-12T09:20:00Z", action:"AI Extraction Completed", user:"PRODEXA AI" } ]
  },
  {
    id: "p5", name: "High-Efficiency Industrial Filter", category: "Industrial Filters", partNumber: "HEF-2500-SS",
    qualityScore: 71, status: "conflict", lastUpdated: "2024-01-11T14:00:00Z", completeness: 74,
    attributes: [
      { id:"e1", name:"Product Name", value:"High-Efficiency Industrial Filter", status:"VERIFIED", confidence:99, sources:[sources[0]] },
      { id:"e2", name:"Filtration Rating", value:"5", unit:"micron", status:"CONFLICT", confidence:61, sources:[sources[0],sources[3]] },
      { id:"e3", name:"Flow Capacity", value:"2500", unit:"L/h", status:"UNCERTAIN", confidence:77, sources:[sources[4]] },
      { id:"e4", name:"Housing Material", value:"Stainless Steel 316L", originalValue:"SS316L", status:"AI DERIVED", confidence:94, sources:[sources[0]] },
    ],
    sources: [sources[0],sources[3],sources[4]],
    history: [
      { id:"h10", timestamp:"2024-01-11T14:00:00Z", action:"AI Extraction Completed", user:"PRODEXA AI" },
      { id:"h11", timestamp:"2024-01-11T14:05:00Z", action:"Multiple conflicts detected", user:"PRODEXA AI" },
    ]
  },
  {
    id: "p6", name: "Pneumatic Actuator", category: "Actuators", partNumber: "PNA-100-ALU",
    qualityScore: 84, status: "ready", lastUpdated: "2024-01-10T11:30:00Z", completeness: 87,
    attributes: [
      { id:"f1", name:"Product Name", value:"Pneumatic Actuator", status:"VERIFIED", confidence:99, sources:[sources[0],sources[1]] },
      { id:"f2", name:"Stroke Length", value:"100", unit:"mm", status:"VERIFIED", confidence:96, sources:[sources[0],sources[1]] },
      { id:"f3", name:"Operating Pressure", value:"2-10", unit:"bar", status:"NORMALIZED", confidence:92, sources:[sources[0]] },
      { id:"f4", name:"Body Material", value:"Aluminium", originalValue:"ALU", status:"AI DERIVED", confidence:97, sources:[sources[0],sources[3]] },
    ],
    sources: [sources[0],sources[1],sources[3]],
    history: [ { id:"h12", timestamp:"2024-01-10T11:30:00Z", action:"AI Extraction Completed", user:"PRODEXA AI" } ]
  },
];
export const mockDashboardStats: DashboardStats = {
  totalProducts: 1248, processed: 1086, needsReview: 96, avgQuality: 91.4,
  trends: { totalDelta: 4.2, processedDelta: 6.8, reviewDelta: -2.1, qualityDelta: 1.3 },
  qualityDistribution: [
    { label: "90-100", value: 642, color: "#22C55E" },
    { label: "70-89",  value: 321, color: "#3B82F6" },
    { label: "50-69",  value: 187, color: "#F59E0B" },
    { label: "< 50",   value: 98,  color: "#EF4444" },
  ],
  activityData: [
    { day: "Mon", processed: 128, enriched: 104, validated: 89 },
    { day: "Tue", processed: 152, enriched: 130, validated: 118 },
    { day: "Wed", processed: 98,  enriched: 86,  validated: 72 },
    { day: "Thu", processed: 175, enriched: 158, validated: 140 },
    { day: "Fri", processed: 210, enriched: 192, validated: 178 },
    { day: "Sat", processed: 87,  enriched: 74,  validated: 61 },
    { day: "Sun", processed: 64,  enriched: 52,  validated: 41 },
  ],
};
export const enrichmentTransformations = [
  { id: "t1", original: "SS",     standardized: "Stainless Steel",      confidence: 98, rationale: "SS is a widely recognized industrial abbreviation for Stainless Steel. Corroborated by 3 independent sources." },
  { id: "t2", original: "3PH",    standardized: "Three-Phase",          confidence: 96, rationale: "3PH is standard notation for Three-Phase electrical specification per IEC standards." },
  { id: "t3", original: "G1/2",   standardized: "G 1/2 inch BSP",       confidence: 94, rationale: "G prefix denotes British Standard Pipe thread standard per ISO 228-1. BSP appended for clarity." },
  { id: "t4", original: "IE3",    standardized: "Premium Efficiency",   confidence: 92, rationale: "IE3 corresponds to Premium Efficiency class per IEC 60034-30-1 motor efficiency classification standard." },
  { id: "t5", original: "SS316L", standardized: "Stainless Steel 316L", confidence: 97, rationale: "SS316L is a recognized industry code for low-carbon austenitic stainless steel grade per ASTM A240." },
];
export const validationIssues = {
  missing: [
    { id: "v1", product: "Hydraulic Control Valve", attribute: "Operating Temperature", severity: "medium" },
    { id: "v2", product: "Industrial Filter",       attribute: "Micron Rating",        severity: "high" },
    { id: "v3", product: "Pneumatic Actuator",      attribute: "Bore Diameter",        severity: "low" },
  ],
  conflicts: [
    { id: "c1", product: "Industrial Pump",         attribute: "Weight",           sourceA: { source: "Official Datasheet", value: "10 kg" },  sourceB: { source: "Technical Manual", value: "22 lb" }, confidence: 72 },
    { id: "c2", product: "Hydraulic Control Valve", attribute: "Max Pressure",     sourceA: { source: "Datasheet",          value: "350 bar" }, sourceB: { source: "Distributor Page", value: "320 bar" }, confidence: 68 },
    { id: "c3", product: "Industrial Filter",       attribute: "Filtration Rating", sourceA: { source: "Datasheet",          value: "5 micron" }, sourceB: { source: "Manual", value: "10 micron" }, confidence: 61 },
  ],
  standardized: [
    { id: "n1", attribute: "Material",         original: "SS",     normalized: "Stainless Steel" },
    { id: "n2", attribute: "Thread Standard",  original: "G1/2",   normalized: "G 1/2 inch BSP" },
    { id: "n3", attribute: "Efficiency Class", original: "IE3",    normalized: "Premium Efficiency (IE3)" },
    { id: "n4", attribute: "Body Material",    original: "SS316L", normalized: "Stainless Steel 316L" },
  ],
};
export const duplicateGroups: DuplicateGroup[] = [
  {
    id: "dup1", similarity: 96,
    reason: "Identical product with variant part number formatting (hyphen vs space vs no separator)",
    products: [
      { id: "dup1a", partNumber: "ABC123",   name: "Industrial Pump Model ABC123" },
      { id: "dup1b", partNumber: "ABC-123",  name: "Industrial Pump Model ABC-123" },
      { id: "dup1c", partNumber: "ABC 123",  name: "Industrial Pump ABC 123" },
    ]
  },
  {
    id: "dup2", similarity: 89,
    reason: "Same product listed under different category paths with minor name variations",
    products: [
      { id: "dup2a", partNumber: "HEF-2500-SS",   name: "High-Efficiency Industrial Filter" },
      { id: "dup2b", partNumber: "HEF2500-SS",    name: "High Efficiency Industrial Filter SS" },
    ]
  },
];
