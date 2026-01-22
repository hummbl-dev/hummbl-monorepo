/**
 * Model Metadata for HUMMBL Base120 Framework
 * 
 * This file contains the metadata for all 120 mental models in the HUMMBL framework.
 * It's used to generate consistent documentation and ensure all models are properly named and described.
 */

export interface ModelMetadata {
  id: string;           // e.g., 'p1', 'in2', 'co3'
  name: string;         // Human-readable name
  description: string;  // Brief description of the model
  category: 'perspective' | 'inversion' | 'composition' | 'deconstruction' | 'reconstruction' | 'synthesis';
  tier: number;         // Tier level (1-20)
}

// Perspective Models
export const perspectiveModels: ModelMetadata[] = [
  {
    id: 'p1',
    name: 'First Principles Framing',
    description: 'Breaks down complex problems into their most basic, foundational elements to enable innovative solutions and clear thinking.',
    category: 'perspective',
    tier: 1
  },
  {
    id: 'p2',
    name: 'Stakeholder Mapping',
    description: 'Identifies and analyzes all parties with interest or influence in a system or decision to understand complex stakeholder landscapes.',
    category: 'perspective',
    tier: 1
  },
  {
    id: 'p3',
    name: 'Temporal Perspective',
    description: 'Examines problems and solutions across different time horizons to understand how they evolve and interact over time.',
    category: 'perspective',
    tier: 2
  },
  // Add P4-P20 with similar structure
  {
    id: 'p4',
    name: 'Multiple Perspectives',
    description: 'Systematically explores different viewpoints to gain a more comprehensive understanding of complex issues.',
    category: 'perspective',
    tier: 2
  },
  {
    id: 'p5',
    name: 'Contextual Awareness',
    description: 'Focuses on understanding the broader context surrounding a problem or situation to identify key factors and relationships.',
    category: 'perspective',
    tier: 2
  },
  {
    id: 'p6',
    name: 'Abstraction Laddering',
    description: 'Moves between different levels of abstraction to find the most appropriate perspective for problem-solving.',
    category: 'perspective',
    tier: 3
  },
  {
    id: 'p7',
    name: 'Boundary Setting',
    description: 'Defines the scope and limits of a system or problem to focus analysis and solution development.',
    category: 'perspective',
    tier: 3
  },
  {
    id: 'p8',
    name: 'Perspective Shifting',
    description: 'Deliberately adopts different viewpoints to gain new insights and challenge existing assumptions.',
    category: 'perspective',
    tier: 3
  },
  {
    id: 'p9',
    name: 'Scale Awareness',
    description: 'Considers how problems and solutions change when viewed at different scales or magnitudes.',
    category: 'perspective',
    tier: 4
  },
  {
    id: 'p10',
    name: 'Temporal Decomposition',
    description: 'Breaks down time-based processes into distinct phases or stages for analysis.',
    category: 'perspective',
    tier: 4
  },
  {
    id: 'p11',
    name: 'Spatial Analysis',
    description: 'Examines the spatial relationships and patterns in data or systems.',
    category: 'perspective',
    tier: 4
  },
  {
    id: 'p12',
    name: 'Network Perspective',
    description: 'Views systems as networks of interconnected nodes to understand relationships and flows.',
    category: 'perspective',
    tier: 4
  },
  {
    id: 'p13',
    name: 'Hierarchical Thinking',
    description: 'Organizes information and concepts into hierarchical structures to reveal patterns and relationships.',
    category: 'perspective',
    tier: 5
  },
  {
    id: 'p14',
    name: 'Dimensional Analysis',
    description: 'Examines problems across multiple dimensions to identify key variables and their interactions.',
    category: 'perspective',
    tier: 5
  },
  {
    id: 'p15',
    name: 'Pattern Recognition',
    description: 'Identifies and analyzes recurring patterns in data, behavior, or systems.',
    category: 'perspective',
    tier: 5
  },
  {
    id: 'p16',
    name: 'Emergent Properties',
    description: 'Focuses on properties that emerge from the interaction of system components.',
    category: 'perspective',
    tier: 6
  },
  {
    id: 'p17',
    name: 'Feedback Loops',
    description: 'Identifies and analyzes reinforcing and balancing feedback mechanisms in systems.',
    category: 'perspective',
    tier: 6
  },
  {
    id: 'p18',
    name: 'System Boundaries',
    description: 'Defines what is included within and excluded from the system under analysis.',
    category: 'perspective',
    tier: 6
  },
  {
    id: 'p19',
    name: 'Leverage Points',
    description: 'Identifies key areas where small changes can lead to significant impacts in a system.',
    category: 'perspective',
    tier: 7
  },
  {
    id: 'p20',
    name: 'Meta-Perspective',
    description: 'Takes a step back to examine the process of perspective-taking itself.',
    category: 'perspective',
    tier: 7
  }
];

