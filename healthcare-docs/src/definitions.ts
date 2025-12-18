/**
 * Healthcare Domain Definitions - Executable Truth
 * Prevents AI hallucination through validation
 */

export interface Patient {
  id: string;
  age: number;
  weight: number; // kg
  allergies: string[];
  conditions: string[];
  medications: Medication[];
}

export interface Medication {
  name: string;
  dosage: number;
  unit: 'mg' | 'ml' | 'units';
  frequency: string;
  route: 'oral' | 'iv' | 'im' | 'topical';
}

export interface DrugInteraction {
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  mechanism: string;
}

// Drug Dosage Validation
export function validateDosage(
  drug: string,
  dosage: number,
  weight: number,
  age: number
): {
  valid: boolean;
  reason?: string;
  maxDose?: number;
} {
  const drugLimits: Record<string, { maxPerKg: number; maxTotal: number; minAge?: number }> = {
    acetaminophen: { maxPerKg: 15, maxTotal: 4000, minAge: 0 },
    ibuprofen: { maxPerKg: 10, maxTotal: 3200, minAge: 6 },
    morphine: { maxPerKg: 0.1, maxTotal: 30, minAge: 18 },
  };

  const limits = drugLimits[drug.toLowerCase()];
  if (!limits) return { valid: false, reason: 'Unknown drug' };

  if (limits.minAge && age < limits.minAge) {
    return { valid: false, reason: `Not approved for age < ${limits.minAge}` };
  }

  const maxDoseByWeight = limits.maxPerKg * weight;
  const maxDose = Math.min(maxDoseByWeight, limits.maxTotal);

  if (dosage > maxDose) {
    return { valid: false, reason: 'Exceeds maximum safe dose', maxDose };
  }

  return { valid: true, maxDose };
}

// Drug Interaction Checker
export function checkDrugInteraction(drug1: string, drug2: string): DrugInteraction | null {
  const interactions: Record<string, DrugInteraction> = {
    'warfarin-aspirin': {
      severity: 'major',
      description: 'Increased risk of bleeding',
      mechanism: 'Additive anticoagulant effects',
    },
    'digoxin-furosemide': {
      severity: 'moderate',
      description: 'Increased digoxin toxicity risk',
      mechanism: 'Furosemide-induced hypokalemia enhances digoxin toxicity',
    },
    'metformin-contrast': {
      severity: 'contraindicated',
      description: 'Risk of lactic acidosis',
      mechanism: 'Contrast may cause kidney dysfunction',
    },
  };

  const key1 = `${drug1.toLowerCase()}-${drug2.toLowerCase()}`;
  const key2 = `${drug2.toLowerCase()}-${drug1.toLowerCase()}`;

  return interactions[key1] || interactions[key2] || null;
}

// Clinical Decision Support
export function assessChestPainRisk(patient: {
  age: number;
  sex: 'M' | 'F';
  symptoms: string[];
  riskFactors: string[];
}): {
  riskLevel: 'low' | 'moderate' | 'high';
  recommendation: string;
  score: number;
} {
  let score = 0;

  // Age factor
  if (patient.age > 65) score += 2;
  else if (patient.age > 45) score += 1;

  // Sex factor
  if (patient.sex === 'M') score += 1;

  // Risk factors
  const highRiskFactors = ['diabetes', 'hypertension', 'smoking', 'family-history'];
  score += patient.riskFactors.filter(rf => highRiskFactors.includes(rf)).length;

  // Symptoms
  if (patient.symptoms.includes('chest-pain')) score += 2;
  if (patient.symptoms.includes('shortness-of-breath')) score += 1;
  if (patient.symptoms.includes('nausea')) score += 1;

  let riskLevel: 'low' | 'moderate' | 'high';
  let recommendation: string;

  if (score <= 2) {
    riskLevel = 'low';
    recommendation = 'Consider outpatient evaluation';
  } else if (score <= 5) {
    riskLevel = 'moderate';
    recommendation = 'ED evaluation with ECG and troponins';
  } else {
    riskLevel = 'high';
    recommendation = 'Immediate cardiology consultation';
  }

  return { riskLevel, recommendation, score };
}

// Medical Reference Data
export const MEDICAL_CODES = {
  ICD10: {
    'I21.9': 'Acute myocardial infarction, unspecified',
    'E11.9': 'Type 2 diabetes mellitus without complications',
    I10: 'Essential hypertension',
  },
  CPT: {
    '99213': 'Office visit, established patient, moderate complexity',
    '93000': 'Electrocardiogram, routine ECG with interpretation',
  },
} as const;

export function validateMedicalCode(codeSystem: keyof typeof MEDICAL_CODES, code: string): boolean {
  return code in MEDICAL_CODES[codeSystem];
}
