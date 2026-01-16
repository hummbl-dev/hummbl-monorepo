# Bundle Size Monitoring

This document describes the bundle size monitoring system for the HUMMBL web application, including how to interpret reports, optimization strategies, and when size increases are acceptable.

## Overview

Bundle size monitoring helps maintain optimal performance by:
- Tracking bundle size changes over time
- Preventing performance regressions
- Providing actionable insights for optimization
- Automating size checks in CI/CD pipeline

## Size Budgets

The system enforces the following size budgets (gzipped):

### JavaScript Bundles
- **Main Bundle**: 200KB limit (180KB warning)
- **Individual Chunks**: 100KB limit (80KB warning)
- **Total JavaScript**: 600KB limit (500KB warning)

### Vendor Chunks
- **React Core** (`vendor-react`): 150KB limit
- **TanStack Query** (`vendor-query`): 50KB limit
- **UI Libraries** (`vendor-ui`): 80KB limit
- **Graph Visualization** (`vendor-graph`): 200KB limit
- **HTTP Client** (`vendor-http`): 30KB limit

### CSS Bundles
- **CSS Bundle**: 50KB limit (40KB warning)
- **Total CSS**: 100KB limit (80KB warning)

### Total Assets
- **All Assets**: 1000KB limit (800KB warning)

## How It Works

### GitHub Actions Integration

The bundle size monitoring runs automatically:

1. **On Pull Requests**: Analyzes changes and comments with size impact
2. **On Main Branch**: Tracks baseline sizes for future comparisons
3. **Build Failures**: Fails CI if budgets are exceeded

### Workflow Components

1. **Bundle Size Check**: Measures and validates against budgets
2. **Compressed Size Action**: Compares sizes with baseline
3. **Bundle Analysis**: Generates visual breakdown of bundle composition
4. **PR Comments**: Provides immediate feedback on size changes

## Tools and Scripts

### Local Analysis

```bash
# Build and analyze bundle
pnpm --filter @hummbl/web analyze

# Check bundle sizes against budgets
pnpm --filter @hummbl/web bundle-size

# Build with analysis (without opening browser)
pnpm --filter @hummbl/web build:analyze
```

### Available Reports

1. **Console Report**: Detailed text output with budget checks
2. **HTML Visualization**: Interactive treemap of bundle composition
3. **GitHub Comments**: Automated PR feedback with size changes
4. **Artifacts**: Downloadable analysis files in CI

## Interpreting Bundle Reports

### Console Output

The bundle size checker provides color-coded output:

- ✅ **Green**: Within budget
- ⚠️ **Yellow**: Approaching budget (>90% of limit)
- ❌ **Red**: Exceeds budget

Example output:
```
📦 MAIN BUNDLES
---------------
✅ main-a1b2c3d4.js: 180KB gzipped (within 200KB budget - 90%)
⚠️ main-styles-e5f6g7h8.css: 42KB gzipped (approaching 50KB budget - 84%)

📚 VENDOR CHUNKS
----------------
✅ vendor-react-i9j0k1l2.js: 145KB gzipped (within 150KB budget - 97%)
❌ vendor-graph-m3n4o5p6.js: 220KB gzipped (exceeds 200KB budget by 20KB - 110%)
```

### Visual Analysis

The HTML report (`dist/bundle-analysis.html`) provides:

- **Treemap View**: Visual representation of bundle composition
- **Size Information**: Both original and compressed sizes
- **Dependency Tree**: How modules are bundled together
- **Large Dependencies**: Identifies biggest contributors

### GitHub PR Comments

Automated comments include:

- **Size Changes**: Comparison with baseline
- **Budget Status**: Pass/fail for each category
- **Recommendations**: Specific optimization suggestions
- **Artifact Links**: Where to download detailed analysis

## Optimization Strategies

### Code Splitting

```typescript
// Lazy load heavy components
const GraphVisualization = React.lazy(() => import('./GraphVisualization'));

// Dynamic imports for large libraries
const loadHeavyLibrary = () => import('heavy-library').then(lib => lib.default);
```

### Bundle Analysis

