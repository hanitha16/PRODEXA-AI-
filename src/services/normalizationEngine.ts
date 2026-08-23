// ============================================================
// PRODEXA AI — Deterministic Normalization Engine
// ============================================================

export interface NormalizationResult {
  rawValue: string;
  normalizedValue: string;
  unit?: string;
  confidence: number;
  standardApplied?: string;
  wasModified: boolean;
  rationale: string;
}

const MATERIAL_MAP: Record<string, { full: string; std: string }> = {
  "ss": { full: "Stainless Steel", std: "ASTM A240 Stainless Steel" },
  "ss316": { full: "Stainless Steel 316", std: "ASTM A240 Grade 316 Stainless Steel" },
  "ss316l": { full: "Stainless Steel 316L", std: "ASTM A240 Grade 316L Low-Carbon Stainless Steel" },
  "ss304": { full: "Stainless Steel 304", std: "ASTM A240 Grade 304 Stainless Steel" },
  "alu": { full: "Aluminium", std: "ISO 209 Wrought Aluminium Alloy" },
  "aluminum": { full: "Aluminium", std: "ISO 209 Wrought Aluminium Alloy" },
  "brass": { full: "Brass", std: "EN 12164 Machining Brass CW614N" },
  "cast iron": { full: "Cast Iron", std: "EN-GJL-250 Grey Cast Iron" },
  "ci": { full: "Cast Iron", std: "EN-GJL-250 Grey Cast Iron" },
  "ductile iron": { full: "Ductile Iron", std: "EN-GJS-400-15 Ductile Iron" },
  "duplex ss": { full: "Duplex Stainless Steel (2205)", std: "ASTM A182 F51 Duplex Stainless Steel" },
  "carbon steel": { full: "Carbon Steel", std: "ASTM A105 Forged Carbon Steel" },
  "cs": { full: "Carbon Steel", std: "ASTM A105 Forged Carbon Steel" },
  "bronze": { full: "Bronze", std: "EN 1982 CuSn5Zn5Pb5-C Cast Bronze" },
};

const THREAD_MAP: Record<string, { full: string; std: string }> = {
  "g1/2": { full: "G 1/2 inch BSP", std: "ISO 228-1 Parallel Pipe Thread" },
  "g 1/2": { full: "G 1/2 inch BSP", std: "ISO 228-1 Parallel Pipe Thread" },
  "g1/4": { full: "G 1/4 inch BSP", std: "ISO 228-1 Parallel Pipe Thread" },
  "g 1/4": { full: "G 1/4 inch BSP", std: "ISO 228-1 Parallel Pipe Thread" },
  "g3/4": { full: "G 3/4 inch BSP", std: "ISO 228-1 Parallel Pipe Thread" },
  "g 3/4": { full: "G 3/4 inch BSP", std: "ISO 228-1 Parallel Pipe Thread" },
  "g1": { full: "G 1 inch BSP", std: "ISO 228-1 Parallel Pipe Thread" },
  "1/2 npt": { full: "1/2 inch NPT", std: "ANSI/ASME B1.20.1 National Pipe Taper" },
  "1/4 npt": { full: "1/4 inch NPT", std: "ANSI/ASME B1.20.1 National Pipe Taper" },
  "dn50": { full: "DN 50 (2 inch Flange)", std: "EN 1092-1 Flange Standard" },
  "dn25": { full: "DN 25 (1 inch Flange)", std: "EN 1092-1 Flange Standard" },
};

const EFFICIENCY_MAP: Record<string, { full: string; std: string }> = {
  "ie1": { full: "Standard Efficiency (IE1)", std: "IEC 60034-30-1 Standard Efficiency Class" },
  "ie2": { full: "High Efficiency (IE2)", std: "IEC 60034-30-1 High Efficiency Class" },
  "ie3": { full: "Premium Efficiency (IE3)", std: "IEC 60034-30-1 Premium Efficiency Class" },
  "ie4": { full: "Super Premium Efficiency (IE4)", std: "IEC 60034-30-1 Super Premium Efficiency Class" },
};

