import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

interface ModelStatus {
  id: string;
  hasImplementation: boolean;
  testCount: number;
  hasDocumentation: boolean;
  hasTypes: boolean;
  status: 'complete' | 'partial' | 'scaffold';
}

function checkModel(modelId: string): ModelStatus {
  const modelPath = path.join(ROOT_DIR, 'src', 'models', modelId.toLowerCase());
  
  // Check if model directory exists
  if (!fs.existsSync(modelPath)) {
    return {
      id: modelId,
      hasImplementation: false,
      testCount: 0,
      hasDocumentation: false,
      hasTypes: false,
      status: 'scaffold'
    };
  }

  // Check implementation
  const indexPath = path.join(modelPath, 'index.ts');
  let hasImplementation = false;
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8');
    hasImplementation = content.includes('analyze(') && 
                       !content.includes('TODO') && 
                       !content.includes('implement');
  }

  // Check tests
  const testPath = path.join(modelPath, '__tests__', `${modelId.toLowerCase()}.test.ts`);
  let testCount = 0;
  if (fs.existsSync(testPath)) {
    const testContent = fs.readFileSync(testPath, 'utf-8');
    testCount = (testContent.match(/it\(/g) || []).length;
  }

  // Check documentation
  const docPath = path.join(modelPath, 'README.md');
  const hasDocumentation = fs.existsSync(docPath);

  // Check types
  const typesPath = path.join(modelPath, 'types.ts');
  const hasTypes = fs.existsSync(typesPath);

  // Determine status
  let status: 'complete' | 'partial' | 'scaffold' = 'scaffold';
  if (hasImplementation && testCount > 0 && hasDocumentation && hasTypes) {
    status = 'complete';
  } else if (hasImplementation || testCount > 0 || hasDocumentation || hasTypes) {
    status = 'partial';
  }

  return {
    id: modelId,
    hasImplementation,
    testCount,
    hasDocumentation,
    hasTypes,
    status
  };
}

// Models to validate
const modelsToValidate = [
  'p1', 'p5', 'p10', 'p15', 'p20',
  'in1', 'in5', 'in10', 'in15', 'in20'
];

console.log('🔍 Validating models...\n');

// Run validation
const results = modelsToValidate.map(checkModel);

// Print summary table
console.log('MODEL | IMPL  | TESTS | DOCS  | TYPES | STATUS   ');
console.log('------|-------|-------|-------|-------|-----------');

results.forEach(model => {
  console.log(
    `${model.id.padEnd(5)}| ` +
    `${model.hasImplementation ? '✅' : '❌'}     | ` +
    `${model.testCount.toString().padEnd(6)}| ` +
    `${model.hasDocumentation ? '✅' : '❌'}     | ` +
    `${model.hasTypes ? '✅' : '❌'}     | ` +
    `${model.status.padEnd(9)}`
  );
});

// Generate summary
const summary = {
  timestamp: new Date().toISOString(),
  stats: {
    totalModels: results.length,
    complete: results.filter(m => m.status === 'complete').length,
    partial: results.filter(m => m.status === 'partial').length,
    scaffold: results.filter(m => m.status === 'scaffold').length,
    withTests: results.filter(m => m.testCount > 0).length,
    withDocs: results.filter(m => m.hasDocumentation).length,
    withTypes: results.filter(m => m.hasTypes).length
  },
  models: Object.fromEntries(
    results.map(model => [
      model.id,
      {
        status: model.status,
        implementation: model.hasImplementation,
        tests: model.testCount,
        documentation: model.hasDocumentation,
        types: model.hasTypes
      }
    ])
  )
};

// Save detailed report
const reportPath = path.join(ROOT_DIR, 'model-validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

console.log('\n📊 Validation Summary:');
console.log(`- Complete: ${summary.stats.complete}/${summary.stats.totalModels}`);
console.log(`- Partial: ${summary.stats.partial}/${summary.stats.totalModels}`);
console.log(`- Scaffold: ${summary.stats.scaffold}/${summary.stats.totalModels}`);
console.log(`- With Tests: ${summary.stats.withTests}/${summary.stats.totalModels}`);
console.log(`- With Docs: ${summary.stats.withDocs}/${summary.stats.totalModels}`);
console.log(`- With Types: ${summary.stats.withTypes}/${summary.stats.totalModels}`);
console.log(`\n📝 Detailed report saved to: ${reportPath}`);
