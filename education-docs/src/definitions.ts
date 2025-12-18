/**
 * Education Domain Definitions - Executable Truth
 * Prevents AI hallucination through validation
 */

export interface LearningObjective {
  id: string;
  description: string;
  bloomsLevel: BloomsLevel;
  subject: string;
  gradeLevel: number;
  measurable: boolean;
}

export type BloomsLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export interface Assessment {
  type: 'formative' | 'summative' | 'diagnostic' | 'authentic';
  method: string;
  rubric?: RubricCriteria[];
  points: number;
}

export interface RubricCriteria {
  criterion: string;
  levels: {
    level: number;
    description: string;
    points: number;
  }[];
}

// Bloom's Taxonomy Validation
export function validateBloomsLevel(objective: string): {
  level: BloomsLevel;
  confidence: number;
  keywords: string[];
} {
  const bloomsKeywords: Record<BloomsLevel, string[]> = {
    remember: ['define', 'list', 'recall', 'identify', 'name', 'state'],
    understand: ['explain', 'describe', 'summarize', 'interpret', 'classify'],
    apply: ['use', 'demonstrate', 'solve', 'implement', 'execute'],
    analyze: ['analyze', 'compare', 'contrast', 'examine', 'break down'],
    evaluate: ['evaluate', 'judge', 'critique', 'assess', 'justify'],
    create: ['create', 'design', 'develop', 'compose', 'construct'],
  };

  const objectiveLower = objective.toLowerCase();
  let bestMatch: BloomsLevel = 'remember';
  let maxMatches = 0;
  let foundKeywords: string[] = [];

  for (const [level, keywords] of Object.entries(bloomsKeywords)) {
    const matches = keywords.filter(keyword => objectiveLower.includes(keyword));
    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      bestMatch = level as BloomsLevel;
      foundKeywords = matches;
    }
  }

  const confidence = maxMatches > 0 ? Math.min(maxMatches / 3, 1) : 0.1;

  return {
    level: bestMatch,
    confidence,
    keywords: foundKeywords,
  };
}

// Learning Objective Quality Check
export function validateObjective(objective: string): {
  measurable: boolean;
  specific: boolean;
  actionVerb: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for action verb at start
  const actionVerbs = [
    'analyze',
    'apply',
    'assess',
    'calculate',
    'compare',
    'create',
    'define',
    'demonstrate',
    'describe',
    'design',
    'evaluate',
    'explain',
    'identify',
    'implement',
    'interpret',
    'list',
    'solve',
    'summarize',
    'understand',
  ];

  const startsWithAction = actionVerbs.some(
    verb =>
      objective.toLowerCase().startsWith(`students will ${verb}`) ||
      objective.toLowerCase().startsWith(verb)
  );

  if (!startsWithAction) {
    issues.push('Should start with measurable action verb');
  }

  // Check specificity (length and detail)
  const wordCount = objective.split(' ').length;
  if (wordCount < 8) {
    issues.push('Too vague - needs more specific details');
  }

  // Check for measurable outcomes
  const measurableIndicators = ['will be able to', 'can', 'demonstrate', 'show', 'produce'];
  const hasMeasurable = measurableIndicators.some(indicator =>
    objective.toLowerCase().includes(indicator)
  );

  if (!hasMeasurable && !startsWithAction) {
    issues.push('Not clearly measurable');
  }

  return {
    measurable: hasMeasurable || startsWithAction,
    specific: wordCount >= 8,
    actionVerb: startsWithAction,
    issues,
  };
}

// Grade Level Appropriateness
export function validateGradeLevel(
  content: string,
  targetGrade: number
): {
  appropriate: boolean;
  estimatedGrade: number;
  readabilityScore: number;
} {
  // Simplified readability calculation (Flesch-Kincaid approximation)
  const sentences = content.split(/[.!?]+/).length - 1;
  const words = content.split(/\s+/).length;
  const syllables = content.split(/[aeiouAEIOU]/).length - 1;

  if (sentences === 0 || words === 0) {
    return { appropriate: false, estimatedGrade: 0, readabilityScore: 0 };
  }

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  // Simplified Flesch-Kincaid Grade Level
  const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const clampedGrade = Math.max(1, Math.min(12, Math.round(gradeLevel)));

  const appropriate = Math.abs(clampedGrade - targetGrade) <= 1;

  return {
    appropriate,
    estimatedGrade: clampedGrade,
    readabilityScore:
      Math.round((206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord) * 10) / 10,
  };
}

// Educational Standards Reference
export const STANDARDS = {
  CCSS_MATH: {
    'K.CC.A.1': 'Count to 100 by ones and by tens',
    '1.OA.A.1': 'Use addition and subtraction within 20 to solve problems',
    '8.F.A.1': 'Understand that a function is a rule that assigns exactly one output to each input',
  },
  NGSS: {
    'K-PS2-1':
      'Plan and conduct investigation to compare effects of different strengths or directions of pushes and pulls',
    '5-LS2-1':
      'Develop a model to describe the movement of matter among plants, animals, decomposers, and the environment',
  },
} as const;

export function checkStandardAlignment(
  standardCode: string,
  objective: string
): { aligned: boolean; confidence: number; suggestions: string[] } {
  const standard =
    STANDARDS.CCSS_MATH[standardCode as keyof typeof STANDARDS.CCSS_MATH] ||
    STANDARDS.NGSS[standardCode as keyof typeof STANDARDS.NGSS];

  if (!standard) {
    return { aligned: false, confidence: 0, suggestions: ['Invalid standard code'] };
  }

  // Simple keyword matching for alignment
  const standardWords = standard.toLowerCase().split(/\W+/);
  const objectiveWords = objective.toLowerCase().split(/\W+/);

  const commonWords = standardWords.filter(
    word => word.length > 3 && objectiveWords.includes(word)
  );

  const confidence = commonWords.length / Math.max(standardWords.length, objectiveWords.length);
  const aligned = confidence > 0.3;

  const suggestions = aligned
    ? []
    : [
        'Consider including key terms from the standard',
        'Ensure objective addresses the same concept as the standard',
      ];

  return { aligned, confidence, suggestions };
}
