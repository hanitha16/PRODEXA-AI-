// ============================================================
// PRODEXA AI — Master Type Definitions
// ============================================================

export type ValidationStatus = "VERIFIED" | "NORMALIZED" | "AI DERIVED" | "UNCERTAIN" | "CONFLICT" | "UNSUPPORTED";
export type ProductStatus = "ready" | "review" | "conflict" | "processing";
export type SourceType = "datasheet" | "website" | "distributor" | "manual" | "csv_upload" | "spec_sheet";
export type ConflictSeverity = "low" | "medium" | "high";
export type ConflictStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  url?: string;
  reliability: number; // 0 - 100
  rowNumber?: number;
  column?: string;
  rawText?: string;
}

export interface EvidenceEntry {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: SourceType;
  reliability: number;
  rowNumber?: number;
  column?: string;
  rawSnippet?: string;
  quote?: string;
  matchType: "exact" | "normalized" | "inferred" | "cross_referenced";
  timestamp: string;
}

export interface DecisionRationale {
  summary: string;
  factors: string[];
  sourceAgreement: string;
  standardApplied?: string;
  confidenceBreakdown: {
    sourceQuality: number;     // 30%
    crossAgreement: number;    // 30%
    extractionCertainty: number; // 20%
    completeness: number;      // 10%
    normalization: number;     // 10%
  };
}

export interface Attribute {
  id: string;
  name: string;
  value: string;
  rawValue?: string;
  unit?: string;
  status: ValidationStatus;
  confidence: number; // 0 - 100
  sources: Source[];
  evidence: EvidenceEntry[];
  originalValue?: string;
  rationale?: DecisionRationale;
  isMandatory?: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface ConflictRecord {
  id: string;
  productId: string;
  productName: string;
  partNumber: string;
  attributeName: string;
  valueA: string;
  sourceA: { source: string; value: string; reliability: number };
  valueB: string;
  sourceB: { source: string; value: string; reliability: number };
  severity: ConflictSeverity;
  status: ConflictStatus;
  confidence: number;
  resolvedValue?: string;
}

export interface LineageStep {
  stage: "Raw Input" | "Extracted Text" | "Normalized Value" | "Evidence Discovery" | "Cross Validation" | "Final Attribute";
  label: string;
  value: string;
  status: string;
  details: string;
}

export interface CommerceReadiness {
  score: number; // 0 - 100
  status: "COMMERCE READY" | "NEEDS REVIEW" | "INCOMPLETE";
  missingMandatory: string[];
  searchabilityScore: number;
  consistencyScore: number;
  traceabilityScore: number;
  details: string;
}

export interface DuplicateInfo {
  isDuplicate: boolean;
  similarity: number;
  duplicateOfPartNumber?: string;
  duplicateOfId?: string;
  reason: string;
  status: "flagged" | "merged" | "kept" | "dismissed";
}

export interface ProductQualityBreakdown {
  score: number;
  completeness: number;
  sourceQuality: number;
  consistency: number;
  confidence: number;
  traceability: number;
}

export interface Product {
  id: string;
  datasetId: string;
  jobId?: string;
  name: string;
  partNumber: string;
  normalizedPartNumber?: string;
  brand: string;
  manufacturer?: string;
  category: string;
  subcategory?: string;
  productFamily?: string;
  model?: string;
  description: string;
  enrichedDescription?: string;
  qualityScore: number; // 0 - 100 (Product Intelligence Score)
  status: ProductStatus;
  lastUpdated: string;
  completeness: number; // 0 - 100
  attributes: Attribute[];
  sources: Source[];
  history: HistoryEntry[];
  conflicts: ConflictRecord[];
  missingAttributes: string[];
  duplicateInfo?: DuplicateInfo;
  commerceReadiness: CommerceReadiness;
  sourceFileName?: string;
  sourceRowNumber?: number;
  beforeStats: {
    rawFieldsCount: number;
    rawMissingCount: number;
  };
}

export interface DuplicateGroup {
  id: string;
  similarity: number;
  reason: string;
  products: { id: string; partNumber: string; name: string; brand: string }[];
  status?: "flagged" | "merged" | "kept" | "dismissed";
}

export interface Dataset {
  id: string;
  name: string;
  type: "uploaded" | "demo";
  fileName: string;
  fileSize: string;
  fileType: string;
  createdAt: string;
  productCount: number;
  rawRows?: Record<string, string>[];
  headers?: string[];
}

export type ProcessingStageName = 
  | "QUEUED"
  | "PARSING"
  | "IDENTIFYING"
  | "CATEGORY_AI"
  | "EXTRACTING"
  | "NORMALIZING"
  | "VALIDATING"
  | "CONFIDENCE_SCORING"
  | "DUPLICATE_CHECK"
  | "COMMERCE_READINESS"
  | "COMPLETED"
  | "FAILED";

export interface ProcessingJob {
  id: string;
  datasetId: string;
  fileName: string;
  totalProducts: number;
  processedProducts: number;
  successful: number;
  needsReview: number;
  failed: number;
  status: "queued" | "processing" | "completed" | "failed";
  currentStageIndex: number;
  currentStageName: string;
  startedAt: string;
  completedAt?: string;
}

export interface ColumnMapping {
  rawHeader: string;
  mappedField: "partNumber" | "brand" | "name" | "description" | "category" | "voltage" | "pressureRange" | "flowRate" | "material" | "outputOrActuation" | "current" | "power" | "temperatureRange" | "ipRating" | "custom" | "ignore";
  targetAttributeName?: string;
  confidence: number;
  sampleValue?: string;
  status: "auto_mapped" | "manual" | "ignored";
}

export interface DashboardStats {
  totalProducts: number;
  processed: number;
  needsReview: number;
  avgQuality: number;
  verifiedAttributes: number;
  missingAttributes: number;
  conflictsDetected: number;
  possibleDuplicates: number;
  commerceReadyCount: number;
  trends: { totalDelta: number; processedDelta: number; reviewDelta: number; qualityDelta: number };
  qualityDistribution: { label: string; value: number; color: string }[];
  activityData: { day: string; processed: number; enriched: number; validated: number }[];
}
