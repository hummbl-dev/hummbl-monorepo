// Code quality metrics and analysis

export interface CodeQualityMetrics {
  testCoverage: number;
  componentCount: number;
  utilityCount: number;
  averageFileSize: number;
  typeScriptUsage: number;
  lintIssues: number;
  buildTime: number;
  bundleSize: number;
  timestamp: number;
}

export interface QualityScore {
  overall: number;
  categories: {
    testing: number;
    structure: number;
    performance: number;
    maintainability: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

const QUALITY_METRICS_KEY = 'hummbl_code_quality_metrics';

/**
 * Calculate quality score from metrics
 */
export function calculateQualityScore(metrics: CodeQualityMetrics): QualityScore {
  const scores = {
    testing: 0,
    structure: 0,
    performance: 0,
    maintainability: 0,
  };

  const recommendations: string[] = [];

  // Testing score (40 points)
  if (metrics.testCoverage >= 80) {
    scores.testing = 40;
  } else if (metrics.testCoverage >= 70) {
    scores.testing = 35;
    recommendations.push('Increase test coverage to 80%+');
  } else if (metrics.testCoverage >= 60) {
    scores.testing = 30;
    recommendations.push('Increase test coverage to 70%+');
  } else {
    scores.testing = Math.floor(metrics.testCoverage / 2);
    recommendations.push('Critical: Test coverage below 60%');
  }

  // Structure score (25 points)
  const avgSizeScore =
    metrics.averageFileSize < 200
      ? 15
      : metrics.averageFileSize < 300
        ? 12
        : metrics.averageFileSize < 400
          ? 10
          : 5;

  const tsUsageScore =
    metrics.typeScriptUsage >= 90
      ? 10
      : metrics.typeScriptUsage >= 80
        ? 8
        : metrics.typeScriptUsage >= 70
          ? 6
          : 4;

  scores.structure = avgSizeScore + tsUsageScore;

  if (metrics.averageFileSize > 300) {
    recommendations.push('Consider breaking down large files');
  }
  if (metrics.typeScriptUsage < 90) {
    recommendations.push('Convert more files to TypeScript');
  }

  // Performance score (20 points)
  const buildTimeScore =
    metrics.buildTime < 2000 ? 10 : metrics.buildTime < 3000 ? 8 : metrics.buildTime < 5000 ? 6 : 4;

  const bundleSizeScore =
    metrics.bundleSize < 200000
      ? 10
      : metrics.bundleSize < 300000
        ? 8
        : metrics.bundleSize < 400000
          ? 6
          : 4;

  scores.performance = buildTimeScore + bundleSizeScore;

  if (metrics.buildTime > 3000) {
    recommendations.push('Optimize build time (target: <2s)');
  }
  if (metrics.bundleSize > 250000) {
    recommendations.push('Reduce bundle size (target: <200KB)');
  }

  // Maintainability score (15 points)
  const componentRatio = metrics.componentCount / (metrics.utilityCount || 1);
  const ratioScore = componentRatio >= 2 && componentRatio <= 4 ? 10 : 7;

  const lintScore = metrics.lintIssues === 0 ? 5 : metrics.lintIssues < 5 ? 3 : 1;

  scores.maintainability = ratioScore + lintScore;

  if (metrics.lintIssues > 0) {
    recommendations.push(`Fix ${metrics.lintIssues} linting issue(s)`);
  }

  // Calculate overall score
  const overall = Object.values(scores).reduce((sum, score) => sum + score, 0);

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 90) grade = 'A';
  else if (overall >= 80) grade = 'B';
  else if (overall >= 70) grade = 'C';
  else if (overall >= 60) grade = 'D';
  else grade = 'F';

  return {
    overall,
    categories: scores,
    grade,
    recommendations,
  };
}

/**
 * Save quality metrics
 */
export function saveQualityMetrics(metrics: CodeQualityMetrics): void {
  try {
    const history = getQualityHistory();
    history.push(metrics);

    // Keep last 30 entries
    if (history.length > 30) {
      history.splice(0, history.length - 30);
    }

    localStorage.setItem(QUALITY_METRICS_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save quality metrics:', error);
  }
}

/**
 * Get quality metrics history
 */
export function getQualityHistory(): CodeQualityMetrics[] {
  try {
    const stored = localStorage.getItem(QUALITY_METRICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load quality history:', error);
  }
  return [];
}

/**
 * Get latest quality metrics
 */
export function getLatestQualityMetrics(): CodeQualityMetrics | null {
  const history = getQualityHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}

/**
 * Get quality trend
 */
export function getQualityTrend(
  metric: keyof CodeQualityMetrics
): 'improving' | 'declining' | 'stable' {
  const history = getQualityHistory();
  if (history.length < 2) return 'stable';

  const recent = history.slice(-5);
  const values = recent.map((m) => m[metric] as number);

  // Calculate trend
  let increasing = 0;
  let decreasing = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) increasing++;
    else if (values[i] < values[i - 1]) decreasing++;
  }

  if (increasing > decreasing) return 'improving';
  if (decreasing > increasing) return 'declining';
  return 'stable';
}

/**
 * Compare current metrics with baseline
 */
export function compareWithBaseline(
  current: CodeQualityMetrics,
  baseline: CodeQualityMetrics
): Record<keyof CodeQualityMetrics, number> {
  return {
    testCoverage: current.testCoverage - baseline.testCoverage,
    componentCount: current.componentCount - baseline.componentCount,
    utilityCount: current.utilityCount - baseline.utilityCount,
    averageFileSize: current.averageFileSize - baseline.averageFileSize,
    typeScriptUsage: current.typeScriptUsage - baseline.typeScriptUsage,
    lintIssues: current.lintIssues - baseline.lintIssues,
    buildTime: current.buildTime - baseline.buildTime,
    bundleSize: current.bundleSize - baseline.bundleSize,
    timestamp: current.timestamp - baseline.timestamp,
  };
}

/**
 * Generate quality report
 */
export function generateQualityReport(): string {
  const latest = getLatestQualityMetrics();
  if (!latest) return 'No quality metrics available';

  const score = calculateQualityScore(latest);

  let report = `# Code Quality Report\n\n`;
  report += `**Overall Score:** ${score.overall}/100 (Grade: ${score.grade})\n\n`;

  report += `## Category Scores\n`;
  report += `- **Testing:** ${score.categories.testing}/40\n`;
  report += `- **Structure:** ${score.categories.structure}/25\n`;
  report += `- **Performance:** ${score.categories.performance}/20\n`;
  report += `- **Maintainability:** ${score.categories.maintainability}/15\n\n`;

  report += `## Metrics\n`;
  report += `- Test Coverage: ${latest.testCoverage.toFixed(1)}%\n`;
  report += `- Components: ${latest.componentCount}\n`;
  report += `- Utilities: ${latest.utilityCount}\n`;
  report += `- Avg File Size: ${Math.round(latest.averageFileSize)} lines\n`;
  report += `- TypeScript Usage: ${latest.typeScriptUsage.toFixed(1)}%\n`;
  report += `- Lint Issues: ${latest.lintIssues}\n`;
  report += `- Build Time: ${latest.buildTime}ms\n`;
  report += `- Bundle Size: ${Math.round(latest.bundleSize / 1024)}KB\n\n`;

  if (score.recommendations.length > 0) {
    report += `## Recommendations\n`;
    score.recommendations.forEach((rec) => {
      report += `- ${rec}\n`;
    });
  }

  return report;
}

/**
 * Check if metrics meet quality gate
 */
export function passesQualityGate(metrics: CodeQualityMetrics): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  // Minimum thresholds
  if (metrics.testCoverage < 60) {
    failures.push(`Test coverage too low: ${metrics.testCoverage}% (minimum: 60%)`);
  }

  if (metrics.lintIssues > 10) {
    failures.push(`Too many lint issues: ${metrics.lintIssues} (maximum: 10)`);
  }

  if (metrics.buildTime > 10000) {
    failures.push(`Build time too long: ${metrics.buildTime}ms (maximum: 10s)`);
  }

  if (metrics.bundleSize > 500000) {
    failures.push(
      `Bundle size too large: ${Math.round(metrics.bundleSize / 1024)}KB (maximum: 500KB)`
    );
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Clear quality metrics history
 */
export function clearQualityHistory(): void {
  localStorage.removeItem(QUALITY_METRICS_KEY);
}
