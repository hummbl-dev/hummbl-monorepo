import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setError('No verification token provided');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        console.error('Email verification failed:', err);
        setStatus('error');
        setError('Failed to verify email. The link may have expired or is invalid.');
      }
    };

    verifyToken();
  }, [token, verifyEmail]);

  const handleResendEmail = async () => {
    // TODO: Implement resend verification email
    alert('Resend email functionality will be implemented here');
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          {status === 'success' ? (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been successfully verified. You can now log in to your account.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/login')} className="w-full flex justify-center">
                  Go to Login
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <div className="mt-6 space-y-3">
                <Button onClick={handleResendEmail} variant="outline" className="w-full">
                  Resend Verification Email
                </Button>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
