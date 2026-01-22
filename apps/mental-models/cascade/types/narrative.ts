// Core narrative types for HUMMBL Framework

export interface Narrative {
  // Core identification
  id: string;
  narrative_id: string;
  version: string;
  provenance_hash: string;

  // Core content
  title: string;
  content: string;
  summary: string;
  category: string;

  // Classification
  tags: string[];
  domain: string[];
  evidence_quality: 'A' | 'B' | 'C';
  confidence: number;

  // Structure
  complexity: Complexity;
  examples: Array<
    | {
        scenario: string;
        application: string;
        outcome: string;
      }
    | string
  >;

  // Relationships
  linked_signals: Signal[];
  relationships: Relationship[];
  related_frameworks: string[];

  // Citations and methods
  citations: Citation[];
  elicitation_methods: ElicitationMethod[];
  methods?: Array<{
    method: string;
    description: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }>;

  // Metadata
  changelog: ChangelogEntry[];
  lastUpdated?: string;
  approved?: boolean;
}

export interface Complexity {
  cognitive_load: string;
  time_to_elicit: string;
  expertise_required: string;
}

export interface Signal {
  signal_id: string;
  signal_type: string;
  weight: number;
  context: string;
}

export interface Relationship {
  type: string;
  target: string;
  description: string;
}

export interface Citation {
  author: string;
  year: number | string;
  title: string;
  source: string;
}

export interface ElicitationMethod {
  method: string;
  duration: string;
  difficulty: string;
}

export interface Example {
  scenario: string;
  application: string;
  outcome: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string;
}

export interface NarrativesResponse {
  metadata: {
    version: string;
    last_updated: string;
    total_narratives: number;
  };
  narratives: Narrative[];
}
