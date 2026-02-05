#!/usr/bin/env node
// scripts/validate-models.mjs
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

const root = process.cwd();
const schemaPath = path.join(root, 'src', 'models', 'models.schema.json');
const modelsPath = path.join(root, 'public', 'models.json'); // adjust if moved

if (!fs.existsSync(schemaPath)) {
  console.error('[validate-models] Missing schema:', schemaPath);
  process.exit(1);
}
if (!fs.existsSync(modelsPath)) {
  console.error('[validate-models] Missing models.json:', modelsPath);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const data = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

// Validate structure
if (!data.models || !Array.isArray(data.models)) {
  console.error("[validate-models] models.json must contain a 'models' array");
  process.exit(2);
}

// Basic validation - check each model has required fields
const requiredFields = ['code', 'name', 'definition', 'example', 'transformation'];
let hasErrors = false;

data.models.forEach((model, idx) => {
  requiredFields.forEach((field) => {
    if (!model[field]) {
      console.error(`[validate-models] Model at index ${idx} missing field: ${field}`);
      hasErrors = true;
    }
  });

  // Validate transformation is valid
  const validTransformations = Object.keys(data.transformations || {});
  if (model.transformation && !validTransformations.includes(model.transformation)) {
    console.error(
      `[validate-models] Model ${model.code} has invalid transformation: ${model.transformation}`
    );
    hasErrors = true;
  }
});

if (hasErrors) {
  process.exit(2);
}

console.log(`[validate-models] OK - ${data.models.length} models validated successfully.`);
