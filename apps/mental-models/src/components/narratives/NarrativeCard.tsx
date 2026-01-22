// Narrative card component

import type { Narrative } from '../../../cascade/types/narrative';
import './NarrativeCard.css';

interface NarrativeCardProps {
  narrative: Narrative;
  onClick?: () => void;
}

export function NarrativeCard({ narrative, onClick }: NarrativeCardProps) {
  // Early return if narrative is incomplete
  if (!narrative || !narrative.title) {
    return null;
  }

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className="narrative-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${narrative.title}`}
    >
      {/* Header */}
      <header className="narrative-card-header">
        <h3 className="narrative-card-title">{narrative.title}</h3>
        {narrative.category && (
          <span className="narrative-category-badge">{narrative.category}</span>
        )}
      </header>

      {/* Summary */}
      <p className="narrative-card-summary">{narrative.summary}</p>

      {/* Footer with minimal info */}
      <div className="narrative-card-footer">
        <div className="narrative-meta">
          {narrative.evidence_quality && (
            <span className="evidence-grade" title="Evidence Quality">
              Grade {narrative.evidence_quality}
            </span>
          )}
          {narrative.linked_signals && narrative.linked_signals.length > 0 && (
            <span className="signal-count" title="Linked Signals">
              {narrative.linked_signals.length}{' '}
              {narrative.linked_signals.length === 1 ? 'signal' : 'signals'}
            </span>
          )}
        </div>
        <button
          className="narrative-details-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          aria-label={`View details for ${narrative.title}`}
        >
          Details →
        </button>
      </div>
    </article>
  );
}
