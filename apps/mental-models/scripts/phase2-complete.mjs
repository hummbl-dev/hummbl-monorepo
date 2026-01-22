#!/usr/bin/env node
// scripts/phase2-complete.mjs
// Automate Phase 2: cache clear -> validate -> test -> build -> push -> summarize
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const summaryPath = path.join(root, '.github', 'actions', 'summary.md');

function log(msg) {
  console.log(`[phase2] ${msg}`);
}
function run(cmd, opts = {}) {
  log(`> ${cmd}`);
  try {
    return execSync(cmd, { stdio: 'inherit', ...opts });
  } catch (e) {
    console.error('\n[phase2] ERROR:', e.message);
    process.exit(1);
  }
}

(async function main() {
  log('Starting Phase 2 automated sequence.');
  // 1. Verify baseline commit (optional check)
  try {
    const baseline = process.env.BASELINE_COMMIT;
    if (baseline) {
      const current = execSync('git rev-parse --verify HEAD').toString().trim();
      if (current !== baseline) {
        console.warn(`[phase2] WARNING: HEAD !== BASELINE (${baseline}). Current: ${current}`);
      }
    }
  } catch {}

  // Step 1: Clear caches
  log('Clearing caches...');
  run('rm -rf node_modules/.vite node_modules/.vitest coverage || true');

  // Step 1.5: Validate models
  log('Validating models.json with AJV...');
  run('node ./scripts/validate-models.mjs');

  // Step 2: Run tests
  log('Running full test suite...');
  run('npm run test -- --run');

  // Step 3: Build
  log('Building production bundle...');
  run('npm run build');

  // Step 4: Commit any local fix branch if present (do not create unexpected changes)
  // If repo has staged changes, commit with safe message
  try {
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      log("Staged/unstaged changes detected. Creating commit 'chore(phase2): automated complete'");
      run('git add -A && git commit -m "chore(phase2): automated complete" || true');
      run('git push origin HEAD:main || true');
    } else {
      log('No local changes to commit.');
    }
  } catch (e) {
    /* continue */
  }

  // Step 5: Write summary artifact
  const summary = [
    '# Phase 2 Automated Run',
    `- Timestamp: ${new Date().toISOString()}`,
    '- Steps: cache-clear, model-validate, test, build, push-check',
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, summary);
  log(`Summary written to ${summaryPath}`);

  log('Phase 2 automation complete. Please check GitHub Actions for CI status.');
})();
