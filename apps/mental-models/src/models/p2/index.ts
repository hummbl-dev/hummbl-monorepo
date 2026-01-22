import { v4 as uuidv4 } from 'uuid';
import type { 
  Stakeholder, 
  StakeholderMap, 
  StakeholderAnalysis, 
  StakeholderModel
} from './types';
import { 
  P2_CONSTANTS, 
  EXAMPLE_STAKEHOLDERS, 
  EXAMPLE_SCENARIO,
  STAKEHOLDER_TYPE_COLORS
} from './constants';

/**
 * Creates a new stakeholder with a unique ID
 */
const createStakeholder = (params: Omit<Stakeholder, 'id'>): Stakeholder => ({
  id: uuidv4(),
  ...params,
  relationships: params.relationships || []
});

/**
 * Creates a new stakeholder map
 */
const createStakeholderMap = (name: string, description: string = ''): StakeholderMap => ({
  id: uuidv4(),
  name,
  description,
  stakeholders: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

/**
 * Analyzes stakeholders and categorizes them into different quadrants
 */
const analyzeStakeholders = (stakeholders: Stakeholder[]): StakeholderAnalysis => {
  const keyStakeholders: Stakeholder[] = [];
  const keepSatisfied: Stakeholder[] = [];
  const keepInformed: Stakeholder[] = [];
  const minimalEffort: Stakeholder[] = [];
  
  const { INFLUENCE_THRESHOLD, INTEREST_THRESHOLD } = P2_CONSTANTS;

  stakeholders.forEach(stakeholder => {
    if (stakeholder.influence >= INFLUENCE_THRESHOLD) {
      if (stakeholder.interest >= INTEREST_THRESHOLD) {
        keyStakeholders.push(stakeholder);
      } else {
        keepSatisfied.push(stakeholder);
      }
    } else if (stakeholder.interest >= INTEREST_THRESHOLD) {
      keepInformed.push(stakeholder);
    } else {
      minimalEffort.push(stakeholder);
    }
  });

  // Sort by influence * interest (descending)
  const sortByImportance = (a: Stakeholder, b: Stakeholder) => 
    (b.influence * b.interest) - (a.influence * a.interest);

  keyStakeholders.sort(sortByImportance);
  keepSatisfied.sort(sortByImportance);
  keepInformed.sort(sortByImportance);
  minimalEffort.sort(sortByImportance);

  return {
    keyStakeholders,
    keepSatisfied,
    keepInformed,
    minimalEffort,
    networkMap: generateNetworkMap(stakeholders)
  };
};

/**
 * Generates a network map for visualization
 */
const generateNetworkMap = (stakeholders: Stakeholder[]): StakeholderAnalysis['networkMap'] => {
  const nodes = stakeholders.map(stakeholder => ({
    id: stakeholder.id,
    label: stakeholder.name,
    type: stakeholder.type,
    color: STAKEHOLDER_TYPE_COLORS[stakeholder.type],
    influence: stakeholder.influence,
    interest: stakeholder.interest
  }));

  const edges: Array<{from: string; to: string; label: string; strength: number}> = [];
  
  // Create relationships between stakeholders
  stakeholders.forEach(stakeholder => {
    stakeholder.relationships?.forEach(rel => {
      edges.push({
        from: stakeholder.id,
        to: rel.stakeholderId,
        label: rel.relationshipType.replace('_', ' '),
        strength: rel.strength
      });
    });
  });

  return { nodes, edges };
};

/**
 * Finds stakeholders with influence above a threshold
 */
const findInfluencers = (stakeholders: Stakeholder[], minInfluence: number = P2_CONSTANTS.INFLUENCE_THRESHOLD): Stakeholder[] => {
  return stakeholders
    .filter(s => s.influence >= minInfluence)
    .sort((a, b) => b.influence - a.influence);
};

/**
 * Finds key stakeholders (high influence and high interest)
 */
const findKeyStakeholders = (stakeholders: Stakeholder[]): Stakeholder[] => {
  const { INFLUENCE_THRESHOLD, INTEREST_THRESHOLD } = P2_CONSTANTS;
  return stakeholders
    .filter(s => s.influence >= INFLUENCE_THRESHOLD && s.interest >= INTEREST_THRESHOLD)
    .sort((a, b) => (b.influence * b.interest) - (a.influence * a.interest));
};

/**
 * Creates a new instance of the Stakeholder Mapping model
 */
export const createStakeholderModel = (): StakeholderModel => {
  // Create example stakeholders with IDs
  const exampleStakeholders = EXAMPLE_STAKEHOLDERS.map(createStakeholder);
  
  return {
    id: P2_CONSTANTS.MODEL_CODE.toLowerCase(),
    name: P2_CONSTANTS.MODEL_NAME,
    description: 'Identify all parties with interest, influence, or impact in a system or decision.',
    transformation: P2_CONSTANTS.TRANSFORMATION,
    tier: P2_CONSTANTS.TIER,
    keyCharacteristics: [...P2_CONSTANTS.KEY_CHARACTERISTICS],
    relatedModels: [...P2_CONSTANTS.RELATED_MODELS],
    example: {
      scenario: EXAMPLE_SCENARIO,
      stakeholders: exampleStakeholders
    },
    methods: {
      createStakeholder,
      createStakeholderMap,
      analyzeStakeholders,
      generateNetworkMap,
      findInfluencers,
      findKeyStakeholders
    }
  };
};

/**
 * Convenience function to quickly analyze stakeholders
 */
export const analyzeStakeholderMap = (stakeholders: Stakeholder[]): StakeholderAnalysis => {
  return analyzeStakeholders(stakeholders);
};

// Default export for convenience
export default {
  createStakeholderModel,
  analyzeStakeholderMap,
  createStakeholder,
  constants: P2_CONSTANTS,
  types: {
    STAKEHOLDER_TYPE_COLORS
  }
};

// Export the main model and functions
export { 
  createStakeholderModel,
  analyzeStakeholderMap,
  createStakeholder 
};

// Export types
export type {
  Stakeholder,
  StakeholderMap,
  StakeholderAnalysis,
  StakeholderModel,
  StakeholderType,
  StakeholderRelationship
} from './types';

// Export constants
export {
  P2_CONSTANTS,
  EXAMPLE_STAKEHOLDERS,
  EXAMPLE_SCENARIO,
  STAKEHOLDER_TYPE_COLORS,
  INFLUENCE_LEVELS,
  INTEREST_LEVELS
} from './constants';