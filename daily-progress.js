#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const today = new Date().toISOString().split('T')[0];
const reportPath = `reports/progress-${today}.md`;

// Ensure reports directory exists
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

// Check if report already exists
if (fs.existsSync(reportPath)) {
  console.log(`📋 Today's report already exists: ${reportPath}`);
  console.log(fs.readFileSync(reportPath, 'utf8'));
  process.exit(0);
}

// Generate new report template
const template = `# Daily Progress Report - ${today}

## 🎯 Focus Areas
- [ ] Core Development
- [ ] Documentation
- [ ] Testing/QA
- [ ] Deployment

## 📊 Metrics
- **Commits**: 0
- **Files Modified**: 0
- **Tests Passing**: ✅/❌
- **Build Status**: ✅/❌

## 🚀 Accomplishments
- 

## 🐛 Issues Resolved
- 

## 📝 Notes
- 

## 🔄 Tomorrow's Plan
- 

---
*Generated: ${new Date().toLocaleString()}*
`;

fs.writeFileSync(reportPath, template);
console.log(`📋 Created daily report: ${reportPath}`);
console.log('\n' + template);
