import { TransformationKey } from './transformation';

export interface MentalModel {
  /** Unique identifier for the model */
  id: string;

  /** Human-readable name */
  name: string;

  /** Short code/abbreviation */
  code: string;

  /** Detailed description */
  description: string;

  /** Optional example usage */
  example?: string;

  /** Primary category */
  category: string;

  /** Related categories and tags */
  tags: string[];

  /** Associated transformation keys */
  transformations: TransformationKey[];

  /** Source references */
  sources: Array<{
    /** Source name */
    name: string;
    /** URL or citation */
    reference: string;
  }>;

  /** Additional metadata */
  meta?: {
    /** When this model was added */
    added?: string;
    /** Last updated timestamp */
    updated?: string;
    /** Whether this is a core model */
    isCore?: boolean;
    /** Difficulty level (1-5) */
    difficulty?: number;
  };
}

// Type for the mental models data structure
export interface MentalModelsData {
  version: string;
  lastUpdated: string;
  totalModels: number;
  transformations: Record<TransformationKey, string>;
  models: MentalModel[];
}

// Type for the API response when fetching models
export interface MentalModelsResponse {
  success: boolean;
  data: {
    models: MentalModel[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

// Type for model filtering options
export interface ModelFilterOptions {
  searchTerm?: string;
  transformations?: TransformationKey[];
  tags?: string[];
  complexity?: ('low' | 'medium' | 'high')[];
  minConfidence?: number;
  sortBy?: 'name' | 'complexity' | 'confidence' | 'code';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Type for the model detail view
export interface ModelDetailProps {
  model: MentalModel;
  relatedModels: MentalModel[];
  onClose: () => void;
  onModelSelect: (code: string) => void;
}

// Type for the model card component
export interface ModelCardProps {
  model: MentalModel;
  onClick: () => void;
  compact?: boolean;
  showTransformation?: boolean;
}
