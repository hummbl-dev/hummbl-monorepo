import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Google, Github } from '../ui/icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (view === 'login') {
        await login('email', { email: formData.email, password: formData.password });
        onClose();
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await register(formData.email, formData.password, formData.name);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    setIsLoading(true);

    try {
      await login(provider);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setShowPassword(false);
  };

  const switchView = (newView: 'login' | 'register') => {
    setView(newView);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="mb-6 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('google')}
            disabled={isLoading}
          >
            <Google className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('github')}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center">
          <div className="flex-1 border-t border-gray-300" />
          <span className="mx-3 px-2 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                required={view === 'register'}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {view === 'register' && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {view === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : view === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {view === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => switchView('register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => switchView('login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
