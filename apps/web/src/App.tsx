import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { AuthProvider } from './contexts/AuthProvider.tsx';
import { Explorer } from './pages/Explorer.tsx';
import { ModelDetail } from './pages/ModelDetail.tsx';
import { UserProfile } from './components/UserProfile.tsx';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Explorer />} />
            <Route path="/model/:id" element={<ModelDetail />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
