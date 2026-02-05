// Model Suggestions Component - Shows relevant mental models during chat

import React from 'react';
import type { MentalModel } from '../../../cascade/types/mental-model';
import './ModelSuggestions.css';

interface ModelSuggestion {
  model: MentalModel;
  relevanceScore: number;
  reasoning: string;
  applicationSuggestion: string;
}

interface ModelSuggestionsProps {
  suggestions: ModelSuggestion[];
  onSelectModel: (model: MentalModel) => void;
  isLoading?: boolean;
}

export const ModelSuggestions: React.FC<ModelSuggestionsProps> = ({
  suggestions,
  onSelectModel,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="model-suggestions-loading">
        <div className="loading-dot"></div>
        <span>Finding relevant models...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="model-suggestions-container">
      <div className="model-suggestions-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L9.41 5.59L15 7L9.41 8.41L8 14L6.59 8.41L1 7L6.59 5.59L8 0Z" />
        </svg>
        <h3>Suggested Mental Models</h3>
        <span className="suggestions-count">{suggestions.length}</span>
      </div>

      <div className="model-suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.model.id || index}
            className="model-suggestion-card"
            onClick={() => onSelectModel(suggestion.model)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectModel(suggestion.model);
              }
            }}
          >
            <div className="suggestion-header">
              <h4>{suggestion.model.name}</h4>
              <span className="relevance-score">{suggestion.relevanceScore}% relevant</span>
            </div>

            <div className="suggestion-code">{suggestion.model.code || 'N/A'}</div>

            <p className="suggestion-reasoning">{suggestion.reasoning}</p>

            <div className="suggestion-application">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 0C3.14 0 0 3.14 0 7C0 10.86 3.14 14 7 14C10.86 14 14 10.86 14 7C14 3.14 10.86 0 7 0ZM6 10L2 6L3 5L6 8L11 3L12 4L6 10Z" />
              </svg>
              {suggestion.applicationSuggestion}
            </div>

            <div className="suggestion-action">
              <span>Click to use this model →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
