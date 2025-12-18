#!/usr/bin/env node

import { TRANSFORMATIONS } from './packages/core/dist/data.js';

function validateModels() {
  console.log('🔍 Validating Base120+ Mental Models Framework\n');

  let totalModels = 0;
  let issues = [];

  Object.entries(TRANSFORMATIONS).forEach(([code, transformation]) => {
    const modelCount = transformation.models.length;
    totalModels += modelCount;

    console.log(`${code} (${transformation.name}): ${modelCount} models`);

    // Validate model codes
    transformation.models.forEach((model, index) => {
      const expectedCode = `${code}${index + 1}`;
      if (model.code !== expectedCode) {
        issues.push(`❌ ${model.code} should be ${expectedCode}`);
      }

      // Check required fields
      if (!model.name || !model.definition || !model.priority) {
        issues.push(`❌ ${model.code} missing required fields`);
      }
    });
  });

  console.log(`\n📊 Total Models: ${totalModels}`);
  console.log(`🎯 Target: 126 models (Base120 + 6 new)`);
  console.log(`📈 Progress: ${totalModels >= 126 ? '✅' : '⚠️'} ${totalModels}/126`);

  if (issues.length > 0) {
    console.log('\n🚨 Issues Found:');
    issues.forEach(issue => console.log(issue));
    return false;
  }

  console.log('\n✅ All models validated successfully!');

  // Show new models
  const newModels = TRANSFORMATIONS.SY.models.slice(21);
  if (newModels.length > 0) {
    console.log('\n🆕 New Models Added:');
    newModels.forEach(model => {
      console.log(`  ${model.code}: ${model.name}`);
      console.log(`    ${model.definition}`);
    });
  }

  return true;
}

const isValid = validateModels();
process.exit(isValid ? 0 : 1);
