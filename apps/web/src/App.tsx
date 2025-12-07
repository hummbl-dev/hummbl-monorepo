import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthProvider';

// Lazy load pages for route-based code splitting
// Named exports use .then(), default exports work directly
const Explorer = lazy(() => import('./pages/Explorer').then(m => ({ default: m.Explorer })));
const ModelDetail = lazy(() =>
  import('./pages/ModelDetail').then(m => ({ default: m.ModelDetail }))
);
const UserProfile = lazy(() =>
  import('./components/UserProfile').then(m => ({ default: m.UserProfile }))
);

// Default export pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
      <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
        Loading…
      </p>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Explorer />} />
              <Route path="/model/:id" element={<ModelDetail />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};
