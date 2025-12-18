/**
 * DevOps Authoritative Definitions
 *
 * Single source of truth for all devops concepts
 */

export interface DevOpsConcept {
  id: string;
  name: string;
  definition: string;
  category: string;
  validation: {
    lastUpdated: string;
    source: string;
  };
}

export const DEVOPS_CONCEPTS: Record<string, DevOpsConcept> = {
  // Add your domain concepts here
  EXAMPLE_001: {
    id: 'EXAMPLE_001',
    name: 'Example Concept',
    definition: 'This is an example concept definition',
    category: 'core',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },
};

export function validateDevOpsConcept(id: string): DevOpsConcept | null {
  return DEVOPS_CONCEPTS[id] || null;
}

export function searchDevOps(query: string): DevOpsConcept[] {
  return Object.values(DEVOPS_CONCEPTS).filter(
    concept =>
      concept.name.toLowerCase().includes(query.toLowerCase()) ||
      concept.definition.toLowerCase().includes(query.toLowerCase())
  );
}
