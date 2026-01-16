/**
 * Bundle Size Configuration
 *
 * This configuration defines size budgets and monitoring settings
 * for the HUMMBL web application bundles.
 */

export const bundleSizeBudgets = {
  // Main JavaScript bundle size limit (gzipped)
  mainJsBundle: {
    limit: 200, // KB
    warning: 180, // KB - warn when approaching limit
    description: 'Main application JavaScript bundle'
  },

  // CSS bundle size limit (gzipped)
  cssBundle: {
    limit: 50, // KB
    warning: 40, // KB
    description: 'Combined CSS stylesheets'
  },

  // Individual chunk size limit (gzipped)
  individualChunk: {
    limit: 100, // KB
    warning: 80, // KB
    description: 'Individual JavaScript chunks'
  },

  // Vendor chunks (third-party libraries)
  vendorChunks: {
    'vendor-react': {
      limit: 150, // KB
      warning: 130, // KB
      description: 'React core libraries (react, react-dom, react-router)'
    },
    'vendor-query': {
      limit: 50, // KB
      warning: 40, // KB
      description: 'TanStack Query for data fetching'
    },
    'vendor-ui': {
      limit: 80, // KB
      warning: 60, // KB
      description: 'UI utility libraries (CVA, tailwind-merge, lucide-react)'
    },
    'vendor-graph': {
      limit: 200, // KB
      warning: 180, // KB
      description: 'Graph visualization library (react-force-graph-2d)'
    },
    'vendor-http': {
      limit: 30, // KB
      warning: 25, // KB
      description: 'HTTP client library (axios)'
    }
  },

  // Total bundle size limits
  total: {
    js: {
      limit: 600, // KB total for all JS
      warning: 500, // KB
      description: 'Total JavaScript bundle size'
    },
    css: {
      limit: 100, // KB total for all CSS
      warning: 80, // KB
      description: 'Total CSS bundle size'
    },
    assets: {
      limit: 1000, // KB total for all assets
      warning: 800, // KB
      description: 'Total asset size including JS, CSS, images'
    }
  }
};

export const monitoringSettings = {
  // Minimum change threshold to report (in bytes)
  minimumChangeThreshold: 1024, // 1KB

  // Files to monitor
  patterns: [
    'apps/web/dist/**/*.js',
    'apps/web/dist/**/*.css',
    'apps/web/dist/**/*.html'
  ],

  // Files to exclude from monitoring
  excludePatterns: [
    '**/*.map',
    '**/node_modules/**',
    '**/*.d.ts'
  ],

  // Compression methods to test
  compression: {
    gzip: true,
    brotli: false // Enable when needed
  },

  // Artifact retention
  artifactRetentionDays: 7,

  // Alert thresholds
  alerts: {
    // Fail build if budget exceeded by this percentage
    failThreshold: 0, // 0% - fail immediately on budget exceed

    // Warn if approaching budget within this percentage
    warnThreshold: 90, // 90% of budget

    // Create GitHub issue if bundle size increases significantly
    significantIncreaseThreshold: 20 // 20% increase
  }
};

export const optimizationSuggestions = {
  // Size-based recommendations
  sizeRanges: {
    small: { max: 50, suggestions: ['Consider code splitting opportunities'] },
    medium: { max: 100, suggestions: ['Review dependencies', 'Implement lazy loading'] },
    large: { max: 200, suggestions: ['Critical: Split large chunks', 'Remove unused code', 'Use dynamic imports'] },
    oversized: { max: Infinity, suggestions: ['Urgent: Major refactoring needed', 'Audit all dependencies', 'Implement aggressive code splitting'] }
  },

  // Common optimization strategies
  strategies: [
    'Code splitting with React.lazy()',
    'Dynamic imports for heavy libraries',
    'Tree shaking unused exports',
    'Bundle analysis to identify large dependencies',
    'Lazy loading of non-critical components',
    'Compression optimization (gzip/brotli)',
    'Image optimization and WebP conversion',
    'Font loading optimization',
    'Service worker caching strategies'
  ]
};

// Export default configuration
export default {
  budgets: bundleSizeBudgets,
  monitoring: monitoringSettings,
  optimization: optimizationSuggestions
};