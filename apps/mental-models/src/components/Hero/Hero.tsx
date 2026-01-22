import React from 'react';
import { ViewType } from '../../../cascade/types/view';
import './Hero.css';

interface HeroProps {
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
}

export const Hero: React.FC<HeroProps> = ({ onViewChange, currentView }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-header">
          <h2 className="hero-title">Cognitive Framework for Better Thinking</h2>
          <p className="hero-subtitle">
            Master proven mental models and transformational frameworks to improve decision-making,
            solve complex problems, and think more clearly.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">120</div>
              <div className="stat-label">Mental Models</div>
              <div className="stat-description">
                Practical cognitive patterns for everyday thinking and decision-making
              </div>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">6</div>
              <div className="stat-label">Transformations</div>
              <div className="stat-description">
                Meta-frameworks for systematic change and cognitive restructuring
              </div>
            </div>
          </div>
        </div>

        <div className="hero-cta">
          <button
            className={`hero-cta-button ${currentView === 'models' ? 'active' : ''}`}
            onClick={() => onViewChange('models')}
            aria-label="Explore Mental Models"
            aria-pressed={currentView === 'models'}
          >
            <span>Explore Mental Models</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            className={`hero-cta-button ${currentView === 'narratives' ? 'active' : ''}`}
            onClick={() => onViewChange('narratives')}
            aria-label="Learn About Transformations"
            aria-pressed={currentView === 'narratives'}
          >
            <span>Discover Transformations</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            className={`hero-cta-button ${currentView === 'beta' ? 'active' : ''}`}
            onClick={() => onViewChange('beta')}
            aria-label="Join Beta Program"
            aria-pressed={currentView === 'beta'}
          >
            <span>Join Beta</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="hero-features">
          <div className="feature">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Evidence-based frameworks</span>
          </div>
          <div className="feature">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Practical examples</span>
          </div>
          <div className="feature">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Organized by transformation type</span>
          </div>
        </div>
      </div>
    </section>
  );
};
