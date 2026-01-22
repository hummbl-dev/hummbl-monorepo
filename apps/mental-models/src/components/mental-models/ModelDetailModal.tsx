import { useEffect } from 'react';
import type { MentalModel } from '@cascade/types/mental-model';
import './ModelDetailModal.css';

interface ModelDetailModalProps {
  model: MentalModel;
  onClose: () => void;
}

const ModelDetailModal = ({ model, onClose }: ModelDetailModalProps) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const difficultyStars = model.meta?.difficulty
    ? '●'.repeat(model.meta.difficulty) + '○'.repeat(5 - model.meta.difficulty)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-top">
            <span className="modal-code">{model.code}</span>
            <button className="modal-close" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
          <h2 className="modal-title">{model.name}</h2>

          {/* Badges */}
          <div className="modal-badges">
            <span className="modal-badge modal-badge-category">{model.category}</span>
            {difficultyStars && (
              <span className="modal-badge modal-badge-difficulty">
                {difficultyStars} Difficulty
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Description */}
          <section className="modal-section">
            <h3 className="modal-section-title">Description</h3>
            <p className="modal-description">{model.description}</p>
          </section>

          {/* Example */}
          {model.example && (
            <section className="modal-section">
              <h3 className="modal-section-title">Example</h3>
              <div className="modal-example">{model.example}</div>
            </section>
          )}

          {/* Tags & Transformations */}
          {((model.tags && model.tags.length > 0) ||
            (model.transformations && model.transformations.length > 0)) && (
            <section className="modal-section">
              <h3 className="modal-section-title">Tags & Categories</h3>
              <div className="modal-tags">
                {model.transformations &&
                  model.transformations.map((t: string, i: number) => (
                    <span key={`t-${i}`} className="modal-transformation">
                      {t}
                    </span>
                  ))}
                {model.tags &&
                  model.tags.map((tag: string, i: number) => (
                    <span key={`tag-${i}`} className="modal-tag">
                      {tag}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {/* Sources */}
          {model.sources && model.sources.length > 0 && (
            <section className="modal-section">
              <h3 className="modal-section-title">Sources & References</h3>
              <ul className="modal-sources">
                {model.sources.map((source: { name: string; reference?: string }, i: number) => (
                  <li key={i} className="modal-source">
                    <strong>{source.name}</strong>
                    {source.reference && (
                      <span className="modal-source-ref"> — {source.reference}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Metadata */}
          {model.meta && (
            <section className="modal-section modal-meta-section">
              <h3 className="modal-section-title">Metadata</h3>
              <div className="modal-meta-grid">
                {model.meta.added && (
                  <div className="modal-meta-item">
                    <span className="modal-meta-label">Added:</span>
                    <span className="modal-meta-value">
                      {new Date(model.meta.added).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {model.meta.updated && (
                  <div className="modal-meta-item">
                    <span className="modal-meta-label">Updated:</span>
                    <span className="modal-meta-value">
                      {new Date(model.meta.updated).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {model.meta.difficulty && (
                  <div className="modal-meta-item">
                    <span className="modal-meta-label">Difficulty:</span>
                    <span className="modal-meta-value">{model.meta.difficulty}/5</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-button modal-button-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="modal-button modal-button-primary"
            onClick={() => {
              navigator.clipboard.writeText(
                `${model.name}\n\n${model.description}\n\nSource: HUMMBL.io`
              );
              // Could show a toast notification here
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailModal;
