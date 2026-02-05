export type TransformationKey = 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';

export const transformationMap: Record<TransformationKey, string> = {
  P: 'Perspective / Identity',
  IN: 'Inversion',
  CO: 'Composition',
  DE: 'Decomposition',
  RE: 'Recursion',
  SY: 'Meta-Systems',
};

export interface Transformation {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export const transformations: Record<TransformationKey, Transformation> = {
  P: {
    id: 'P',
    name: 'Perspective / Identity',
    description:
      'Frame Semantics and construction grammar support framing and perspective elicitation.',
    icon: '👁️',
    color: '#4f46e5', // indigo
  },
  IN: {
    id: 'IN',
    name: 'Inversion',
    description:
      'Classical inversion and recursion-inversion links support adversarial and counterfactual analysis.',
    icon: '🔄',
    color: '#10b981', // emerald
  },
  CO: {
    id: 'CO',
    name: 'Composition',
    description:
      'Compositionality principles underpin building complex mental models from primitives.',
    icon: '🧩',
    color: '#f59e0b', // amber
  },
  DE: {
    id: 'DE',
    name: 'Decomposition',
    description:
      'Hierarchical task analysis and human problem solving support task breakdown and protocol analysis.',
    icon: '🔍',
    color: '#ef4444', // red
  },
  RE: {
    id: 'RE',
    name: 'Recursion',
    description:
      'Recursion core theories support nested structure generation and recursive reasoning.',
    icon: '♾️',
    color: '#8b5cf6', // violet
  },
  SY: {
    id: 'SY',
    name: 'Meta-Systems',
    description:
      'General systems theory and second-order cybernetics support meta-model mapping and system-level reasoning.',
    icon: '🌐',
    color: '#06b6d4', // cyan
  },
};
