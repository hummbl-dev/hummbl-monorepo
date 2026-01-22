// Narrative Detail Modal Component

import { useEffect, useState } from 'react';
import type { Narrative } from '../../../cascade/types/narrative';
import {
  generateScholarUrl,
  getDirectSourceUrl,
  copyCitationToClipboard,
} from '../../utils/citationLinks';
import './NarrativeDetailModal.css';

interface NarrativeDetailModalProps {
  narrative: Narrative | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'examples' | 'citations' | 'methods' | 'relationships';

export function NarrativeDetailModal({ narrative, isOpen, onClose }: NarrativeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Reset to overview tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !narrative) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        {/* Header */}
        <header className="modal-header">
          <div className="modal-title-section">
            <div className="modal-id">{narrative.narrative_id}</div>
            <h2 id="modal-title" className="modal-title">
              {narrative.title}
            </h2>
          </div>
          <div className="modal-badges">
            <span className={`evidence-badge grade-${narrative.evidence_quality.toLowerCase()}`}>
              {narrative.evidence_quality}
            </span>
            <span
              className={`category-badge category-${narrative.category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {narrative.category}
            </span>
          </div>
          <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </header>

        {/* Metrics Bar */}
        <div className="modal-metrics">
          <div className="metric">
            <span className="metric-label">Confidence</span>
            <span className="metric-value">
              {narrative.confidence ? (narrative.confidence * 100).toFixed(0) : '0'}%
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Signals</span>
            <span className="metric-value">{narrative.linked_signals?.length || 0}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Relations</span>
            <span className="metric-value">{narrative.relationships?.length || 0}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Citations</span>
            <span className="metric-value">{narrative.citations?.length || 0}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="modal-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="overview-panel"
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'examples'}
            aria-controls="examples-panel"
            className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
            onClick={() => setActiveTab('examples')}
          >
            Examples ({narrative.examples?.length || 0})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'citations'}
            aria-controls="citations-panel"
            className={`tab ${activeTab === 'citations' ? 'active' : ''}`}
            onClick={() => setActiveTab('citations')}
          >
            Citations ({narrative.citations?.length || 0})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'methods'}
            aria-controls="methods-panel"
            className={`tab ${activeTab === 'methods' ? 'active' : ''}`}
            onClick={() => setActiveTab('methods')}
          >
            Methods ({narrative.elicitation_methods?.length || 0})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'relationships'}
            aria-controls="relationships-panel"
            className={`tab ${activeTab === 'relationships' ? 'active' : ''}`}
            onClick={() => setActiveTab('relationships')}
          >
            Relationships ({narrative.relationships?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {activeTab === 'overview' && (
            <div id="overview-panel" role="tabpanel" className="tab-panel">
              <section className="section">
                <h3 className="section-title">Summary</h3>
                <p className="section-text">{narrative.summary}</p>
              </section>

              <section className="section">
                <h3 className="section-title">Complexity</h3>
                <div className="complexity-grid">
                  <div className="complexity-item">
                    <span className="complexity-label">Cognitive Load</span>
                    <span className={`complexity-value ${narrative.complexity?.cognitive_load}`}>
                      {narrative.complexity?.cognitive_load || 'N/A'}
                    </span>
                  </div>
                  <div className="complexity-item">
                    <span className="complexity-label">Time to Elicit</span>
                    <span className="complexity-value">
                      {narrative.complexity?.time_to_elicit || 'N/A'}
                    </span>
                  </div>
                  <div className="complexity-item">
                    <span className="complexity-label">Expertise Required</span>
                    <span
                      className={`complexity-value ${narrative.complexity?.expertise_required}`}
                    >
                      {narrative.complexity?.expertise_required || 'N/A'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="section">
                <h3 className="section-title">Domains</h3>
                <div className="tag-list">
                  {narrative.domain?.map((domain) => (
                    <span key={domain} className="domain-tag">
                      {domain}
                    </span>
                  ))}
                </div>
              </section>

              <section className="section">
                <h3 className="section-title">Tags</h3>
                <div className="tag-list">
                  {narrative.tags?.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {narrative.related_frameworks && narrative.related_frameworks.length > 0 && (
                <section className="section">
                  <h3 className="section-title">Related Frameworks</h3>
                  <ul className="framework-list">
                    {narrative.related_frameworks.map((framework, idx) => (
                      <li key={idx} className="framework-item">
                        {framework}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {activeTab === 'examples' && (
            <div id="examples-panel" role="tabpanel" className="tab-panel">
              {narrative.examples && narrative.examples.length > 0 ? (
                <div className="examples-grid">
                  {narrative.examples.map((example: any, idx: number) => {
                    // Handle both string and object examples
                    if (typeof example === 'string') {
                      return (
                        <div key={idx} className="example-card">
                          <p className="example-text">{example}</p>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="example-card">
                        <div className="example-section">
                          <h4 className="example-label">🎯 Scenario</h4>
                          <p className="example-text">{example.scenario}</p>
                        </div>
                        <div className="example-section">
                          <h4 className="example-label">⚙️ Application</h4>
                          <p className="example-text">{example.application}</p>
                        </div>
                        <div className="example-section">
                          <h4 className="example-label">✅ Outcome</h4>
                          <p className="example-text">{example.outcome}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No examples available for this narrative.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'citations' && (
            <div id="citations-panel" role="tabpanel" className="tab-panel">
              {narrative.citations && narrative.citations.length > 0 ? (
                <div className="citations-list">
                  {narrative.citations.map((citation, idx) => {
                    const scholarUrl = generateScholarUrl(citation);
                    const directUrl = getDirectSourceUrl(citation);

                    return (
                      <div key={idx} className="citation-card">
                        <div className="citation-number">{idx + 1}</div>
                        <div className="citation-content">
                          <div className="citation-author">{citation.author}</div>
                          <div className="citation-title">{citation.title}</div>
                          <div className="citation-source">
                            <em>{citation.source}</em>, {citation.year}
                          </div>
                          <div className="citation-links">
                            <a
                              href={scholarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="citation-link scholar-link"
                              aria-label={`Search for "${citation.title}" on Google Scholar`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                              </svg>
                              Google Scholar
                            </a>
                            {directUrl && (
                              <a
                                href={directUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="citation-link direct-link"
                                aria-label={`Direct link to ${citation.title}`}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                Direct Link
                              </a>
                            )}
                            <button
                              className="citation-link copy-link"
                              onClick={() => copyCitationToClipboard(citation)}
                              aria-label={`Copy citation for "${citation.title}"`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No citations available for this narrative.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'methods' && (
            <div id="methods-panel" role="tabpanel" className="tab-panel">
              {narrative.elicitation_methods && narrative.elicitation_methods.length > 0 ? (
                <div className="methods-grid">
                  {narrative.elicitation_methods.map((method, idx) => (
                    <div key={idx} className="method-card">
                      <h4 className="method-name">🔧 {method.method}</h4>
                      <div className="method-details">
                        <div className="method-detail">
                          <span className="method-label">Duration:</span>
                          <span className="method-value">⏱️ {method.duration}</span>
                        </div>
                        <div className="method-detail">
                          <span className="method-label">Difficulty:</span>
                          <span className={`difficulty-badge ${method.difficulty}`}>
                            {method.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No elicitation methods available for this narrative.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'relationships' && (
            <div id="relationships-panel" role="tabpanel" className="tab-panel">
              {narrative.relationships && narrative.relationships.length > 0 ? (
                <div className="relationships-list">
                  {narrative.relationships.map((rel, idx) => (
                    <div key={idx} className="relationship-card">
                      <div className="relationship-type">{rel.type}</div>
                      <div className="relationship-target">→ {rel.target}</div>
                      <div className="relationship-description">{rel.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No relationships available for this narrative.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
