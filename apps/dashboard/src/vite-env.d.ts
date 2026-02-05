/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_SECRET?: string;
  readonly VITE_DASHBOARD_ROLE?: 'admin' | 'operator' | 'viewer';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
