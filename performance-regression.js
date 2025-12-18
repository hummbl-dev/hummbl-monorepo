#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

const today = new Date().toISOString().split('T')[0];
const benchmarkPath = `reports/benchmark-${today}.json`;
const regressionPath = `reports/regression-${today}.json`;

function loadBaseline() {
  try {
    return JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
  } catch {
    console.log('⚠️ No baseline found, creating new benchmark...');
    execSync('pnpm benchmark', { stdio: 'inherit' });
    return JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
  }
}

function runRegressionTest() {
  console.log('🔍 Running Performance Regression Analysis\n');

  const baseline = loadBaseline();

  // Run current benchmark
  const currentStart = Date.now();
  try {
    execSync('pnpm build', { stdio: 'ignore' });
    const buildTime = Date.now() - currentStart;

    const testStart = Date.now();
    execSync('pnpm test', { stdio: 'ignore' });
    const testTime = Date.now() - testStart;

    const current = {
      timestamp: new Date().toISOString(),
      tests: {
        build: { time: buildTime, status: 'pass' },
        test: { time: testTime, status: 'pass' },
      },
    };

    // Compare with baseline
    const buildRegression =
      ((current.tests.build.time - baseline.tests.build.time) / baseline.tests.build.time) * 100;
    const testRegression =
      ((current.tests.test.time - baseline.tests.test.time) / baseline.tests.test.time) * 100;

    const results = {
      baseline: baseline.timestamp,
      current: current.timestamp,
      regressions: {
        build: {
          baseline: baseline.tests.build.time,
          current: current.tests.build.time,
          change: buildRegression,
          status: buildRegression > 20 ? 'FAIL' : buildRegression > 10 ? 'WARN' : 'PASS',
        },
        test: {
          baseline: baseline.tests.test.time,
          current: current.tests.test.time,
          change: testRegression,
          status: testRegression > 20 ? 'FAIL' : testRegression > 10 ? 'WARN' : 'PASS',
        },
      },
    };

    fs.writeFileSync(regressionPath, JSON.stringify(results, null, 2));

    console.log('📊 Performance Comparison:');
    console.log(
      `Build: ${baseline.tests.build.time}ms → ${current.tests.build.time}ms (${buildRegression > 0 ? '+' : ''}${buildRegression.toFixed(1)}%) ${results.regressions.build.status}`
    );
    console.log(
      `Test: ${baseline.tests.test.time}ms → ${current.tests.test.time}ms (${testRegression > 0 ? '+' : ''}${testRegression.toFixed(1)}%) ${results.regressions.test.status}`
    );

    const hasFailures = Object.values(results.regressions).some(r => r.status === 'FAIL');
    const hasWarnings = Object.values(results.regressions).some(r => r.status === 'WARN');

    if (hasFailures) {
      console.log('\n❌ Performance regression detected!');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('\n⚠️ Performance degradation detected');
      process.exit(0);
    } else {
      console.log('\n✅ No performance regressions');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Regression test failed:', error.message);
    process.exit(1);
  }
}

runRegressionTest();
