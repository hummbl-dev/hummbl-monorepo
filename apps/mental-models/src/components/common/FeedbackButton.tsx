// Feedback widget component

import { useState } from 'react';
import './FeedbackButton.css';

interface FeedbackFormData {
  type: 'bug' | 'feature' | 'general';
  message: string;
  email?: string;
  url: string;
}

export const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general',
    message: '',
    email: '',
    url: window.location.href,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to Google Forms or backend API
      // For now, log to console in development
      if (import.meta.env.DEV) {
        console.log('[Feedback]', formData);
      }

      // TODO: Implement actual submission
      // Example: POST to /api/feedback or Google Forms
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFormData({
          type: 'general',
          message: '',
          email: '',
          url: window.location.href,
        });
      }, 2000);
    } catch (error) {
      console.error('Feedback submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="feedback-button"
        onClick={() => setIsOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
      >
        💬
      </button>

      {isOpen && (
        <div className="feedback-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h3>Send Feedback</h3>
              <button
                className="feedback-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="feedback-success">
                <span className="feedback-success-icon">✓</span>
                <p>Thank you for your feedback!</p>
              </div>
            ) : (
              <form className="feedback-form" onSubmit={handleSubmit}>
                <div className="feedback-field">
                  <label htmlFor="feedback-type">Feedback Type</label>
                  <select
                    id="feedback-type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as FeedbackFormData['type'],
                      })
                    }
                    required
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                <div className="feedback-field">
                  <label htmlFor="feedback-message">Message</label>
                  <textarea
                    id="feedback-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you think..."
                    rows={5}
                    required
                  />
                </div>

                <div className="feedback-field">
                  <label htmlFor="feedback-email">Email (optional)</label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                  <small>We'll only use this to follow up on your feedback</small>
                </div>

                <div className="feedback-field">
                  <label>Current Page</label>
                  <input type="text" value={formData.url} disabled className="feedback-url" />
                </div>

                <button type="submit" className="feedback-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
