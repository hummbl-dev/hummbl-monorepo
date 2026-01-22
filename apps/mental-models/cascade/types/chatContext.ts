// Chat context types for enhanced AI awareness

import type { MentalModel } from './mental-model';
import type { Narrative } from './narrative';

export type ContextType = 'mental-model' | 'narrative' | 'general';
export type ViewMode = 'browsing' | 'modal-open' | 'chat-only';

export interface ChatContext {
  type: ContextType;
  viewMode: ViewMode;
  currentItem?: MentalModel | Narrative;
  metadata?: {
    totalModels?: number;
    totalNarratives?: number;
    activeFilters?: string[];
  };
}

// Type guards
export function isMentalModel(item: any): item is MentalModel {
  return item && typeof item === 'object' && 'code' in item && 'name' in item;
}

export function isNarrative(item: any): item is Narrative {
  return item && typeof item === 'object' && 'narrative_id' in item && 'title' in item;
}

// Helper to build context description for AI
export function buildContextDescription(context: ChatContext | null): string {
  if (!context) {
    return 'User is browsing the HUMMBL platform.';
  }

  const { type, viewMode, currentItem } = context;

  if (viewMode === 'modal-open' && currentItem) {
    if (isMentalModel(currentItem)) {
      return `User is currently viewing the "${currentItem.name}" mental model (${currentItem.code}). Category: ${currentItem.category}. Description: ${currentItem.description}`;
    }
    if (isNarrative(currentItem)) {
      return `User is currently viewing the "${currentItem.title}" narrative (${currentItem.narrative_id}). Category: ${currentItem.category}. Evidence Quality: ${currentItem.evidence_quality}.`;
    }
  }

  if (type === 'mental-model') {
    return 'User is browsing mental models.';
  }

  if (type === 'narrative') {
    return 'User is browsing narratives.';
  }

  return 'User is on the HUMMBL platform.';
}