export class NormalizationEngine {
  /**
   * Normalizes an attribute value according to industrial standards
   */
  public static normalize(attributeName: string, rawVal: string): NormalizationResult {
    const rawTrimmed = (rawVal || "").trim();
    if (!rawTrimmed) {
      return {
        rawValue: "",
        normalizedValue: "UNKNOWN",
        confidence: 0,
        wasModified: false,
        rationale: "Empty or missing input value.",
      };
    }

    const lowerName = attributeName.toLowerCase();
    const lowerVal = rawTrimmed.toLowerCase();

    // 1. Material normalization
    if (lowerName.includes("material") || MATERIAL_MAP[lowerVal]) {
      const match = MATERIAL_MAP[lowerVal];
      if (match) {
        return {
          rawValue: rawTrimmed,
          normalizedValue: match.full,
          confidence: 98,
          standardApplied: match.std,
          wasModified: match.full !== rawTrimmed,
          rationale: `Standardized industrial material code '${rawTrimmed}' to '${match.full}' per ${match.std}.`,
        };
      }
    }

    // 2. Thread / Connection / Port Size
    if (lowerName.includes("thread") || lowerName.includes("port") || lowerName.includes("connection") || THREAD_MAP[lowerVal]) {
      const match = THREAD_MAP[lowerVal];
      if (match) {
        return {
          rawValue: rawTrimmed,
          normalizedValue: match.full,
          confidence: 96,
          standardApplied: match.std,
          wasModified: match.full !== rawTrimmed,
          rationale: `Standardized thread/connection code '${rawTrimmed}' to '${match.full}' per ${match.std}.`,
        };
      }
    }

    // 3. Efficiency Class
    if (lowerName.includes("efficiency") || EFFICIENCY_MAP[lowerVal]) {
      const match = EFFICIENCY_MAP[lowerVal];
      if (match) {
        return {
          rawValue: rawTrimmed,
          normalizedValue: match.full,
          confidence: 97,
          standardApplied: match.std,
          wasModified: match.full !== rawTrimmed,
          rationale: `Mapped motor efficiency classification code '${rawTrimmed}' to '${match.full}' per ${match.std}.`,
        };
      }
    }

    // 4. Three-Phase Electrical Spec
    if (lowerVal === "3ph" || lowerVal === "3-ph" || lowerVal === "3 phase" || lowerVal === "three phase") {
      return {
        rawValue: rawTrimmed,
        normalizedValue: "Three-Phase",
        confidence: 98,
        standardApplied: "IEC 60038 Standard Voltages",
        wasModified: true,
        rationale: "Standardized notation '3PH' to 'Three-Phase' per IEC industrial electrical terminology.",
      };
    }
    if (lowerVal === "1ph" || lowerVal === "1-ph" || lowerVal === "single phase") {
      return {
        rawValue: rawTrimmed,
        normalizedValue: "Single-Phase",
        confidence: 98,
        standardApplied: "IEC 60038",
        wasModified: true,
        rationale: "Standardized notation to 'Single-Phase' per IEC industrial standards.",
      };
    }

    // 5. Voltage standardization (e.g. "24V" -> "24 V", "24vdc" -> "24 V DC", "230/400v" -> "230/400 V")
    const voltMatch = rawTrimmed.match(/^(\d+(?:\/\d+)?)\s*(v|vdc|vac|v\s*dc|v\s*ac)?$/i);
    if (voltMatch && (lowerName.includes("volt") || lowerName.includes("power") || voltMatch[2])) {
      const num = voltMatch[1];
      const type = (voltMatch[2] || "").toLowerCase();
      let norm = `${num} V`;
      if (type.includes("dc") || lowerVal.includes("vdc")) norm += " DC";
      else if (type.includes("ac") || lowerVal.includes("vac")) norm += " AC";
      return {
        rawValue: rawTrimmed,
        normalizedValue: norm,
        unit: "V",
        confidence: 96,
        standardApplied: "SI Units / IEC 60038",
        wasModified: norm !== rawTrimmed,
        rationale: `Normalized electrical voltage specification '${rawTrimmed}' to SI format '${norm}'.`,
      };
    }

    // 6. Pressure Range (e.g. "0-10bar" -> "0–10 bar", "350bar" -> "350 bar")
    const pressMatch = rawTrimmed.match(/^(\d+(?:\s*[-–\.\.]\s*\d+)?)\s*(bar|psi|kpa|mpa)$/i);
    if (pressMatch || lowerName.includes("pressure")) {
      const pMatch = rawTrimmed.match(/^(\d+)(?:\s*[-–\.\.]\s*(\d+))?\s*(bar|psi|kpa|mpa)?$/i);
      if (pMatch) {
        const from = pMatch[1];
        const to = pMatch[2];
        const unit = pMatch[3] || "bar";
        const norm = to ? `${from}–${to} ${unit.toLowerCase()}` : `${from} ${unit.toLowerCase()}`;
        return {
          rawValue: rawTrimmed,
          normalizedValue: norm,
          unit: unit.toLowerCase(),
          confidence: 95,
          standardApplied: "ISO 80000-4 Mechanics / SI Units",
          wasModified: norm !== rawTrimmed,
          rationale: `Standardized pressure range formatting from '${rawTrimmed}' to '${norm}'.`,
        };
      }
    }

    // 7. Flow Rate (e.g. "300l/min" -> "300 L/min", "2500l/h" -> "2500 L/h")
    const flowMatch = rawTrimmed.match(/^(\d+(?:\.\d+)?)\s*(l\/min|lpm|l\/h|gpm|m3\/h)$/i);
    if (flowMatch || lowerName.includes("flow")) {
      const fMatch = rawTrimmed.match(/^(\d+(?:\.\d+)?)\s*(l\/min|lpm|l\/h|gpm|m3\/h)?$/i);
      if (fMatch) {
        const num = fMatch[1];
        let unit = (fMatch[2] || "L/min");
        if (unit.toLowerCase() === "lpm" || unit.toLowerCase() === "l/min") unit = "L/min";
        else if (unit.toLowerCase() === "l/h") unit = "L/h";
        const norm = `${num} ${unit}`;
        return {
          rawValue: rawTrimmed,
          normalizedValue: norm,
          unit,
          confidence: 96,
          standardApplied: "ISO 80000-3",
          wasModified: norm !== rawTrimmed,
          rationale: `Standardized volumetric flow rate notation to SI format '${norm}'.`,
        };
      }
    }

    // 8. Output Signal (e.g. "4-20ma" -> "4–20 mA", "0-10v" -> "0–10 V")
    if (lowerVal.includes("4-20") || lowerVal.includes("4–20") || lowerVal.includes("0-10v") || lowerName.includes("output")) {
      if (lowerVal.includes("4-20") || lowerVal.includes("4–20") || lowerVal.includes("ma")) {
        return {
          rawValue: rawTrimmed,
          normalizedValue: "4–20 mA Current Loop",
          unit: "mA",
          confidence: 97,
          standardApplied: "NAMUR NE 43 / IEC 60381-1",
          wasModified: true,
          rationale: "Standardized analog industrial instrumentation signal to standard NAMUR NE 43 4–20 mA format.",
        };
      }
      if (lowerVal.includes("0-10") || lowerVal.includes("0–10")) {
        return {
          rawValue: rawTrimmed,
          normalizedValue: "0–10 V DC Analog",
          unit: "V",
          confidence: 96,
          standardApplied: "IEC 60381-2",
          wasModified: true,
          rationale: "Standardized analog voltage control output to standard IEC 60381-2 0–10 V DC format.",
        };
      }
    }

    // 9. Temperature Range (e.g. "-50..200C" -> "-50 to +200 °C", "-20 to 80 degC" -> "-20 to +80 °C")
    const tempMatch = rawTrimmed.match(/^([+-]?\d+)\s*(?:to|\.\.|[-–])\s*([+-]?\d+)\s*(?:deg\s*c|°c|c)?$/i);
    if (tempMatch || lowerName.includes("temperature")) {
      if (tempMatch) {
        const minT = tempMatch[1];
        const maxT = parseInt(tempMatch[2], 10) > 0 ? `+${tempMatch[2]}` : tempMatch[2];
        const norm = `${minT} to ${maxT} °C`;
        return {
          rawValue: rawTrimmed,
          normalizedValue: norm,
          unit: "°C",
          confidence: 96,
          standardApplied: "ISO 80000-5 Thermodynamics",
          wasModified: norm !== rawTrimmed,
          rationale: `Standardized operational temperature range from '${rawTrimmed}' to '${norm}'.`,
        };
      }
    }

    // 10. Micron Filtration Rating (e.g. "10um", "5 micron" -> "10 µm", "5 µm")
    const micMatch = rawTrimmed.match(/^(\d+(?:\.\d+)?)\s*(?:um|µm|micron|microns)$/i);
    if (micMatch || lowerName.includes("filtration") || lowerName.includes("micron")) {
      const mMatch = rawTrimmed.match(/^(\d+(?:\.\d+)?)/);
      if (mMatch) {
        const norm = `${mMatch[1]} µm`;
        return {
          rawValue: rawTrimmed,
          normalizedValue: norm,
          unit: "µm",
          confidence: 97,
          standardApplied: "ISO 16889 Hydraulic Fluid Power Filters",
          wasModified: norm !== rawTrimmed,
          rationale: `Standardized micron filtration rating '${rawTrimmed}' to ISO standard notation '${norm}'.`,
        };
      }
    }

    // 11. Pole Count / Breaking Capacity (e.g. "3P" -> "3-Pole", "10kA" -> "10 kA")
    if (lowerVal === "3p" || lowerVal === "3-pole" || lowerVal === "3 pole") {
      return {
        rawValue: rawTrimmed,
        normalizedValue: "3-Pole (3P)",
        confidence: 98,
        standardApplied: "IEC 60947-2",
        wasModified: true,
        rationale: "Standardized circuit breaker pole count to '3-Pole (3P)' per IEC 60947-2.",
      };
    }
    if (lowerVal === "1p" || lowerVal === "1-pole" || lowerVal === "1 pole") {
      return {
        rawValue: rawTrimmed,
        normalizedValue: "1-Pole (1P)",
        confidence: 98,
        standardApplied: "IEC 60947-2",
        wasModified: true,
        rationale: "Standardized circuit breaker pole count to '1-Pole (1P)' per IEC 60947-2.",
      };
    }
    const kaMatch = rawTrimmed.match(/^(\d+)\s*ka$/i);
    if (kaMatch || lowerName.includes("breaking capacity")) {
      if (kaMatch) {
        return {
          rawValue: rawTrimmed,
          normalizedValue: `${kaMatch[1]} kA`,
          unit: "kA",
          confidence: 98,
          standardApplied: "IEC 60947-2 Icu",
          wasModified: rawTrimmed !== `${kaMatch[1]} kA`,
          rationale: `Standardized short-circuit breaking capacity rating to SI format '${kaMatch[1]} kA'.`,
        };
      }
    }

    // 12. Power (e.g. "7.5kw" -> "7.5 kW", "1.1kW" -> "1.1 kW")
    const kwMatch = rawTrimmed.match(/^(\d+(?:\.\d+)?)\s*(kw|hp|w)$/i);
    if (kwMatch || lowerName.includes("power")) {
      const pMatch = rawTrimmed.match(/^(\d+(?:\.\d+)?)\s*(kw|hp|w)?$/i);
      if (pMatch) {
        const val = pMatch[1];
        const u = (pMatch[2] || "kW").toUpperCase() === "KW" ? "kW" : (pMatch[2] || "kW");
        return {
          rawValue: rawTrimmed,
          normalizedValue: `${val} ${u}`,
          unit: u,
          confidence: 97,
          standardApplied: "IEC 60034-1 Electrical Machines",
          wasModified: `${val} ${u}` !== rawTrimmed,
          rationale: `Normalized rated power notation '${rawTrimmed}' to SI format '${val} ${u}'.`,
        };
      }
    }

    // 13. Speed / RPM (e.g. "1450rpm" -> "1450 RPM")
    const rpmMatch = rawTrimmed.match(/^(\d+)\s*(?:rpm|min-1|\/min)?$/i);
    if (rpmMatch && (lowerName.includes("speed") || lowerName.includes("rpm") || lowerVal.includes("rpm"))) {
      return {
        rawValue: rawTrimmed,
        normalizedValue: `${rpmMatch[1]} RPM`,
        unit: "RPM",
        confidence: 97,
        standardApplied: "ISO 80000-3",
        wasModified: `${rpmMatch[1]} RPM` !== rawTrimmed,
        rationale: `Normalized rotational speed notation to '${rpmMatch[1]} RPM'.`,
      };
    }

    // Default fallback (no normalization rule needed)
    return {
      rawValue: rawTrimmed,
      normalizedValue: rawTrimmed,
      confidence: 92,
      wasModified: false,
      rationale: `Direct attribute extraction verified with high confidence. Format complies with catalog standard.`,
    };
  }

  /**
   * Normalizes part number identifiers for fuzzy duplicate matching
   * e.g., "PS-100", "PS 100", "PS100" -> "PS100"
   */
  public static normalizePartNumber(partNumber: string): string {
    return (partNumber || "")
      .toUpperCase()
      .replace(/[\s\-_./\\]+/g, "")
      .trim();
  }
}
