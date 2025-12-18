// Quick test of HUMMBL validation functions
const fs = require('fs');

// Simple CommonJS version for testing
const HUMMBL_CONCEPTS = {
  RE: {
    id: 'RE',
    name: 'Recursion',
    definition: 'Apply operations iteratively, outputs become inputs.',
    category: 'transformation',
  },
  SY19: {
    id: 'SY19',
    name: 'Meta-Model Selection',
    definition: 'Framework for selecting complementary mental models',
    category: 'mental-model',
  },
  AI_NATIVE_DOCS: {
    id: 'AI_NATIVE_DOCS',
    name: 'AI-Native Documentation',
    definition: 'Knowledge packaging that prevents AI hallucination through executable validation',
    category: 'methodology',
  },
};

function validateHUMMBLConcept(id) {
  return HUMMBL_CONCEPTS[id] || null;
}

function searchHUMMBL(query) {
  return Object.values(HUMMBL_CONCEPTS).filter(
    concept =>
      concept.name.toLowerCase().includes(query.toLowerCase()) ||
      concept.definition.toLowerCase().includes(query.toLowerCase())
  );
}

// Test the validation
console.log('🧪 Testing HUMMBL AI-Native Documentation:');
console.log('');

console.log('✅ Validate RE transformation:');
const re = validateHUMMBLConcept('RE');
console.log(`   ${re.name}: ${re.definition}`);
console.log('');

console.log('✅ Search for "model":');
const modelResults = searchHUMMBL('model');
modelResults.forEach(concept => {
  console.log(`   ${concept.name}: ${concept.definition}`);
});
console.log('');

console.log('❌ Try to validate fake concept:');
const fake = validateHUMMBLConcept('FAKE_TRANSFORM');
console.log(`   Result: ${fake}`);
console.log('');

console.log('🎯 Key Insight: AI-Native Documentation prevents hallucination!');
console.log('   - Code IS the authoritative source');
console.log('   - Validation is mandatory before assertion');
console.log('   - Self-teaching through examples');
console.log('   - Built-in error prevention');
