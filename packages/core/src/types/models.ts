// Base120 mental model types for HUMMBL framework

export interface Base120Model {
  code: string; // e.g., "P4", "IN12"
  name: string; // e.g., "Stakeholder Mapping"
  transformation: 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';
  description: string;
  methods: string[];
  examples?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  relatedModels: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentalModelFilter {
  searchTerm?: string;
  transformation?: string;
  difficulty?: string;
  tags?: string[];
}

export interface ModelRelationship {
  sourceModel: string;
  targetModel: string;
  relationship: 'complementary' | 'sequential' | 'alternative' | 'hierarchical';
  strength: number; // 0-1
  description: string;
}

export interface TransformationInfo {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  modelCount: number;
}
