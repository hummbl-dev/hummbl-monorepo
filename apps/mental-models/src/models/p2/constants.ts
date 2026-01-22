import { Stakeholder, StakeholderType } from './types';

export const P2_CONSTANTS = {
  MODEL_CODE: 'P2',
  MODEL_NAME: 'Stakeholder Mapping',
  TRANSFORMATION: 'P (Perspective/Identity)',
  TIER: 1,
  KEY_CHARACTERISTICS: [
    'Comprehensive party identification',
    'Interest vs. influence matrix',
    'Impact analysis',
    'Relationship network mapping'
  ],
  RELATED_MODELS: ['P3', 'CO5', 'SY3'],
  DEFAULT_STAKEHOLDER_TYPES: [
    'customer',
    'supplier',
    'regulator',
    'competitor',
    'internal',
    'investor',
    'partner',
    'community',
    'other'
  ] as StakeholderType[],
  RELATIONSHIP_TYPES: [
    'supports',
    'opposes',
    'influences',
    'depends_on',
    'competes_with'
  ] as const,
  INFLUENCE_THRESHOLD: 3, // On a scale of 1-5
  INTEREST_THRESHOLD: 3,  // On a scale of 1-5
  IMPACT_THRESHOLD: 3     // On a scale of 1-5
} as const;

export const EXAMPLE_STAKEHOLDERS: Omit<Stakeholder, 'id'>[] = [
  {
    name: 'End Users',
    type: 'customer',
    influence: 4,
    interest: 5,
    description: 'Primary users of the product/service'
  },
  {
    name: 'Regulatory Body',
    type: 'regulator',
    influence: 5,
    interest: 3,
    description: 'Government agency overseeing compliance'
  },
  {
    name: 'Key Supplier',
    type: 'supplier',
    influence: 3,
    interest: 4,
    description: 'Critical component provider'
  },
  {
    name: 'Main Competitor',
    type: 'competitor',
    influence: 4,
    interest: 4,
    description: 'Primary competitor in the market'
  },
  {
    name: 'Product Team',
    type: 'internal',
    influence: 5,
    interest: 5,
    description: 'Internal development team'
  }
];

export const EXAMPLE_SCENARIO = 'Launching a new product in a regulated market';

export const STAKEHOLDER_TYPE_COLORS: Record<StakeholderType, string> = {
  customer: '#4f46e5',  // Indigo
  supplier: '#10b981',  // Emerald
  regulator: '#f59e0b', // Amber
  competitor: '#ef4444',// Red
  internal: '#3b82f6',  // Blue
  investor: '#8b5cf6',  // Violet
  partner: '#ec4899',   // Pink
  community: '#06b6d4', // Cyan
  other: '#6b7280'      // Gray
};

export const INFLUENCE_LEVELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very High'
} as const;

export const INTEREST_LEVELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very High'
} as const;