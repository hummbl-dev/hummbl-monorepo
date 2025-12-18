#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const today = new Date().toISOString().split('T')[0];
const reportPath = `reports/progress-${today}.md`;

// Ensure reports directory exists
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

// Get git stats for today
function getGitStats() {
  try {
    const commits = execSync(`git log --since="00:00:00" --oneline --no-merges`, {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    const filesChanged = execSync(
      `git diff --name-only HEAD@{1.day.ago}..HEAD 2>/dev/null || echo ""`,
      { encoding: 'utf8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    const commitMessages = commits.map(c => c.substring(c.indexOf(' ') + 1));

    return {
      commits: commits.length,
      files: filesChanged.length,
      messages: commitMessages,
      filesChanged,
    };
  } catch {
    return { commits: 0, files: 0, messages: [], filesChanged: [] };
  }
}

// Check build/test status
function getStatus() {
  try {
    execSync('pnpm build', { stdio: 'ignore' });
    return '✅';
  } catch {
    return '❌';
  }
}

const stats = getGitStats();
const buildStatus = getStatus();

const report = `# Daily Progress Report - ${today}

## 🎯 Focus Areas
- [${stats.commits > 0 ? 'x' : ' '}] Core Development
- [ ] Documentation
- [ ] Testing/QA
- [ ] Deployment

## 📊 Metrics
- **Commits**: ${stats.commits}
- **Files Modified**: ${stats.files}
- **Tests Passing**: ${buildStatus}
- **Build Status**: ${buildStatus}

## 🚀 Accomplishments
${stats.messages.length > 0 ? stats.messages.map(m => `- ${m}`).join('\n') : '- No commits today'}

## 📝 Files Changed
${
  stats.filesChanged.length > 0
    ? stats.filesChanged
        .slice(0, 10)
        .map(f => `- ${f}`)
        .join('\n')
    : '- No changes detected'
}
${stats.filesChanged.length > 10 ? `- ... and ${stats.filesChanged.length - 10} more` : ''}

## 🐛 Issues Resolved
- 

## 🔄 Tomorrow's Plan
- 

---
*Auto-generated: ${new Date().toLocaleString()}*
`;

fs.writeFileSync(reportPath, report);
console.log(`📋 Auto-generated report: ${reportPath}`);
console.log('\n' + report);
