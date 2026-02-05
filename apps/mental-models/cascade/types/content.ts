// Content types with versioning support

export interface ContentVersion {
  id: string;
  content_id: string;
  version: number;
  changes: string[];
  author: string;
  timestamp: string;
  approved: boolean;
  previous_version?: number;
}

export interface ContentMetadata {
  created_at: string;
  updated_at: string;
  version: number;
  author: string;
  reviewers?: string[];
  status: 'draft' | 'review' | 'published' | 'archived';
}

export interface VersionedMentalModel {
  id: string;
  name: string;
  category: string;
  description?: string;
  definition?: string;
  tags?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  relatedModels?: string[];
  metadata: ContentMetadata;
}

export interface VersionedNarrative {
  narrative_id: string;
  title: string;
  summary: string;
  full_text?: string;
  category: string;
  tags?: string[];
  evidence_quality: 'High' | 'Medium' | 'Low' | 'Preliminary';
  confidence_level: number;
  related_models?: string[];
  domain?: string[];
  metadata: ContentMetadata;
}

export interface ContentChange {
  field: string;
  old_value: any;
  new_value: any;
  timestamp: string;
}

export interface VersionDiff {
  content_id: string;
  from_version: number;
  to_version: number;
  changes: ContentChange[];
  summary: string;
}
