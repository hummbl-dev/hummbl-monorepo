import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Enable minification
    minify: 'esbuild',
    // Chunk size warning threshold (500KB default)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: {
          // React core - rarely changes, cache separately
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // React Query - data fetching layer
          'vendor-query': ['@tanstack/react-query'],
          // UI utilities
          'vendor-ui': ['class-variance-authority', 'tailwind-merge', 'lucide-react'],
          // Heavy graph visualization - lazy loaded anyway
          'vendor-graph': ['react-force-graph-2d'],
          // Axios HTTP client
          'vendor-http': ['axios'],
        },
        // Use hashed filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Generate source maps for debugging (external for smaller bundles)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    // Exclude heavy dependencies from pre-bundling
    exclude: ['react-force-graph-2d'],
  },
});
