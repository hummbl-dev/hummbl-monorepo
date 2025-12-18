#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const today = new Date().toISOString().split('T')[0];
const reportPath = `reports/progress-${today}.md`;

if (!fs.existsSync('reports')) fs.mkdirSync('reports');

function getGitMetrics() {
  try {
    const commits = execSync(`git log --since="00:00:00" --oneline --no-merges`, {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    const additions = execSync(
      `git log --since="00:00:00" --numstat --pretty=format: | awk '{add+=$1} END {print add+0}'`,
      { encoding: 'utf8' }
    ).trim();
    const deletions = execSync(
      `git log --since="00:00:00" --numstat --pretty=format: | awk '{del+=$2} END {print del+0}'`,
      { encoding: 'utf8' }
    ).trim();

    const filesChanged = execSync(
      `git diff --name-only HEAD@{1.day.ago}..HEAD 2>/dev/null || echo ""`,
      { encoding: 'utf8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    return {
      commits: commits.length,
      additions: parseInt(additions) || 0,
      deletions: parseInt(deletions) || 0,
      files: filesChanged.length,
      messages: commits.map(c => c.substring(c.indexOf(' ') + 1)),
    };
  } catch {
    return { commits: 0, additions: 0, deletions: 0, files: 0, messages: [] };
  }
}

function getPerformanceMetrics() {
  try {
    const buildStart = Date.now();
    execSync('pnpm build', { stdio: 'ignore' });
    const buildTime = Date.now() - buildStart;

    const testStart = Date.now();
    execSync('pnpm test', { stdio: 'ignore' });
    const testTime = Date.now() - testStart;

    return { buildTime, testTime, buildStatus: '✅', testStatus: '✅' };
  } catch {
    return { buildTime: 0, testTime: 0, buildStatus: '❌', testStatus: '❌' };
  }
}

function getVelocityMetrics() {
  try {
    const weekCommits = execSync(`git log --since="7 days ago" --oneline --no-merges | wc -l`, {
      encoding: 'utf8',
    }).trim();
    const weekFiles = execSync(
      `git log --since="7 days ago" --name-only --pretty=format: | sort -u | wc -l`,
      { encoding: 'utf8' }
    ).trim();

    return {
      weeklyCommits: parseInt(weekCommits) || 0,
      weeklyFiles: parseInt(weekFiles) || 0,
      dailyAvg: Math.round(((parseInt(weekCommits) || 0) / 7) * 10) / 10,
    };
  } catch {
    return { weeklyCommits: 0, weeklyFiles: 0, dailyAvg: 0 };
  }
}

const git = getGitMetrics();
const perf = getPerformanceMetrics();
const velocity = getVelocityMetrics();

const report = `# Daily Progress Report - ${today}

## 🎯 Focus Areas
- [${git.commits > 0 ? 'x' : ' '}] Core Development
- [${git.files > 5 ? 'x' : ' '}] Documentation
- [${perf.testStatus === '✅' ? 'x' : ' '}] Testing/QA
- [${perf.buildStatus === '✅' ? 'x' : ' '}] Deployment

## 📊 Development Metrics
- **Commits Today**: ${git.commits}
- **Lines Added**: +${git.additions}
- **Lines Removed**: -${git.deletions}
- **Files Modified**: ${git.files}
- **Net Change**: ${git.additions - git.deletions > 0 ? '+' : ''}${git.additions - git.deletions}

## ⚡ Performance Metrics
- **Build Time**: ${perf.buildTime}ms
- **Test Time**: ${perf.testTime}ms
- **Build Status**: ${perf.buildStatus}
- **Test Status**: ${perf.testStatus}

## 📈 Velocity Trends
- **Weekly Commits**: ${velocity.weeklyCommits}
- **Daily Average**: ${velocity.dailyAvg}
- **Weekly Files**: ${velocity.weeklyFiles}
- **Productivity**: ${velocity.weeklyCommits > 14 ? '🔥 High' : velocity.weeklyCommits > 7 ? '⚡ Good' : '📈 Building'}

## 🚀 Today's Accomplishments
${git.messages.length > 0 ? git.messages.map(m => `- ${m}`).join('\n') : '- No commits today'}

## 🔄 Tomorrow's Plan
- 

---
*Enhanced report generated: ${new Date().toLocaleString()}*
`;

fs.writeFileSync(reportPath, report);
console.log(`📊 Enhanced progress report: ${reportPath}`);
console.log('\n' + report);
