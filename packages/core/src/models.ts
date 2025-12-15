/**
 * Single source of truth for all Base120 models
 * Eliminates need for complex validation protocols
 */

export const BASE120_MODELS = {
  // Perspective (P) - Frame and name what is
  P: {
    name: 'Perspective',
    description: 'Frame and name what is. Anchor or shift point of view.',
    models: {
      P1: { name: 'Stakeholder Mapping', definition: 'Identify all parties affected by decisions' },
      P2: { name: 'Frame Shifting', definition: 'Change perspective to reveal new solutions' },
      // ... other P models
    }
  },
  
  // Inversion (IN) - Reverse assumptions
  IN: {
    name: 'Inversion',
    description: 'Reverse assumptions. Examine opposites, edges, negations.',
    models: {
      IN1: { name: 'Assumption Reversal', definition: 'Challenge core assumptions systematically' },
      IN2: { name: 'Failure Analysis', definition: 'Work backward from potential failures' },
      // ... other IN models
    }
  },
  
  // Continue for CO, DE, RE, SY...
} as const;

export type TransformationCode = keyof typeof BASE120_MODELS;
export type ModelCode = `${TransformationCode}${number}`;