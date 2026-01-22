// Login modal with Supabase authentication

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'signin' | 'signup';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onSuccess?.();
      onClose();
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'azure' | 'apple') => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Don't set loading to false on success - redirect will happen
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="login-header">
          <h2>{mode === 'signin' ? 'Sign In to HUMMBL' : 'Create Account'}</h2>
          <button className="login-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="oauth-section">
          <button
            type="button"
            className="oauth-btn google"
            onClick={() => handleOAuth('google')}
            disabled={loading}
          >
            <span className="oauth-icon">G</span>
            Continue with Google
          </button>
          <button
            type="button"
            className="oauth-btn github"
            onClick={() => handleOAuth('github')}
            disabled={loading}
          >
            <span className="oauth-icon">⚡</span>
            Continue with GitHub
          </button>
          <button
            type="button"
            className="oauth-btn microsoft"
            onClick={() => handleOAuth('azure')}
            disabled={loading}
          >
            <span className="oauth-icon">M</span>
            Continue with Microsoft
          </button>
          <button
            type="button"
            className="oauth-btn apple"
            onClick={() => handleOAuth('apple')}
            disabled={loading}
          >
            <span className="oauth-icon"></span>
            Continue with Apple
          </button>
        </div>

        <div className="login-divider">
          <span>or continue with email</span>
        </div>

        {/* Email/Password Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-btn primary"
            disabled={loading || !email || !password}
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="login-footer">
          <button
            type="button"
            className="login-toggle"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            disabled={loading}
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
