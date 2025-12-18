#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const domains = ['finance-docs', 'healthcare-docs', 'education-docs'];

function validateTemplate(domain) {
  const basePath = path.join(process.cwd(), domain);

  console.log(`🔍 Validating ${domain}...`);

  const checks = {
    readme: fs.existsSync(path.join(basePath, 'README.md')),
    definitions: fs.existsSync(path.join(basePath, 'src', 'definitions.ts')),
    structure: true,
  };

  // Check README content
  if (checks.readme) {
    const readme = fs.readFileSync(path.join(basePath, 'README.md'), 'utf8');
    checks.hasValidation = readme.includes('Validation System');
    checks.hasExamples = readme.includes('Usage Examples');
    checks.hasAINative = readme.includes('AI-Native Documentation');
  }

  // Check definitions content
  if (checks.definitions) {
    const definitions = fs.readFileSync(path.join(basePath, 'src', 'definitions.ts'), 'utf8');
    checks.hasInterfaces = definitions.includes('interface');
    checks.hasFunctions = definitions.includes('function');
    checks.hasValidation = definitions.includes('validate') || definitions.includes('check');
  }

  const passed = Object.values(checks).every(Boolean);

  console.log(`  README.md: ${checks.readme ? '✅' : '❌'}`);
  console.log(`  definitions.ts: ${checks.definitions ? '✅' : '❌'}`);
  console.log(`  AI-Native features: ${checks.hasAINative ? '✅' : '❌'}`);
  console.log(`  Validation functions: ${checks.hasValidation ? '✅' : '❌'}`);
  console.log(`  Usage examples: ${checks.hasExamples ? '✅' : '❌'}`);

  return passed;
}

function runValidation() {
  console.log('🔍 Validating AI-Native Documentation Templates\n');

  let allPassed = true;

  domains.forEach(domain => {
    const passed = validateTemplate(domain);
    allPassed = allPassed && passed;
    console.log(`${domain}: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
  });

  console.log(
    `📊 Overall: ${allPassed ? '✅ All templates valid' : '❌ Some templates need fixes'}`
  );
  console.log(`📈 Templates created: ${domains.length}`);
  console.log(`🎯 Domains covered: Finance, Healthcare, Education`);

  return allPassed;
}

const success = runValidation();
process.exit(success ? 0 : 1);
