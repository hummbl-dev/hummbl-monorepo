#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

function generateCoverageReport() {
  console.log('📊 Generating Coverage Report\n');

  try {
    // Run coverage for each package
    const packages = ['core', 'mcp-server', 'web', 'workers'];
    const results = {};

    packages.forEach(pkg => {
      console.log(`📦 Testing ${pkg}...`);
      try {
        execSync(`pnpm --filter @hummbl/${pkg} test --coverage --reporter=json`, {
          stdio: 'ignore',
        });

        const coveragePath = `apps/${pkg}/coverage/coverage-summary.json`;
        if (fs.existsSync(coveragePath)) {
          const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
          results[pkg] = coverage.total;
        }
      } catch (error) {
        console.log(`⚠️ ${pkg}: No coverage data`);
        results[pkg] = { lines: { pct: 0 }, functions: { pct: 0 }, branches: { pct: 0 } };
      }
    });

    // Generate summary
    console.log('\n📈 Coverage Summary:');
    let totalLines = 0,
      totalFunctions = 0,
      totalBranches = 0;

    Object.entries(results).forEach(([pkg, coverage]) => {
      console.log(
        `${pkg}: ${coverage.lines.pct}% lines, ${coverage.functions.pct}% functions, ${coverage.branches.pct}% branches`
      );
      totalLines += coverage.lines.pct;
      totalFunctions += coverage.functions.pct;
      totalBranches += coverage.branches.pct;
    });

    const avgLines = totalLines / packages.length;
    const avgFunctions = totalFunctions / packages.length;
    const avgBranches = totalBranches / packages.length;

    console.log(
      `\n🎯 Overall: ${avgLines.toFixed(1)}% lines, ${avgFunctions.toFixed(1)}% functions, ${avgBranches.toFixed(1)}% branches`
    );

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      packages: results,
      overall: {
        lines: avgLines,
        functions: avgFunctions,
        branches: avgBranches,
      },
    };

    const today = new Date().toISOString().split('T')[0];
    fs.writeFileSync(`reports/coverage-${today}.json`, JSON.stringify(report, null, 2));

    // Check thresholds
    const threshold = 70;
    if (avgLines < threshold || avgFunctions < threshold || avgBranches < threshold) {
      console.log(`\n⚠️ Coverage below ${threshold}% threshold`);
      return false;
    } else {
      console.log(`\n✅ Coverage meets ${threshold}% threshold`);
      return true;
    }
  } catch (error) {
    console.error('❌ Coverage report failed:', error.message);
    return false;
  }
}

const success = generateCoverageReport();
process.exit(success ? 0 : 1);
