// Shared types for web and mobile

export interface Bookmark {
  id: string;
  type: 'narrative' | 'mentalModel';
  itemId: string;
  title: string;
  addedAt: number;
  tags?: string[];
  notes?: string;
  color?: string;
  collectionId?: string;
}

export interface Note {
  id: string;
  type: 'narrative' | 'mentalModel';
  itemId: string;
  itemTitle: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  resultCount?: number;
  filters?: Record<string, unknown>;
}

export interface ReadingHistoryEntry {
  id: string;
  type: 'narrative' | 'mentalModel';
  itemId: string;
  title: string;
  timestamp: number;
  duration?: number;
  completed?: boolean;
  progress?: number;
}

export interface MentalModel {
  id: string;
  name: string;
  category: string;
  description?: string;
  definition?: string;
  tags?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  relatedModels?: string[];
}

export interface Narrative {
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
}
