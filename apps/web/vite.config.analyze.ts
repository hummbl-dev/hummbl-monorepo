import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

// Extended Vite config for bundle analysis
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer plugin
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false, // Don't auto-open in CI
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: treemap, sunburst, network
      title: 'HUMMBL Web Bundle Analysis',
      projectRoot: path.resolve(__dirname, '../..'),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hummbl/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Enable minification
    minify: 'esbuild',
    // Chunk size warning threshold
    chunkSizeWarningLimit: 500,
    // Generate detailed analysis
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching and analysis
        manualChunks: id => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          // Data fetching
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          // UI utilities
          if (
            id.includes('class-variance-authority') ||
            id.includes('tailwind-merge') ||
            id.includes('lucide-react')
          ) {
            return 'vendor-ui';
          }
          // Heavy graph visualization
          if (id.includes('react-force-graph-2d') || id.includes('force-graph')) {
            return 'vendor-graph';
          }
          // HTTP client
          if (id.includes('axios')) {
            return 'vendor-http';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          // Fonts
          if (id.includes('@fontsource')) {
            return 'vendor-fonts';
          }
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
          // HUMMBL packages
          if (id.includes('@hummbl/')) {
            if (id.includes('@hummbl/core')) return 'hummbl-core';
            if (id.includes('@hummbl/ui')) return 'hummbl-ui';
            return 'hummbl-other';
          }
        },
        // Use hashed filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Generate source maps for better analysis
    sourcemap: true,
    // Report compressed sizes
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'axios',
    ],
    // Exclude heavy dependencies from pre-bundling
    exclude: ['react-force-graph-2d'],
  },
});
