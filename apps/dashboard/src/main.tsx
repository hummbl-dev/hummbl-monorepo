import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import './index.css';

import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { TemporalPage } from './pages/TemporalPage';
import { AuditPage } from './pages/AuditPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { CheckerPage } from './pages/CheckerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      staleTime: 3000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          closeButton
          toastOptions={{
            className: 'font-sans',
            duration: 4000,
          }}
        />
        <AuthGuard>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<HomePage />} />
                <Route path="temporal" element={<TemporalPage />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="profiles" element={<ProfilesPage />} />
                <Route path="check" element={<CheckerPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthGuard>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