1. **Identify Large Dependencies**:
   - Open `dist/bundle-analysis.html`
   - Look for unexpectedly large modules
   - Consider alternatives or lazy loading

2. **Check for Duplicates**:
   - Multiple versions of same library
   - Shared dependencies in wrong chunks

3. **Tree Shaking**:
   - Import only needed functions
   - Use ES modules for better tree shaking

### Chunk Optimization

```typescript
// vite.config.ts - Manual chunking
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group related dependencies
          'vendor-ui': ['@radix-ui/react-dialog', 'lucide-react'],
          // Separate heavy libraries
          'vendor-charts': ['react-force-graph-2d'],
        }
      }
    }
  }
});
```

### Dependency Management

1. **Bundle Analysis**: Regularly review dependencies
2. **Alternatives**: Consider smaller alternatives
3. **Lazy Loading**: Load non-critical code on demand
4. **CDN Usage**: For common libraries (when appropriate)

## When Size Increases Are Acceptable

Size increases may be acceptable when:

### New Features
- **Significant User Value**: Feature provides substantial benefit
- **No Alternative**: No smaller way to implement functionality
- **Future Optimization**: Plan exists to optimize later
- **Temporary**: Short-term increase with optimization roadmap

### Security Updates
- **Critical Fixes**: Security patches take priority
- **Dependency Updates**: Required for vulnerability fixes

### Performance Improvements
- **Better UX**: Slight size increase for significant UX improvement
- **Runtime Performance**: Trade bundle size for runtime performance

### Documentation Requirements
Size increases should be documented with:

1. **Justification**: Why the increase is necessary
2. **Mitigation Plan**: Steps to optimize in the future
3. **Alternative Analysis**: Why smaller alternatives weren't viable
4. **Timeline**: When optimization will be addressed

## Configuration

### Budget Adjustment

Edit `bundle-size.config.js` to adjust budgets:

```javascript
export const bundleSizeBudgets = {
  mainJsBundle: {
    limit: 200, // KB
    warning: 180, // KB
    description: 'Main application bundle'
  }
  // ... other budgets
};
```

### Workflow Customization

Modify `.github/workflows/bundle-size.yml`:

- **Triggers**: Change when workflow runs
- **Thresholds**: Adjust failure conditions
- **Reporting**: Customize comment format

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check if dist exists
   ls apps/web/dist

   # Rebuild if missing
   pnpm --filter @hummbl/web build
   ```

2. **Missing Dependencies**:
   ```bash
   # Install analysis tools
   cd apps/web
   pnpm add -D rollup-plugin-visualizer
   ```

3. **Permission Errors**:
   ```bash
   # Make script executable
   chmod +x apps/web/scripts/bundle-size-check.js
   ```

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable
DEBUG=bundle-size pnpm --filter @hummbl/web bundle-size
```

## Best Practices

### Development Workflow

1. **Before Major Changes**: Run analysis to establish baseline
2. **During Development**: Monitor size impact of new dependencies
3. **Before PR**: Run bundle size check locally
4. **After PR Merge**: Review CI reports for trends

### Monitoring

1. **Weekly Reviews**: Check bundle size trends
2. **Dependency Audits**: Regular review of dependencies
3. **Performance Testing**: Correlate bundle size with load times
4. **User Analytics**: Monitor real-world performance impact

### Team Guidelines

1. **Size Awareness**: Consider bundle impact of new dependencies
2. **Code Reviews**: Include bundle size considerations
3. **Documentation**: Document size trade-offs in PRs
4. **Training**: Ensure team understands optimization techniques

## Resources

### Tools
- [Rollup Plugin Visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [Compressed Size Action](https://github.com/preactjs/compressed-size-action)
- [Bundle Buddy](https://bundle-buddy.com/)

### References
- [Web.dev Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Vite Bundle Analysis](https://vitejs.dev/guide/build.html#build-optimizations)
- [React Code Splitting](https://reactjs.org/docs/code-splitting.html)

## Support

For questions or issues with bundle size monitoring:

1. Check this documentation first
2. Review existing GitHub issues
3. Create issue with bundle analysis report
4. Tag @frontend-team for urgent matters