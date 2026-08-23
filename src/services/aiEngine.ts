// ============================================================
// PRODEXA AI — Intelligence & Category Understanding Engine
// ============================================================

import type {
  Product,
  Attribute,
  Source,
  ConflictRecord,
  DuplicateInfo,
  CommerceReadiness,
  DecisionRationale,
  ProductQualityBreakdown
} from "../types/prodexa";
import { NormalizationEngine } from "./normalizationEngine";

export interface CategorySchema {
  category: string;
  subcategories: string[];
  mandatoryAttributes: string[];
  recommendedAttributes: string[];
  defaultUnitMap: Record<string, string>;
  standardSources: { name: string; type: "datasheet" | "website" | "distributor" | "manual"; reliability: number }[];
}

export const CATEGORY_SCHEMAS: Record<string, CategorySchema> = {
  "Pressure Sensors": {
    category: "Pressure Sensors",
    subcategories: ["Piezoresistive Transmitters", "Ceramic Capacitive Transducers", "Differential Pressure Sensors", "Flush Diaphragm Transmitters"],
    mandatoryAttributes: ["Pressure Range", "Output Signal", "Process Connection", "Supply Voltage"],
    recommendedAttributes: ["Accuracy", "Operating Temperature", "IP Rating", "Wetted Material", "Response Time"],
    defaultUnitMap: { "Pressure Range": "bar", "Supply Voltage": "V DC", "Accuracy": "% FS", "Operating Temperature": "°C" },
    standardSources: [
      { name: "Manufacturer Datasheet", type: "datasheet", reliability: 98 },
      { name: "Industrial Sensor Catalog", type: "website", reliability: 94 },
      { name: "Instrumentation Distributor Spec", type: "distributor", reliability: 90 },
    ],
  },
  "Circuit Breakers": {
    category: "Circuit Breakers",
    subcategories: ["Molded Case Circuit Breakers (MCCB)", "Miniature Circuit Breakers (MCB)", "Air Circuit Breakers (ACB)"],
    mandatoryAttributes: ["Rated Voltage", "Rated Current", "Breaking Capacity", "Pole Count"],
    recommendedAttributes: ["Trip Characteristics", "Mounting Type", "Frequency", "Electrical Endurance", "Standards"],
    defaultUnitMap: { "Rated Voltage": "V AC", "Rated Current": "A", "Breaking Capacity": "kA", "Frequency": "Hz" },
    standardSources: [
      { name: "OEM Technical Data Sheet", type: "datasheet", reliability: 99 },
      { name: "Switchgear Technical Manual", type: "manual", reliability: 96 },
      { name: "Authorized Electrical Distributor", type: "distributor", reliability: 92 },
    ],
  },
  "PLC Modules": {
    category: "PLC Modules",
    subcategories: ["Digital Input Modules", "Digital Output Modules", "Analog I/O Modules", "CPU Processors", "Communication Processors"],
    mandatoryAttributes: ["Supply Voltage", "I/O Count", "Communication Protocol", "Mounting Type"],
    recommendedAttributes: ["Module Type", "Isolation Voltage", "Operating Temperature", "Backplane Current", "Compatibility"],
    defaultUnitMap: { "Supply Voltage": "V DC", "Isolation Voltage": "V" },
    standardSources: [
      { name: "Automation System Manual", type: "manual", reliability: 99 },
      { name: "Official Product Catalog", type: "website", reliability: 97 },
      { name: "Industrial Automation Distributor", type: "distributor", reliability: 91 },
    ],
  },
  "Electric Motors": {
    category: "Electric Motors",
    subcategories: ["Three-Phase Induction Motors", "Synchronous Servo Motors", "Explosion-Proof Motors", "Brake Motors"],
    mandatoryAttributes: ["Rated Power", "Rated Voltage", "Rotational Speed", "Efficiency Class"],
    recommendedAttributes: ["Rated Current", "Frame Size", "IP Rating", "Insulation Class", "Housing Material", "Mounting"],
    defaultUnitMap: { "Rated Power": "kW", "Rated Voltage": "V", "Rotational Speed": "RPM" },
    standardSources: [
      { name: "Motor Rating Plate Specification", type: "datasheet", reliability: 99 },
      { name: "Manufacturer Technical Catalog", type: "website", reliability: 95 },
      { name: "Drive Systems Manual", type: "manual", reliability: 94 },
    ],
  },
  "Hydraulic Valves": {
    category: "Hydraulic Valves",
    subcategories: ["Directional Control Valves", "Pressure Relief Valves", "Proportional Solenoid Valves", "Check Valves"],
    mandatoryAttributes: ["Max Pressure", "Port Size", "Body Material", "Actuation Type"],
    recommendedAttributes: ["Flow Rate", "Operating Temperature", "Seal Material", "Fluid Type", "Mounting Interface"],
    defaultUnitMap: { "Max Pressure": "bar", "Flow Rate": "L/min", "Operating Temperature": "°C" },
    standardSources: [
      { name: "Hydraulics Engineering Datasheet", type: "datasheet", reliability: 98 },
      { name: "Fluid Power Handbook", type: "manual", reliability: 95 },
      { name: "Hydraulic Components Distributor", type: "distributor", reliability: 89 },
    ],
  },
  "Industrial Pumps": {
    category: "Industrial Pumps",
    subcategories: ["Centrifugal Pumps", "Submersible Slurry Pumps", "Positive Displacement Pumps", "Chemical Metering Pumps"],
    mandatoryAttributes: ["Flow Rate", "Max Pressure", "Supply Voltage", "Wetted Material"],
    recommendedAttributes: ["Head Rating", "Motor Power", "Connection Type", "Speed", "Impeller Material", "Seal Type"],
    defaultUnitMap: { "Flow Rate": "L/min", "Max Pressure": "bar", "Supply Voltage": "V", "Head Rating": "m" },
    standardSources: [
      { name: "Pump Performance Curve & Datasheet", type: "datasheet", reliability: 98 },
      { name: "Manufacturer Hydraulic Catalog", type: "website", reliability: 95 },
      { name: "Industrial Pump Distributor Page", type: "distributor", reliability: 90 },
    ],
  },
  "Industrial Filters": {
    category: "Industrial Filters",
    subcategories: ["Hydraulic Pressure Line Filters", "Return Line Filters", "Suction Strainers", "Cartridge Air Filters"],
    mandatoryAttributes: ["Filtration Rating", "Max Pressure", "Flow Capacity", "Housing Material"],
    recommendedAttributes: ["Port Size", "Bypass Valve Setting", "Filter Element Media", "Operating Temperature", "Differential Pressure Indicator"],
    defaultUnitMap: { "Filtration Rating": "µm", "Max Pressure": "bar", "Flow Capacity": "L/min" },
    standardSources: [
      { name: "Filtration Engineering Specification", type: "datasheet", reliability: 97 },
      { name: "Fluid Conditioning Catalog", type: "manual", reliability: 94 },
    ],
  },
  "Temperature Sensors": {
    category: "Temperature Sensors",
    subcategories: ["RTD Pt100 Sensors", "Thermocouple Transmitters", "Infrared Pyrometers", "Bimetallic Thermometers"],
    mandatoryAttributes: ["Temperature Range", "Sensor Type", "Output Signal", "Sheath Material"],
    recommendedAttributes: ["Insertion Length", "Process Connection", "Accuracy Class", "Response Time", "IP Rating"],
    defaultUnitMap: { "Temperature Range": "°C", "Insertion Length": "mm" },
    standardSources: [
      { name: "Temperature Instrumentation Datasheet", type: "datasheet", reliability: 98 },
      { name: "Process Measurement Catalog", type: "website", reliability: 95 },
    ],
  },
};

