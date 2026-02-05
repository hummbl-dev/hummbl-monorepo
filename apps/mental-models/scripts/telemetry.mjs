#!/usr/bin/env node
// scripts/telemetry.mjs
import fs from 'fs';
import path from 'path';
const file = path.join(process.cwd(), '.telemetry.json');
const baseline = { tests: 5.58, build: 1.31 }; // seconds baseline
function now() {
  return new Date().toISOString();
}

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

const prev = readExisting();
const current = {
  timestamp: now(),
  env: process.env.CI ? 'CI' : 'local',
  metrics: {
    tests: Number(process.env.METRIC_TESTS || '5.58'),
    build: Number(process.env.METRIC_BUILD || '1.31'),
  },
};
fs.writeFileSync(file, JSON.stringify({ previous: prev, current, baseline }, null, 2));
console.log('[telemetry] Written', file);
const deltaTests = ((current.metrics.tests - baseline.tests) / baseline.tests) * 100;
const deltaBuild = ((current.metrics.build - baseline.build) / baseline.build) * 100;
console.log(
  `[telemetry] tests delta ${deltaTests.toFixed(2)}% build delta ${deltaBuild.toFixed(2)}%`
);
if (Math.abs(deltaTests) > 5 || Math.abs(deltaBuild) > 5) {
  console.warn('[telemetry] Deviation > 5% from baseline.');
}