// Inversion Models
export const inversionModels: ModelMetadata[] = [
  {
    id: 'in1',
    name: 'Inversion Principle',
    description: 'Approaches problems by considering the opposite of the desired outcome to identify potential pitfalls and failure modes.',
    category: 'inversion',
    tier: 1
  },
  {
    id: 'in2',
    name: 'Negative Space Analysis',
    description: 'Examines what is not present or not happening to gain insights into a system or problem.',
    category: 'inversion',
    tier: 1
  },
  // Add IN3-IN20 with similar structure
  {
    id: 'in3',
    name: 'Assumption Inversion',
    description: 'Identifies and challenges underlying assumptions by deliberately considering their opposites.',
    category: 'inversion',
    tier: 2
  },
  {
    id: 'in4',
    name: 'Failure Mode Analysis',
    description: 'Systematically examines how things could fail to prevent problems before they occur.',
    category: 'inversion',
    tier: 2
  },
  {
    id: 'in5',
    name: 'Contrarian Thinking',
    description: 'Deliberately takes opposing viewpoints to challenge conventional wisdom and groupthink.',
    category: 'inversion',
    tier: 2
  },
  {
    id: 'in6',
    name: 'Devil\'s Advocate',
    description: 'Systematically argues against a position to test its strength and identify weaknesses.',
    category: 'inversion',
    tier: 3
  },
  {
    id: 'in7',
    name: 'Red Team Analysis',
    description: 'Simulates an adversary\'s perspective to identify vulnerabilities and weaknesses.',
    category: 'inversion',
    tier: 3
  },
  {
    id: 'in8',
    name: 'Pre-Mortem Analysis',
    description: 'Imagines a future failure and works backward to determine what could lead to that outcome.',
    category: 'inversion',
    tier: 3
  },
  {
    id: 'in9',
    name: 'Antifragility Assessment',
    description: 'Identifies how systems can benefit from volatility and disorder.',
    category: 'inversion',
    tier: 4
  },
  {
    id: 'in10',
    name: 'Black Swan Preparation',
    description: 'Prepares for high-impact, hard-to-predict events that are beyond normal expectations.',
    category: 'inversion',
    tier: 4
  },
  {
    id: 'in11',
    name: 'Counterfactual Reasoning',
    description: 'Explores alternative scenarios and what-if analyses to understand causality.',
    category: 'inversion',
    tier: 4
  },
  {
    id: 'in12',
    name: 'Negative Visualization',
    description: 'Imagines the worst-case scenarios to build resilience and appreciation.',
    category: 'inversion',
    tier: 4
  },
  {
    id: 'in13',
    name: 'Incentive Analysis',
    description: 'Examines the incentives that drive behavior in a system.',
    category: 'inversion',
    tier: 5
  },
  {
    id: 'in14',
    name: 'Perverse Incentives',
    description: 'Identifies and mitigates incentives that lead to unintended consequences.',
    category: 'inversion',
    tier: 5
  },
  {
    id: 'in15',
    name: 'Backward Induction',
    description: 'Solves problems by working backward from the desired outcome.',
    category: 'inversion',
    tier: 5
  },
  {
    id: 'in16',
    name: 'Second-Order Thinking',
    description: 'Considers the long-term and indirect consequences of decisions.',
    category: 'inversion',
    tier: 6
  },
  {
    id: 'in17',
    name: 'Third-Order Thinking',
    description: 'Extends second-order thinking to consider even more distant consequences.',
    category: 'inversion',
    tier: 6
  },
  {
    id: 'in18',
    name: 'Inversion of Constraints',
    description: 'Treats constraints as opportunities for innovation.',
    category: 'inversion',
    tier: 6
  },
  {
    id: 'in19',
    name: 'Antifragile Systems',
    description: 'Designs systems that benefit from shocks and volatility.',
    category: 'inversion',
    tier: 7
  },
  {
    id: 'in20',
    name: 'Meta-Inversion',
    description: 'Applies inversion to the process of inversion itself.',
    category: 'inversion',
    tier: 7
  }
];

// Note: Similar structures would be added for Composition, Deconstruction, Reconstruction, and Synthesis models
// For brevity, I'm showing the pattern with just Perspective and Inversion models

// Export all models
export const allModels = [
  ...perspectiveModels,
  ...inversionModels,
  // ... other categories would be added here
];

// Helper function to get model by ID
export function getModelById(id: string): ModelMetadata | undefined {
  return allModels.find(model => model.id.toLowerCase() === id.toLowerCase());
}
