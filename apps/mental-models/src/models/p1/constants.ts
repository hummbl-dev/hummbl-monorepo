export const P1_CONSTANTS = {
  MODEL_CODE: 'P1',
  MODEL_NAME: 'First Principles Framing',
  TRANSFORMATION: 'P (Perspective/Identity)',
  TIER: 1,
  KEY_CHARACTERISTICS: [
    'Analytical reduction to fundamentals',
    'Removes layers of assumptions',
    'Identifies irreducible truths',
    'Rebuilds understanding from foundation up'
  ],
  RELATED_MODELS: ['P15', 'DE1', 'IN3'],
  EXAMPLE: {
    problem: 'Redesigning a pricing strategy',
    traditionalApproach: 'Benchmarking against competitors (derivative thinking)',
    firstPrinciplesApproach: 'Starting with fundamental unit costs and desired profit margin'
  }
} as const;

export const DEFAULT_ASSUMPTIONS = [
  'Assumption about customer price sensitivity',
  'Assumption about competitor pricing strategies',
  'Assumption about cost structures'
];

export const SAMPLE_TRUTHS = [
  'Raw material costs are $X per unit',
  'Manufacturing costs are $Y per unit',
  'Desired profit margin is Z%'
];