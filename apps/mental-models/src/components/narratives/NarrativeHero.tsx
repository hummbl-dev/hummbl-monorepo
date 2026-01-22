// Narrative Hero Section Component

import './NarrativeHero.css';

interface NarrativeHeroProps {
  narrativeCount: number;
}

export function NarrativeHero({ narrativeCount }: NarrativeHeroProps) {
  return (
    <section className="narrative-hero">
      <div className="narrative-hero-content">
        <div className="narrative-hero-header">
          <h2 className="narrative-hero-title">Cognitive Narratives Framework</h2>
          <p className="narrative-hero-subtitle">
            Deep-dive into the {narrativeCount} core narrative structures that shape cognitive
            elicitation, knowledge representation, and systematic thinking patterns.
          </p>
        </div>

        <div className="narrative-hero-stats">
          <div className="narrative-stat-card">
            <div className="narrative-stat-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="narrative-stat-content">
              <div className="narrative-stat-number">{narrativeCount}</div>
              <div className="narrative-stat-label">Core Narratives</div>
              <div className="narrative-stat-description">
                Foundational narrative structures for systematic elicitation
              </div>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="narrative-stat-card">
            <div className="narrative-stat-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="narrative-stat-content">
              <div className="narrative-stat-number">120+</div>
              <div className="narrative-stat-label">Connected Models</div>
              <div className="narrative-stat-description">
                Mental models linked through narrative frameworks
              </div>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="narrative-stat-card">
            <div className="narrative-stat-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="narrative-stat-content">
              <div className="narrative-stat-number">A-Grade</div>
              <div className="narrative-stat-label">Evidence Quality</div>
              <div className="narrative-stat-description">
                Academically validated with peer-reviewed citations
              </div>
            </div>
          </div>
        </div>

        <div className="narrative-hero-features">
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
            <span>Academically cited & validated</span>
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
            <span>Practical elicitation methods</span>
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
            <span>Real-world application examples</span>
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
            <span>Cross-referenced relationships</span>
          </div>
        </div>
      </div>
    </section>
  );
}
