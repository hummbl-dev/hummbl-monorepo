/**
 * HUMMBL Authoritative Definitions
 *
 * Single source of truth for all hummbl concepts
 */

export interface HUMMBLConcept {
  id: string;
  name: string;
  definition: string;
  category: string;
  validation: {
    lastUpdated: string;
    source: string;
  };
}

export const HUMMBL_CONCEPTS: Record<string, HUMMBLConcept> = {
  // Base120 Framework Core
  BASE120: {
    id: 'BASE120',
    name: 'Base120 Framework',
    definition:
      '6 transformations with 20 mental models each (120 total) for systematic problem-solving',
    category: 'framework',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },

  // Transformations
  P: {
    id: 'P',
    name: 'Perspective',
    definition: 'Frame and name what is. Anchor or shift point of view.',
    category: 'transformation',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },
  IN: {
    id: 'IN',
    name: 'Inversion',
    definition: 'Reverse assumptions. Examine opposites, edges, negations.',
    category: 'transformation',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },
  CO: {
    id: 'CO',
    name: 'Composition',
    definition: 'Combine parts into coherent wholes.',
    category: 'transformation',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },
  DE: {
    id: 'DE',
    name: 'Decomposition',
    definition: 'Break systems into components.',
    category: 'transformation',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },
  RE: {
    id: 'RE',
    name: 'Recursion',
    definition: 'Apply operations iteratively, outputs become inputs.',
    category: 'transformation',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },
  SY: {
    id: 'SY',
    name: 'Meta-Systems',
    definition: 'Systems of systems, coordination, emergence.',
    category: 'transformation',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },

  // Key Mental Models
  SY19: {
    id: 'SY19',
    name: 'Meta-Model Selection',
    definition:
      'Framework for selecting complementary mental models that work synergistically together',
    category: 'mental-model',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },

  // AI-Native Documentation
  AI_NATIVE_DOCS: {
    id: 'AI_NATIVE_DOCS',
    name: 'AI-Native Documentation',
    definition:
      'Knowledge packaging that prevents AI hallucination through executable validation and self-teaching systems',
    category: 'methodology',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative',
    },
  },
};

export function validateHUMMBLConcept(id: string): HUMMBLConcept | null {
  return HUMMBL_CONCEPTS[id] || null;
}

export function searchHUMMBL(query: string): HUMMBLConcept[] {
  return Object.values(HUMMBL_CONCEPTS).filter(
    concept =>
      concept.name.toLowerCase().includes(query.toLowerCase()) ||
      concept.definition.toLowerCase().includes(query.toLowerCase())
  );
}