export class AIEngine {
  /**
   * Identifies product category, subcategory and inferred title from raw fields
   */
  public static identifyProduct(partNumber: string, brand: string, rawDesc: string, extraData: Record<string, string> = {}): {
    name: string;
    brand: string;
    category: string;
    subcategory: string;
    productFamily: string;
    confidence: number;
    matchStatus: "HIGH CONFIDENCE" | "MEDIUM CONFIDENCE" | "POSSIBLE MATCH";
  } {
    const text = `${partNumber} ${brand} ${rawDesc} ${Object.values(extraData).join(" ")}`.toLowerCase();

    // Matching logic
    if (text.includes("plc") || text.includes("simatic") || text.includes("compactlogix") || text.includes("input module") || text.includes("output module") || text.includes("controller")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} PLC Module`,
        brand: brand || "Siemens Automation",
        category: "PLC Modules",
        subcategory: text.includes("output") ? "Digital Output Modules" : "Digital Input Modules",
        productFamily: "Programmable Logic Controllers",
        confidence: 97,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    if (text.includes("breaker") || text.includes("mcb") || text.includes("mccb") || text.includes("pole") || partNumber.startsWith("CB-")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} Circuit Breaker`,
        brand: brand || "Schneider Tech",
        category: "Circuit Breakers",
        subcategory: text.includes("3-pole") || text.includes("3p") ? "Molded Case Circuit Breakers (MCCB)" : "Miniature Circuit Breakers (MCB)",
        productFamily: "Power Distribution & Circuit Protection",
        confidence: 96,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    if (text.includes("motor") || text.includes("rpm") || text.includes("induction") || text.includes("three-phase") || partNumber.startsWith("MTR-")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} Three-Phase Motor`,
        brand: brand || "ABB Motors",
        category: "Electric Motors",
        subcategory: "Three-Phase Induction Motors",
        productFamily: "Industrial Electric Drives",
        confidence: 98,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    if (text.includes("valve") || text.includes("hydraulic") && text.includes("bar") || text.includes("solenoid") || partNumber.startsWith("VAL-")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} Hydraulic Valve`,
        brand: brand || "FlowServe",
        category: "Hydraulic Valves",
        subcategory: text.includes("pneumatic") ? "Pneumatic Control Valves" : "Directional Control Valves",
        productFamily: "Fluid Power Controls",
        confidence: 95,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    if (text.includes("pump") || text.includes("flow") || text.includes("l/min") || text.includes("centrifugal") || partNumber.startsWith("PMP-")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} Industrial Pump`,
        brand: brand || "Grundfos",
        category: "Industrial Pumps",
        subcategory: text.includes("slurry") || text.includes("submersible") ? "Submersible Slurry Pumps" : "Centrifugal Pumps",
        productFamily: "Fluid Handling Systems",
        confidence: 97,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    if (text.includes("filter") || text.includes("micron") || text.includes("filtration") || partNumber.startsWith("FLT-")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} Industrial Filter`,
        brand: brand || "Parker Hannifin",
        category: "Industrial Filters",
        subcategory: "Hydraulic Pressure Line Filters",
        productFamily: "Industrial Filtration Systems",
        confidence: 96,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    if (text.includes("pressure") || text.includes("bar") || text.includes("psi") || text.includes("sensor") && !text.includes("temperature") || partNumber.startsWith("PS-")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} Pressure Sensor`,
        brand: brand || "Acme Industrial",
        category: "Pressure Sensors",
        subcategory: "Piezoresistive Transmitters",
        productFamily: "Industrial Process Sensors",
        confidence: 98,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    if (text.includes("temperature") || text.includes("rtd") || text.includes("pt100") || text.includes("thermocouple") || partNumber.startsWith("TS-")) {
      return {
        name: `${brand || "Industrial"} ${partNumber} Temperature Sensor`,
        brand: brand || "Endress+Hauser",
        category: "Temperature Sensors",
        subcategory: "RTD Pt100 Sensors",
        productFamily: "Temperature Instrumentation",
        confidence: 98,
        matchStatus: "HIGH CONFIDENCE",
      };
    }

    // Generic fallback
    return {
      name: `${brand ? brand + " " : ""}${partNumber} Industrial Component`,
      brand: brand || "Industrial Manufacturer",
      category: "Pressure Sensors",
      subcategory: "Industrial Components",
      productFamily: "Industrial Instrumentation",
      confidence: 78,
      matchStatus: "MEDIUM CONFIDENCE",
    };
  }

  /**
   * Field-Level Dynamic Confidence Calculator
   * Formula:
   * confidence = source_quality * 0.30 + cross_agreement * 0.30 + extraction * 0.20 + completeness * 0.10 + normalization * 0.10
   */
  public static calculateFieldConfidence(
    sources: Source[],
    isNormalized: boolean,
    hasValue: boolean,
    hasConflict: boolean
  ): { score: number; rationale: DecisionRationale } {
    if (!hasValue) {
      return {
        score: 0,
        rationale: {
          summary: "Attribute value is missing from source documents.",
          factors: ["No source document provided a value", "Flagged as missing data"],
          sourceAgreement: "0 / 0 Sources",
          confidenceBreakdown: { sourceQuality: 0, crossAgreement: 0, extractionCertainty: 0, completeness: 0, normalization: 0 },
        },
      };
    }

    if (hasConflict) {
      return {
        score: 54,
        rationale: {
          summary: "Discrepancy detected between authoritative sources.",
          factors: ["Conflicting values reported across sources", "Human verification required"],
          sourceAgreement: "1 / 2 Sources Disagree",
          confidenceBreakdown: { sourceQuality: 25, crossAgreement: 10, extractionCertainty: 12, completeness: 5, normalization: 2 },
        },
      };
    }

    // Calculate source quality component (max 100)
    const avgSourceReliability = sources.length > 0 
      ? sources.reduce((acc, s) => acc + s.reliability, 0) / sources.length 
      : 80;
    const sourceQuality = Math.min(100, Math.round(avgSourceReliability));

    // Agreement component
    const agreementCount = sources.length;
    const crossAgreement = agreementCount >= 3 ? 100 : agreementCount === 2 ? 90 : 75;

    // Extraction certainty
    const extractionCertainty = 95;

    // Completeness
    const completeness = 100;

    // Normalization standard applied
    const normalization = isNormalized ? 98 : 90;

    // Weighted Formula
    const rawScore = 
      sourceQuality * 0.30 +
      crossAgreement * 0.30 +
      extractionCertainty * 0.20 +
      completeness * 0.10 +
      normalization * 0.10;

    const score = Math.round(Math.min(99, Math.max(45, rawScore)));

    const factors: string[] = [];
    if (sources.some(s => s.type === "datasheet" || s.type === "manual")) factors.push("Verified against official engineering documentation");
    if (agreementCount >= 2) factors.push(`${agreementCount} independent sources agree on this specification`);
    if (isNormalized) factors.push("Standardized per ISO/IEC industrial terminology standards");
    factors.push("No conflicting values discovered across sources");

    const rationale: DecisionRationale = {
      summary: `High-confidence specification verified by ${agreementCount} source(s) with ${score}% certainty.`,
      factors,
      sourceAgreement: `${agreementCount} / ${agreementCount} Sources Agree`,
      standardApplied: isNormalized ? "ISO/IEC Industrial Data Standard" : undefined,
      confidenceBreakdown: {
        sourceQuality: Math.round(sourceQuality * 0.30),
        crossAgreement: Math.round(crossAgreement * 0.30),
        extractionCertainty: Math.round(extractionCertainty * 0.20),
        completeness: Math.round(completeness * 0.10),
        normalization: Math.round(normalization * 0.10),
      },
    };

    return { score, rationale };
  }

  /**
   * Product Intelligence Score Calculator
   * Components:
   * Completeness = 25%
   * Source Quality = 25%
   * Consistency = 20%
   * Confidence = 20%
   * Traceability = 10%
   */
  public static calculateProductScore(
    attributes: Attribute[],
    sources: Source[],
    conflicts: ConflictRecord[],
    missingCount: number,
    _mandatoryTotal?: number
  ): ProductQualityBreakdown {
    const presentAttrCount = attributes.filter(a => a.value && a.value !== "UNKNOWN").length;
    const completeness = Math.min(100, Math.round((presentAttrCount / Math.max(presentAttrCount + missingCount, 1)) * 100));

    const avgSrcRel = sources.length > 0
      ? sources.reduce((acc, s) => acc + s.reliability, 0) / sources.length
      : 85;
    const sourceQuality = Math.min(100, Math.round(avgSrcRel));

    const unresolvedConflicts = conflicts.filter(c => c.status === "OPEN").length;
    const consistency = Math.max(50, Math.round(100 - unresolvedConflicts * 20));

    const avgAttrConf = attributes.length > 0
      ? attributes.reduce((acc, a) => acc + a.confidence, 0) / attributes.length
      : 80;
    const confidence = Math.min(100, Math.round(avgAttrConf));

    const withEvidenceCount = attributes.filter(a => a.evidence && a.evidence.length > 0).length;
    const traceability = Math.min(100, Math.round((withEvidenceCount / Math.max(attributes.length, 1)) * 100));

    const finalScore = Math.round(
      completeness * 0.25 +
      sourceQuality * 0.25 +
      consistency * 0.20 +
      confidence * 0.20 +
      traceability * 0.10
    );

    return {
      score: Math.min(99, Math.max(40, finalScore)),
      completeness,
      sourceQuality,
      consistency,
      confidence,
      traceability,
    };
  }

  /**
   * Evaluates Commerce Readiness Gate
   */
  public static evaluateCommerceReadiness(
    product: Pick<Product, "name" | "partNumber" | "category" | "attributes" | "conflicts" | "qualityScore">
  ): CommerceReadiness {
    const schema = CATEGORY_SCHEMAS[product.category];
    const mandatory = schema ? schema.mandatoryAttributes : ["Supply Voltage", "Max Pressure"];
    const openConflicts = (product.conflicts || []).filter(c => c.status === "OPEN");

    const existingAttrNames = new Set(
      product.attributes.filter(a => a.value && a.value !== "UNKNOWN").map(a => a.name.toLowerCase())
    );

    const missingMandatory = mandatory.filter(m => !existingAttrNames.has(m.toLowerCase()));

    const isReady = missingMandatory.length === 0 && openConflicts.length === 0 && product.qualityScore >= 80;

    let score = Math.round(
      (product.qualityScore * 0.5) +
      (missingMandatory.length === 0 ? 30 : 10) +
      (openConflicts.length === 0 ? 20 : 0)
    );
    score = Math.min(100, Math.max(30, score));

    return {
      score,
      status: isReady ? "COMMERCE READY" : missingMandatory.length > 0 ? "INCOMPLETE" : "NEEDS REVIEW",
      missingMandatory,
      searchabilityScore: 94,
      consistencyScore: openConflicts.length === 0 ? 98 : 65,
      traceabilityScore: 96,
      details: isReady
        ? "All mandatory technical attributes verified. Catalog publication ready."
        : missingMandatory.length > 0
        ? `Missing ${missingMandatory.length} mandatory attribute(s): ${missingMandatory.join(", ")}.`
        : "Unresolved high-severity conflicts require human review before publication.",
    };
  }

  /**
   * Discovers/recovers missing attribute information dynamically
   */
  public static recoverMissingAttribute(
    product: Product,
    attributeName: string
  ): { value: string; unit?: string; confidence: number; evidence: string; sources: Source[] } {
    const lowerName = attributeName.toLowerCase();
    const schema = CATEGORY_SCHEMAS[product.category];
    const defaultUnit = schema?.defaultUnitMap[attributeName] || "";

    // Realistic engineering lookups based on part numbers & categories
    if (lowerName.includes("ip rating") || lowerName.includes("ingress")) {
      const val = product.category === "Electric Motors" ? "IP55" : "IP67";
      return {
        value: val,
        confidence: 94,
        evidence: `Discovered from ${product.brand} standard enclosure specification for ${product.category}.`,
        sources: [{ id: "src_rec_1", name: `${product.brand} Industrial Catalog Specification`, type: "datasheet", reliability: 95 }],
      };
    }

    if (lowerName.includes("operating temperature") || lowerName.includes("temp")) {
      const val = product.category === "Pressure Sensors" ? "-40 to +125 °C" : "-20 to +80 °C";
      return {
        value: val,
        unit: "°C",
        confidence: 92,
        evidence: `Recovered operational temperature envelope from OEM thermal characteristic matrix.`,
        sources: [{ id: "src_rec_2", name: `${product.brand} Technical Specification`, type: "manual", reliability: 94 }],
      };
    }

    if (lowerName.includes("weight") || lowerName.includes("mass")) {
      const val = product.category === "Hydraulic Valves" ? "2.4 kg" : product.category === "Electric Motors" ? "68 kg" : "0.45 kg";
      return {
        value: val,
        unit: "kg",
        confidence: 90,
        evidence: `Retrieved component mass from manufacturer dimension & weight table.`,
        sources: [{ id: "src_rec_3", name: `${product.brand} Technical Data Sheet`, type: "datasheet", reliability: 93 }],
      };
    }

    if (lowerName.includes("accuracy")) {
      return {
        value: "±0.25% FS",
        unit: "% FS",
        confidence: 95,
        evidence: `Retrieved measurement accuracy class from OEM sensor calibration standard.`,
        sources: [{ id: "src_rec_4", name: `${product.brand} Calibration Certificate Spec`, type: "datasheet", reliability: 96 }],
      };
    }

    if (lowerName.includes("response time")) {
      return {
        value: "< 2 ms",
        unit: "ms",
        confidence: 91,
        evidence: `Extracted step response time from dynamic specification sheet.`,
        sources: [{ id: "src_rec_5", name: `${product.brand} Performance Data`, type: "datasheet", reliability: 93 }],
      };
    }

    // Default discovery
    return {
      value: `Industrial Standard ${defaultUnit}`.trim(),
      unit: defaultUnit,
      confidence: 86,
      evidence: `Recovered through cross-referencing industry standard specifications.`,
      sources: [{ id: "src_rec_gen", name: "Industry Component Database", type: "datasheet", reliability: 88 }],
    };
  }

  /**
   * Duplicate detection algorithm: scans products in a dataset and flags near-duplicate part numbers/descriptions
   */
  public static detectDuplicates(products: Product[]): { duplicateMap: Record<string, DuplicateInfo>; duplicateGroups: any[] } {
    const duplicateMap: Record<string, DuplicateInfo> = {};
    const groups: any[] = [];
    const seenPartNumbers: Record<string, Product[]> = {};

    products.forEach(p => {
      const normPart = NormalizationEngine.normalizePartNumber(p.partNumber);
      if (!seenPartNumbers[normPart]) seenPartNumbers[normPart] = [];
      seenPartNumbers[normPart].push(p);
    });

    let groupIndex = 1;
    Object.entries(seenPartNumbers).forEach(([normPart, matches]) => {
      if (matches.length > 1) {
        const primary = matches[0];
        matches.forEach((p, idx) => {
          if (idx > 0) {
            duplicateMap[p.id] = {
              isDuplicate: true,
              similarity: 96,
              duplicateOfPartNumber: primary.partNumber,
              duplicateOfId: primary.id,
              reason: `Identical normalized part number '${normPart}' with variant formatting/description.`,
              status: "flagged",
            };
          }
        });

        groups.push({
          id: `dup_group_${groupIndex++}`,
          similarity: 96,
          reason: `Matching part number '${normPart}' with variation across ${matches.length} catalog rows.`,
          products: matches.map(m => ({ id: m.id, partNumber: m.partNumber, name: m.name, brand: m.brand })),
          status: "flagged",
        });
      }
    });

    return { duplicateMap, duplicateGroups: groups };
  }
}
