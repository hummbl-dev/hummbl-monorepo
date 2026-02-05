// Skeleton loading component for narrative cards

import './NarrativeCardSkeleton.css';

export function NarrativeCardSkeleton() {
  return (
    <div className="narrative-card-skeleton" aria-busy="true" aria-label="Loading narrative">
      {/* Header */}
      <div className="skeleton-header">
        <div className="skeleton-title-section">
          <div className="skeleton-title"></div>
          <div className="skeleton-id"></div>
        </div>
        <div className="skeleton-badges">
          <div className="skeleton-badge"></div>
          <div className="skeleton-badge skeleton-badge-wide"></div>
        </div>
      </div>

      {/* Summary */}
      <div className="skeleton-summary">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-line-short"></div>
      </div>

      {/* Complexity badges */}
      <div className="skeleton-complexity">
        <div className="skeleton-chip"></div>
        <div className="skeleton-chip"></div>
        <div className="skeleton-chip"></div>
      </div>

      {/* Domains */}
      <div className="skeleton-domains">
        <div className="skeleton-domain"></div>
        <div className="skeleton-domain"></div>
        <div className="skeleton-domain"></div>
      </div>

      {/* Metrics */}
      <div className="skeleton-metrics">
        <div className="skeleton-metric">
          <div className="skeleton-metric-label"></div>
          <div className="skeleton-metric-value"></div>
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-metric-label"></div>
          <div className="skeleton-metric-value"></div>
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-metric-label"></div>
          <div className="skeleton-metric-value"></div>
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-metric-label"></div>
          <div className="skeleton-metric-value"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="skeleton-tags">
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag skeleton-tag-small"></div>
      </div>
    </div>
  );
}
