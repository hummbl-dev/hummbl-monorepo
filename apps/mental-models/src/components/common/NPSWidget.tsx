// NPS (Net Promoter Score) survey widget

import { useState, useEffect } from 'react';
import './NPSWidget.css';

interface NPSData {
  score: number;
  reason: string;
  timestamp: number;
}

const NPS_STORAGE_KEY = 'hummbl_nps_data';
const NPS_SHOWN_KEY = 'hummbl_nps_shown';
const SESSION_COUNT_KEY = 'hummbl_session_count';
const TOTAL_TIME_KEY = 'hummbl_total_time';

export const NPSWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if NPS should be shown
    const checkNPSTrigger = () => {
      const alreadyShown = localStorage.getItem(NPS_SHOWN_KEY);
      if (alreadyShown) {
        return; // Already shown, don't show again
      }

      // Track sessions
      const sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0');
      localStorage.setItem(SESSION_COUNT_KEY, String(sessionCount + 1));

      // Track total time spent (in seconds)
      const startTime = Date.now();
      const updateTime = () => {
        const totalTime = parseInt(localStorage.getItem(TOTAL_TIME_KEY) || '0');
        const sessionTime = Math.floor((Date.now() - startTime) / 1000);
        localStorage.setItem(TOTAL_TIME_KEY, String(totalTime + sessionTime));
      };

      window.addEventListener('beforeunload', updateTime);

      // Show after 3 sessions OR 10 minutes total usage
      if (sessionCount >= 3) {
        setTimeout(() => setIsVisible(true), 5000); // 5 second delay
      } else {
        const totalTime = parseInt(localStorage.getItem(TOTAL_TIME_KEY) || '0');
        if (totalTime >= 600) {
          // 10 minutes = 600 seconds
          setTimeout(() => setIsVisible(true), 5000);
        }
      }

      return () => window.removeEventListener('beforeunload', updateTime);
    };

    checkNPSTrigger();
  }, []);

  const handleScoreClick = (selectedScore: number) => {
    setScore(selectedScore);
  };

  const handleSubmit = () => {
    if (score === null) return;

    const npsData: NPSData = {
      score,
      reason,
      timestamp: Date.now(),
    };

    // Save to localStorage
    localStorage.setItem(NPS_STORAGE_KEY, JSON.stringify(npsData));
    localStorage.setItem(NPS_SHOWN_KEY, 'true');

    // Track in analytics
    if (import.meta.env.DEV) {
      console.log('[NPS Survey]', npsData);
    }

    // TODO: Send to backend
    // fetch('/api/nps', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(npsData),
    // });

    setSubmitted(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  const handleDismiss = () => {
    localStorage.setItem(NPS_SHOWN_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Unused helper function - may be needed in future UI enhancements
  // const getScoreLabel = (s: number): string => {
  //   if (s <= 6) return 'Not likely';
  //   if (s <= 8) return 'Neutral';
  //   return 'Very likely';
  // };

  const getFollowUpPrompt = (): string => {
    if (score === null) return '';
    if (score <= 6) return 'What would make you more likely to recommend HUMMBL?';
    if (score <= 8) return 'What can we improve?';
    return 'What do you love most about HUMMBL?';
  };

  return (
    <div className="nps-overlay">
      <div className="nps-widget">
        {!submitted ? (
          <>
            <button className="nps-dismiss" onClick={handleDismiss} aria-label="Dismiss survey">
              ×
            </button>

            <div className="nps-content">
              <h3 className="nps-title">Quick Question</h3>
              <p className="nps-question">
                How likely are you to recommend HUMMBL to a friend or colleague?
              </p>

              <div className="nps-scale">
                <div className="nps-scores">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      className={`nps-score ${score === num ? 'selected' : ''}`}
                      onClick={() => handleScoreClick(num)}
                      aria-label={`Score ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="nps-labels">
                  <span>Not likely</span>
                  <span>Very likely</span>
                </div>
              </div>

              {score !== null && (
                <div className="nps-followup">
                  <label htmlFor="nps-reason">{getFollowUpPrompt()}</label>
                  <textarea
                    id="nps-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Your feedback helps us improve..."
                    rows={3}
                  />
                  <button className="nps-submit" onClick={handleSubmit}>
                    Submit
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="nps-success">
            <span className="nps-success-icon">✓</span>
            <h3>Thank you for your feedback!</h3>
            <p>Your input helps us make HUMMBL better.</p>
          </div>
        )}
      </div>
    </div>
  );
};
