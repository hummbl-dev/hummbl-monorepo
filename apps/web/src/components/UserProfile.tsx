import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './components.css';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  if (!user) {
    return <div className="p-6 text-center">Please log in to view your profile.</div>;
  }

  const handleResendVerification = async () => {
    // TODO: Implement resend verification email
    setShowVerificationMessage(true);
    setTimeout(() => setShowVerificationMessage(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h1 className="text-2xl font-light text-zinc-100 mb-6">User Profile</h1>

        {/* User Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
              <span className="text-xl text-zinc-400">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-zinc-100">{user.name}</h2>
              <p className="text-sm text-zinc-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    user.emailVerified
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {user.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
                <span className="text-xs text-zinc-500 capitalize">{user.provider}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification */}
        {!user.emailVerified && user.provider === 'email' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-amber-400 mb-2">Email Verification Required</h3>
            <p className="text-xs text-zinc-400 mb-3">
              Please verify your email address to access all features.
            </p>
            <button
              onClick={handleResendVerification}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded transition-colors"
            >
              Resend Verification Email
            </button>
            {showVerificationMessage && (
              <p className="text-xs text-emerald-400 mt-2">
                Verification email sent! Check your inbox.
              </p>
            )}
          </div>
        )}

        {/* Account Actions */}
        <div className="border-t border-zinc-800 pt-6">
          <h3 className="text-sm font-medium text-zinc-100 mb-4">Account Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
              Export My Data
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
              Privacy Settings
            </button>
            <button
              onClick={() => logout()}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 rounded transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-zinc-800 pt-6 mt-6">
          <h3 className="text-sm font-medium text-zinc-100 mb-4">Your Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-800 rounded p-3">
              <div className="text-lg font-light text-zinc-100">0</div>
              <p className="text-xs text-zinc-500">Models Completed</p>
            </div>
            <div className="bg-zinc-800 rounded p-3">
              <div className="text-lg font-light text-zinc-100">0</div>
              <p className="text-xs text-zinc-500">Day Streak</p>
            </div>
            <div className="bg-zinc-800 rounded p-3">
              <div className="text-lg font-light text-zinc-100">0</div>
              <p className="text-xs text-zinc-500">Total Sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
