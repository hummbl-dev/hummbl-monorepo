#!/usr/bin/env node

/**
 * Bundle Size Checker
 *
 * This script checks the built bundle sizes against defined budgets
 * and provides detailed reporting and recommendations.
 */

import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configuration from root
const configPath = path.resolve(__dirname, '../../../bundle-size.config.js');
let config;

try {
  const configModule = await import(configPath);
  config = configModule.default;
} catch (error) {
  console.error('❌ Failed to load bundle size configuration:', error.message);
  process.exit(1);
}

const { budgets, monitoring, optimization } = config;
const distPath = path.resolve(__dirname, '../dist');

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath, compressed = false) {
  try {
    if (!fs.existsSync(filePath)) return 0;

    const content = fs.readFileSync(filePath);
    const size = compressed ? gzipSync(content).length : content.length;
    return Math.round((size / 1024) * 100) / 100; // Round to 2 decimals
  } catch (error) {
    console.warn(`⚠️  Could not read file: ${filePath}`);
    return 0;
  }
}

/**
 * Get all files matching patterns
 */
function getFilesInDirectory(dir, pattern) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getFilesInDirectory(fullPath, pattern));
    } else if (pattern.test(item)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Categorize files by type and chunk name
 */
function categorizeFiles() {
  const jsFiles = getFilesInDirectory(distPath, /\.js$/);
  const cssFiles = getFilesInDirectory(distPath, /\.css$/);
  const htmlFiles = getFilesInDirectory(distPath, /\.html$/);

  const categorized = {
    main: { js: [], css: [] },
    chunks: {},
    vendor: {},
    other: { js: [], css: [], html: htmlFiles },
  };

  // Categorize JavaScript files
  jsFiles.forEach(file => {
    const filename = path.basename(file);
    const relativePath = path.relative(distPath, file);

    if (filename.includes('main') || filename.includes('index')) {
      categorized.main.js.push({ path: file, name: filename, relativePath });
    } else if (filename.startsWith('vendor-')) {
      const vendorName = filename.split('-')[1].split('.')[0];
      if (!categorized.vendor[vendorName]) {
        categorized.vendor[vendorName] = [];
      }
      categorized.vendor[vendorName].push({ path: file, name: filename, relativePath });
    } else {
      const chunkName = filename.split('-')[0];
      if (!categorized.chunks[chunkName]) {
        categorized.chunks[chunkName] = [];
      }
      categorized.chunks[chunkName].push({ path: file, name: filename, relativePath });
    }
  });

  // Categorize CSS files
  cssFiles.forEach(file => {
    const filename = path.basename(file);
    const relativePath = path.relative(distPath, file);

    if (filename.includes('main') || filename.includes('index')) {
      categorized.main.css.push({ path: file, name: filename, relativePath });
    } else {
      categorized.other.css.push({ path: file, name: filename, relativePath });
    }
  });

  return categorized;
}

/**
 * Check if size exceeds budget
 */
function checkBudget(actualSize, budget) {
  if (!budget || !budget.limit) return { status: 'unknown', message: '' };

  const percentage = (actualSize / budget.limit) * 100;

  if (actualSize > budget.limit) {
    return {
      status: 'exceeded',
      message: `exceeds ${budget.limit}KB budget by ${(actualSize - budget.limit).toFixed(1)}KB (${percentage.toFixed(1)}%)`,
      percentage,
    };
  } else if (actualSize > budget.warning) {
    return {
      status: 'warning',
      message: `approaching ${budget.limit}KB budget (${percentage.toFixed(1)}%)`,
      percentage,
    };
  } else {
    return {
      status: 'ok',
      message: `within ${budget.limit}KB budget (${percentage.toFixed(1)}%)`,
      percentage,
    };
  }
}

/**
 * Get optimization suggestions based on file size
 */
function getOptimizationSuggestions(size) {
  const { sizeRanges } = optimization;

  for (const [range, config] of Object.entries(sizeRanges)) {
    if (size <= config.max) {
      return config.suggestions;
    }
  }

  return sizeRanges.oversized.suggestions;
}

/**
 * Generate detailed report
 */
function generateReport(files, budgetChecks) {
  console.log('\n🔍 BUNDLE SIZE ANALYSIS REPORT');
  console.log('================================\n');

  // Main bundles
  console.log('📦 MAIN BUNDLES');
  console.log('---------------');

  let totalJSSize = 0;
  let totalCSSSize = 0;
  let hasFailures = false;

  // Main JS
  if (files.main.js.length > 0) {
    files.main.js.forEach(file => {
      const size = getFileSizeKB(file.path, true);
      totalJSSize += size;
      const check = checkBudget(size, budgets.mainJsBundle);
      const icon = check.status === 'exceeded' ? '❌' : check.status === 'warning' ? '⚠️' : '✅';

      console.log(`${icon} ${file.name}: ${size}KB gzipped (${check.message})`);

      if (check.status === 'exceeded') {
        hasFailures = true;
        const suggestions = getOptimizationSuggestions(size);
        console.log(`   💡 Suggestions: ${suggestions.join(', ')}`);
      }
    });
  }

  // Main CSS
  if (files.main.css.length > 0) {
    files.main.css.forEach(file => {
      const size = getFileSizeKB(file.path, true);
      totalCSSSize += size;
      const check = checkBudget(size, budgets.cssBundle);
      const icon = check.status === 'exceeded' ? '❌' : check.status === 'warning' ? '⚠️' : '✅';

      console.log(`${icon} ${file.name}: ${size}KB gzipped (${check.message})`);

      if (check.status === 'exceeded') {
        hasFailures = true;
      }
    });
  }

  // Vendor chunks
  console.log('\n📚 VENDOR CHUNKS');
  console.log('----------------');

  Object.entries(files.vendor).forEach(([vendorName, vendorFiles]) => {
    let vendorSize = 0;
    vendorFiles.forEach(file => {
      vendorSize += getFileSizeKB(file.path, true);
    });
    totalJSSize += vendorSize;

    const budget = budgets.vendorChunks[`vendor-${vendorName}`];
    const check = checkBudget(vendorSize, budget);
    const icon = check.status === 'exceeded' ? '❌' : check.status === 'warning' ? '⚠️' : '✅';

    console.log(`${icon} vendor-${vendorName}: ${vendorSize}KB gzipped (${check.message})`);

    if (check.status === 'exceeded') {
      hasFailures = true;
      console.log(`   📝 ${budget?.description || 'Vendor chunk'}`);
    }
  });

  // Other chunks
  console.log('\n🧩 OTHER CHUNKS');
  console.log('---------------');

  let maxChunkSize = 0;
  Object.entries(files.chunks).forEach(([chunkName, chunkFiles]) => {
    let chunkSize = 0;
    chunkFiles.forEach(file => {
      chunkSize += getFileSizeKB(file.path, true);
    });
    totalJSSize += chunkSize;
    maxChunkSize = Math.max(maxChunkSize, chunkSize);

    const check = checkBudget(chunkSize, budgets.individualChunk);
    const icon = check.status === 'exceeded' ? '❌' : check.status === 'warning' ? '⚠️' : '✅';

    console.log(`${icon} ${chunkName}: ${chunkSize}KB gzipped (${check.message})`);

    if (check.status === 'exceeded') {
      hasFailures = true;
    }
  });

  // Total sizes
  console.log('\n📊 TOTAL SIZES');
  console.log('--------------');

  const jsCheck = checkBudget(totalJSSize, budgets.total.js);
  const cssCheck = checkBudget(totalCSSSize, budgets.total.css);
  const totalSize = totalJSSize + totalCSSSize;
  const totalCheck = checkBudget(totalSize, budgets.total.assets);

  console.log(
    `${jsCheck.status === 'exceeded' ? '❌' : jsCheck.status === 'warning' ? '⚠️' : '✅'} Total JavaScript: ${totalJSSize}KB gzipped (${jsCheck.message})`
  );
  console.log(
    `${cssCheck.status === 'exceeded' ? '❌' : cssCheck.status === 'warning' ? '⚠️' : '✅'} Total CSS: ${totalCSSSize}KB gzipped (${cssCheck.message})`
  );
  console.log(
    `${totalCheck.status === 'exceeded' ? '❌' : totalCheck.status === 'warning' ? '⚠️' : '✅'} Total Assets: ${totalSize}KB gzipped (${totalCheck.message})`
  );

  if (
    jsCheck.status === 'exceeded' ||
    cssCheck.status === 'exceeded' ||
    totalCheck.status === 'exceeded'
  ) {
    hasFailures = true;
  }

  // Recommendations
  if (hasFailures) {
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS');
    console.log('-------------------------------');
    optimization.strategies.forEach((strategy, index) => {
      console.log(`${index + 1}. ${strategy}`);
    });

    console.log('\n🔗 USEFUL TOOLS');
    console.log('---------------');
    console.log('• Run "pnpm analyze" to generate visual bundle analysis');
    console.log('• Use "pnpm build:analyze" to build with detailed analysis');
    console.log('• Check the bundle-analysis.html file for detailed breakdown');
  }

  console.log('\n' + '='.repeat(50));

  return !hasFailures;
}

/**
 * Main execution
 */
async function main() {
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Run "pnpm build" first.');
    process.exit(1);
  }

  console.log('🔍 Analyzing bundle sizes...');

  const files = categorizeFiles();
  const budgetChecks = {};

  // Generate report
  const passed = generateReport(files, budgetChecks);

  if (!passed) {
    console.log('\n❌ Bundle size check FAILED! Some bundles exceed the defined budgets.');
    console.log('Please optimize your bundle sizes before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ Bundle size check PASSED! All bundles are within budget.');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Bundle size check failed:', error);
    process.exit(1);
  });
}
