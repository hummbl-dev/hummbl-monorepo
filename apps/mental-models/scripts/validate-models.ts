/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

interface ModelValidation {
  id: string;
  hasImplementation: boolean;
  implementationDetails: {
    hasAnalyzeMethod: boolean;
    isPlaceholder: boolean;
    hasErrorHandling: boolean;
    hasInputValidation: boolean;
  };
  tests: {
    exists: boolean;
    testCount: number;
    hasEdgeCases: boolean;
  };
  documentation: {
    exists: boolean;
    hasExamples: boolean;
    hasUsage: boolean;
  };
  types: {
    exists: boolean;
    hasInputType: boolean;
    hasOutputType: boolean;
  };
  overallStatus: 'complete' | 'partial' | 'scaffold';
}

function analyzeImplementation(content: string) {
  const hasAnalyzeMethod = /analyze\s*\([^)]*\)\s*(\{|=>)/.test(content);
  const isPlaceholder = /TODO|placeholder|implement/i.test(content);
  const hasErrorHandling = /(try\s*\{|catch\s*\(|throw\s+new\s+Error)/.test(content);
  const hasInputValidation = /(if\s*\(!?\s*\w+\s*\||\|\|\s*!?\w+\.\w+)/.test(content);

  return {
    hasAnalyzeMethod,
    isPlaceholder,
    hasErrorHandling,
    hasInputValidation,
  };
}

function analyzeTests(content: string) {
  const testCount = (content.match(/it\(/g) || []).length;
  const hasEdgeCases = /(edge case|boundary|error|invalid)/i.test(content);

  return {
    testCount,
    hasEdgeCases,
  };
}

function analyzeDocumentation(content: string) {
  const hasExamples = /##?\s*Examples?|```(typescript|javascript)/i.test(content);
  const hasUsage = /##?\s*Usage|how to use/i.test(content);

  return {
    hasExamples,
    hasUsage,
  };
}

function analyzeTypes(content: string) {
  const hasInputType = /(interface|type)\s+\w+Input\s*\{|type\s+\w+Input\s*=/i.test(content);
  const hasOutputType = /(interface|type)\s+\w+Output\s*\{|type\s+\w+Output\s*=/i.test(content);

  return {
    hasInputType,
    hasOutputType,
  };
}

function validateModel(modelId: string): ModelValidation {
  const modelPath = path.join(ROOT_DIR, 'src', 'models', modelId.toLowerCase());

  // Check if model directory exists
  if (!fs.existsSync(modelPath)) {
    return {
      id: modelId,
      hasImplementation: false,
      implementationDetails: {
        hasAnalyzeMethod: false,
        isPlaceholder: true,
        hasErrorHandling: false,
        hasInputValidation: false,
      },
      tests: { exists: false, testCount: 0, hasEdgeCases: false },
      documentation: { exists: false, hasExamples: false, hasUsage: false },
      types: { exists: false, hasInputType: false, hasOutputType: false },
      overallStatus: 'scaffold',
    };
  }

  // Check implementation
  const indexPath = path.join(modelPath, 'index.ts');
  let implementationDetails = {
    hasAnalyzeMethod: false,
    isPlaceholder: true,
    hasErrorHandling: false,
    hasInputValidation: false,
  };

  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8');
    implementationDetails = analyzeImplementation(content);
  }

  // Check tests
  const testPath = path.join(modelPath, '__tests__', `${modelId.toLowerCase()}.test.ts`);
  let testAnalysis = { exists: false, testCount: 0, hasEdgeCases: false };

  if (fs.existsSync(testPath)) {
    const testContent = fs.readFileSync(testPath, 'utf-8');
    const testStats = analyzeTests(testContent);
    testAnalysis = {
      exists: true,
      testCount: testStats.testCount,
      hasEdgeCases: testStats.hasEdgeCases,
    };
  }

  // Check documentation
  const docPath = path.join(modelPath, 'README.md');
  let docAnalysis = { exists: false, hasExamples: false, hasUsage: false };

  if (fs.existsSync(docPath)) {
    const docContent = fs.readFileSync(docPath, 'utf-8');
    docAnalysis = {
      exists: true,
      ...analyzeDocumentation(docContent),
    };
  }

  // Check types
  const typesPath = path.join(modelPath, 'types.ts');
  let typesAnalysis = { exists: false, hasInputType: false, hasOutputType: false };

  if (fs.existsSync(typesPath)) {
    const typesContent = fs.readFileSync(typesPath, 'utf-8');
    typesAnalysis = {
      exists: true,
      ...analyzeTypes(typesContent),
    };
  }

  // Determine overall status
  const isComplete =
    implementationDetails.hasAnalyzeMethod &&
    !implementationDetails.isPlaceholder &&
    testAnalysis.testCount >= 5 &&
    docAnalysis.exists &&
    typesAnalysis.exists;

  const isPartial =
    implementationDetails.hasAnalyzeMethod ||
    testAnalysis.exists ||
    docAnalysis.exists ||
    typesAnalysis.exists;

  const overallStatus = isComplete ? 'complete' : isPartial ? 'partial' : 'scaffold';

  return {
    id: modelId,
    hasImplementation:
      implementationDetails.hasAnalyzeMethod && !implementationDetails.isPlaceholder,
    implementationDetails,
    tests: testAnalysis,
    documentation: docAnalysis,
    types: typesAnalysis,
    overallStatus,
  };
}

// Models to validate
const modelsToValidate = ['p1', 'p5', 'p10', 'p15', 'p20', 'in1', 'in5', 'in10', 'in15', 'in20'];

console.log('🔍 Validating models...\n');

// Run validation
const results = modelsToValidate.map(validateModel);

// Print summary table
console.log('MODEL | IMPL  | TESTS | DOCS  | TYPES | STATUS   ');
console.log('------|-------|-------|-------|-------|-----------');

results.forEach((model) => {
  const testIndicator = model.tests.exists
    ? `${model.tests.testCount}${model.tests.hasEdgeCases ? '⚠️' : ' '}`.padEnd(6)
    : '❌     ';

  console.log(
    `${model.id.padEnd(5)}| ` +
      `${model.hasImplementation ? '✅' : '❌'}     | ` +
      `${testIndicator}| ` +
      `${model.documentation.exists ? '✅' : '❌'}     | ` +
      `${model.types.exists ? '✅' : '❌'}     | ` +
      `${model.overallStatus.padEnd(9)}`
  );
});

// Generate detailed report
const summary = {
  timestamp: new Date().toISOString(),
  stats: {
    totalModels: results.length,
    complete: results.filter((m) => m.overallStatus === 'complete').length,
    partial: results.filter((m) => m.overallStatus === 'partial').length,
    scaffold: results.filter((m) => m.overallStatus === 'scaffold').length,
    withTests: results.filter((m) => m.tests.exists).length,
    withDocs: results.filter((m) => m.documentation.exists).length,
    withTypes: results.filter((m) => m.types.exists).length,
  },
  models: results.reduce<Record<string, any>>((acc, model) => {
    acc[model.id] = {
      status: model.overallStatus,
      implementation: model.hasImplementation,
      tests: model.tests.testCount,
      documentation: model.documentation.exists,
      types: model.types.exists,
    };
    return acc;
  }, {}),
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
