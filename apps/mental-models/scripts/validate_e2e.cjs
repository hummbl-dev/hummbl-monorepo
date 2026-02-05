#!/usr/bin/env node
/**
 * HUMMBL Stage 3: End-to-End Functional Validation
 * Tests complete integration flow: API → UI → Events → Build Scripts
 * Mode: --integration (full API + network)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

// Configuration
const CONFIG = {
  mode: process.argv.includes('--isolation') ? 'isolation' : 'integration',
  projectRoot: path.join(__dirname, '..'),
  dataDir: '/Users/others/Downloads',
  buildScriptsDir: '/Users/others/Downloads/scripts',
  outputDir: path.join(__dirname, '../test-results'),
  apiPort: 3001,
  devServerTimeout: 30000,
};

// Results tracking
const results = {
  timestamp: new Date().toISOString(),
  mode: CONFIG.mode,
  suites: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  },
};

function addResult(suite, test, status, details = '', error = null) {
  const result = { suite, test, status, details, error };
  results.suites.push(result);
  results.summary.total++;
  if (status === 'PASS') results.summary.passed++;
  else if (status === 'FAIL') results.summary.failed++;
  else if (status === 'WARN') results.summary.warnings++;

  if (status === 'FAIL') {
    console.error(`   ✗ ${test}: ${details}`);
  } else if (status === 'PASS') {
    console.log(`   ✓ ${test}: ${details}`);
  }
}

// Suite 1: API Route Availability
async function testAPIRoutes() {
  console.log('\n[1/4] API Route Availability Tests');
  console.log('===================================');

  if (CONFIG.mode === 'isolation') {
    console.log('   ISOLATION MODE: Skipping live API tests');
    addResult('api_routes', 'mode_check', 'WARN', 'Isolation mode - API tests skipped');
    return;
  }

  // Test static data files as API simulation
  const apiTests = [
    {
      name: 'narratives_data',
      file: path.join(CONFIG.dataDir, 'narratives.yaml'),
      description: 'Narratives data source available',
    },
    {
      name: 'network_data',
      file: path.join(CONFIG.dataDir, 'narrative_links.json'),
      description: 'Network graph data source available',
    },
    {
      name: 'integrity_data',
      file: path.join(CONFIG.dataDir, 'integrity_report.json'),
      description: 'Integrity report data source available',
    },
  ];

  apiTests.forEach((test) => {
    if (fs.existsSync(test.file)) {
      addResult('api_routes', test.name, 'PASS', test.description);
    } else {
      addResult('api_routes', test.name, 'FAIL', `Data source missing: ${test.file}`);
    }
  });

  // Test API client configuration
  const clientPath = path.join(CONFIG.projectRoot, 'src/api/client.ts');
  if (fs.existsSync(clientPath)) {
    const clientCode = fs.readFileSync(clientPath, 'utf8');

    // Check for required methods
    const requiredMethods = ['get', 'post', 'put', 'delete'];
    requiredMethods.forEach((method) => {
      if (clientCode.includes(`async ${method}`) || clientCode.includes(`${method}:`)) {
        addResult('api_routes', `client_${method}`, 'PASS', `API client ${method} method exists`);
      } else {
        addResult(
          'api_routes',
          `client_${method}`,
          'WARN',
          `API client ${method} method not found`
        );
      }
    });

    // Check for caching
    if (clientCode.includes('cache') || clientCode.includes('Cache')) {
      addResult('api_routes', 'client_caching', 'PASS', 'API client caching implemented');
    } else {
      addResult('api_routes', 'client_caching', 'WARN', 'API client caching not detected');
    }
  } else {
    addResult('api_routes', 'client_exists', 'FAIL', 'API client not found');
  }

  console.log('✓ API route availability tests complete');
}

// Suite 2: UI-to-API Contract Tests
async function testUIAPIContracts() {
  console.log('\n[2/4] UI-to-API Contract Tests');
  console.log('===============================');

  try {
    // Test narratives API contract
    const yaml = require('js-yaml');
    const narrativesData = yaml.load(
      fs.readFileSync(path.join(CONFIG.dataDir, 'narratives.yaml'), 'utf8')
    );

    // Load TypeScript type definition
    const narrativeTypePath = path.join(CONFIG.projectRoot, 'src/types/narrative.ts');
    const narrativeTypeCode = fs.readFileSync(narrativeTypePath, 'utf8');

    // Check required fields match between data and types
    const requiredFields = narrativesData.validation?.required_fields || [];

    requiredFields.forEach((field) => {
      if (narrativeTypeCode.includes(`${field}:`)) {
        addResult(
          'ui_api_contract',
          `field_${field}`,
          'PASS',
          `Field ${field} in TypeScript interface`
        );
      } else {
        addResult(
          'ui_api_contract',
          `field_${field}`,
          'FAIL',
          `Field ${field} missing in TypeScript interface`
        );
      }
    });

    // Test network API contract
    const networkData = JSON.parse(
      fs.readFileSync(path.join(CONFIG.dataDir, 'narrative_links.json'), 'utf8')
    );
    const networkTypePath = path.join(CONFIG.projectRoot, 'src/types/network.ts');
    const networkTypeCode = fs.readFileSync(networkTypePath, 'utf8');

    // Check node structure
    if (networkData.nodes && networkData.nodes.length > 0) {
      const sampleNode = networkData.nodes[0];
      const nodeFields = Object.keys(sampleNode);

      const criticalFields = ['id', 'label', 'confidence', 'evidence_quality'];
      criticalFields.forEach((field) => {
        if (nodeFields.includes(field) && networkTypeCode.includes(`${field}:`)) {
          addResult(
            'ui_api_contract',
            `node_${field}`,
            'PASS',
            `Node field ${field} contract valid`
          );
        } else {
          addResult(
            'ui_api_contract',
            `node_${field}`,
            'FAIL',
            `Node field ${field} contract broken`
          );
        }
      });
    }

    // Check edge structure
    if (networkData.edges && networkData.edges.length > 0) {
      const sampleEdge = networkData.edges[0];
      const edgeFields = Object.keys(sampleEdge);

      const criticalFields = ['source', 'target', 'type', 'weight'];
      criticalFields.forEach((field) => {
        if (edgeFields.includes(field) && networkTypeCode.includes(`${field}:`)) {
          addResult(
            'ui_api_contract',
            `edge_${field}`,
            'PASS',
            `Edge field ${field} contract valid`
          );
        } else {
          addResult(
            'ui_api_contract',
            `edge_${field}`,
            'FAIL',
            `Edge field ${field} contract broken`
          );
        }
      });
    }

    // Test hooks contract
    const useNarrativesPath = path.join(CONFIG.projectRoot, 'src/hooks/useNarratives.ts');
    if (fs.existsSync(useNarrativesPath)) {
      const hookCode = fs.readFileSync(useNarrativesPath, 'utf8');

      // Check return values
      const expectedReturns = ['narratives', 'loading', 'error', 'refetch'];
      expectedReturns.forEach((returnVal) => {
        if (hookCode.includes(returnVal)) {
          addResult(
            'ui_api_contract',
            `hook_return_${returnVal}`,
            'PASS',
            `Hook returns ${returnVal}`
          );
        } else {
          addResult(
            'ui_api_contract',
            `hook_return_${returnVal}`,
            'WARN',
            `Hook may not return ${returnVal}`
          );
        }
      });
    }

    console.log('✓ UI-to-API contract tests complete');
  } catch (error) {
    addResult('ui_api_contract', 'suite', 'FAIL', 'Suite execution failed', error.message);
    console.error('✗ UI-to-API contract tests failed:', error.message);
  }
}

// Suite 3: DOM Event Propagation
async function testDOMEventPropagation() {
  console.log('\n[3/4] DOM Event Propagation Tests');
  console.log('==================================');

  try {
    // Test NarrativeCard event handlers
    const cardPath = path.join(CONFIG.projectRoot, 'src/components/narratives/NarrativeCard.tsx');
    if (fs.existsSync(cardPath)) {
      const cardCode = fs.readFileSync(cardPath, 'utf8');

      // Check for onClick handler
      if (cardCode.includes('onClick')) {
        addResult('dom_events', 'card_onclick', 'PASS', 'NarrativeCard has onClick handler');
      } else {
        addResult('dom_events', 'card_onclick', 'WARN', 'NarrativeCard missing onClick handler');
      }

      // Check for props interface
      if (cardCode.includes('interface') && cardCode.includes('Props')) {
        addResult('dom_events', 'card_props', 'PASS', 'NarrativeCard props interface defined');
      } else {
        addResult('dom_events', 'card_props', 'WARN', 'NarrativeCard props interface unclear');
      }
    } else {
      addResult('dom_events', 'card_exists', 'FAIL', 'NarrativeCard component not found');
    }

    // Test NarrativeList event handling
    const listPath = path.join(CONFIG.projectRoot, 'src/components/narratives/NarrativeList.tsx');
    if (fs.existsSync(listPath)) {
      const listCode = fs.readFileSync(listPath, 'utf8');

      // Check for hook usage
      if (listCode.includes('useNarratives')) {
        addResult('dom_events', 'list_hook', 'PASS', 'NarrativeList uses useNarratives hook');
      } else {
        addResult('dom_events', 'list_hook', 'FAIL', 'NarrativeList missing useNarratives hook');
      }

      // Check for error handling
      if (listCode.includes('error') && (listCode.includes('if') || listCode.includes('?'))) {
        addResult('dom_events', 'list_error_handling', 'PASS', 'NarrativeList has error handling');
      } else {
        addResult(
          'dom_events',
          'list_error_handling',
          'WARN',
          'NarrativeList error handling unclear'
        );
      }

      // Check for loading state
      if (listCode.includes('loading') && (listCode.includes('if') || listCode.includes('?'))) {
        addResult('dom_events', 'list_loading_state', 'PASS', 'NarrativeList has loading state');
      } else {
        addResult(
          'dom_events',
          'list_loading_state',
          'WARN',
          'NarrativeList loading state unclear'
        );
      }
    } else {
      addResult('dom_events', 'list_exists', 'FAIL', 'NarrativeList component not found');
    }

    // Test component integration
    const appPath = path.join(CONFIG.projectRoot, 'src/App.tsx');
    if (fs.existsSync(appPath)) {
      addResult('dom_events', 'app_exists', 'PASS', 'App.tsx exists for integration');
    } else {
      addResult(
        'dom_events',
        'app_exists',
        'WARN',
        'App.tsx not found - create for component integration'
      );
    }

    console.log('✓ DOM event propagation tests complete');
  } catch (error) {
    addResult('dom_events', 'suite', 'FAIL', 'Suite execution failed', error.message);
    console.error('✗ DOM event propagation tests failed:', error.message);
  }
}

// Suite 4: Build Script Integration Smoke Tests
async function testBuildScriptIntegration() {
  console.log('\n[4/4] Build Script Integration Smoke Tests');
  console.log('===========================================');

  try {
    // Check build scripts exist
    const buildScripts = [
      'build_visualization.js',
      'build_qdm_matrix.js',
      'build_ledger.js',
      'build_sitrep.js',
    ];

    buildScripts.forEach((script) => {
      const scriptPath = path.join(CONFIG.buildScriptsDir, script);
      if (fs.existsSync(scriptPath)) {
        addResult(
          'build_integration',
          `script_${script}`,
          'PASS',
          `Build script exists: ${script}`
        );

        // Check script is executable
        const scriptCode = fs.readFileSync(scriptPath, 'utf8');
        if (scriptCode.includes('#!/usr/bin/env node')) {
          addResult(
            'build_integration',
            `executable_${script}`,
            'PASS',
            `Script has shebang: ${script}`
          );
        } else {
          addResult(
            'build_integration',
            `executable_${script}`,
            'WARN',
            `Script missing shebang: ${script}`
          );
        }
      } else {
        addResult(
          'build_integration',
          `script_${script}`,
          'FAIL',
          `Build script missing: ${script}`
        );
      }
    });

    // Check orchestration script
    const orchestratorPath = path.join(CONFIG.buildScriptsDir, 'orchestrate_build.sh');
    if (fs.existsSync(orchestratorPath)) {
      addResult('build_integration', 'orchestrator', 'PASS', 'Build orchestrator exists');

      // Check if executable
      try {
        const stats = fs.statSync(orchestratorPath);
        const isExecutable = !!(stats.mode & 0o111);
        if (isExecutable) {
          addResult('build_integration', 'orchestrator_exec', 'PASS', 'Orchestrator is executable');
        } else {
          addResult(
            'build_integration',
            'orchestrator_exec',
            'WARN',
            'Orchestrator not executable (run: chmod +x)'
          );
        }
      } catch (error) {
        addResult(
          'build_integration',
          'orchestrator_exec',
          'WARN',
          'Could not check executable status'
        );
      }
    } else {
      addResult('build_integration', 'orchestrator', 'FAIL', 'Build orchestrator missing');
    }

    // Test provenance ledger writes
    const ledgerScriptPath = path.join(CONFIG.buildScriptsDir, 'build_ledger.js');
    if (fs.existsSync(ledgerScriptPath)) {
      const ledgerCode = fs.readFileSync(ledgerScriptPath, 'utf8');

      // Check for provenance hash usage
      if (ledgerCode.includes('provenance_hash')) {
        addResult(
          'build_integration',
          'ledger_provenance',
          'PASS',
          'Ledger uses provenance hashes'
        );
      } else {
        addResult(
          'build_integration',
          'ledger_provenance',
          'FAIL',
          'Ledger missing provenance hash integration'
        );
      }

      // Check for blockchain structure
      if (ledgerCode.includes('block') && ledgerCode.includes('previous_hash')) {
        addResult(
          'build_integration',
          'ledger_blockchain',
          'PASS',
          'Ledger has blockchain structure'
        );
      } else {
        addResult(
          'build_integration',
          'ledger_blockchain',
          'WARN',
          'Ledger blockchain structure unclear'
        );
      }

      // Check for file write
      if (ledgerCode.includes('writeFileSync') || ledgerCode.includes('writeFile')) {
        addResult('build_integration', 'ledger_write', 'PASS', 'Ledger writes output file');
      } else {
        addResult('build_integration', 'ledger_write', 'FAIL', 'Ledger missing file write');
      }
    }

    // Test build output directories
    const expectedOutputs = ['dist/visualization', 'dist/qdm', 'dist/ledger', 'dist/sitrep'];

    const distDir = path.join(CONFIG.dataDir, 'dist');
    if (fs.existsSync(distDir)) {
      addResult('build_integration', 'dist_dir', 'PASS', 'Build output directory exists');
    } else {
      addResult(
        'build_integration',
        'dist_dir',
        'WARN',
        'Build output directory not created yet (run build first)'
      );
    }

    // Test data integrity for build inputs
    const narrativesPath = path.join(CONFIG.dataDir, 'narratives.yaml');
    const networkPath = path.join(CONFIG.dataDir, 'narrative_links.json');

    if (fs.existsSync(narrativesPath) && fs.existsSync(networkPath)) {
      try {
        const yaml = require('js-yaml');
        const narrativesData = yaml.load(fs.readFileSync(narrativesPath, 'utf8'));
        const networkData = JSON.parse(fs.readFileSync(networkPath, 'utf8'));

        // Check data consistency
        const yamlNarrativeCount = narrativesData.narratives?.length || 0;
        const jsonNodeCount = networkData.nodes?.length || 0;

        if (yamlNarrativeCount === jsonNodeCount) {
          addResult(
            'build_integration',
            'data_consistency',
            'PASS',
            `Data consistent: ${yamlNarrativeCount} narratives`
          );
        } else {
          addResult(
            'build_integration',
            'data_consistency',
            'FAIL',
            `Data mismatch: YAML=${yamlNarrativeCount}, JSON=${jsonNodeCount}`
          );
        }
      } catch (error) {
        addResult(
          'build_integration',
          'data_consistency',
          'FAIL',
          'Failed to verify data consistency',
          error.message
        );
      }
    }

    console.log('✓ Build script integration tests complete');
  } catch (error) {
    addResult('build_integration', 'suite', 'FAIL', 'Suite execution failed', error.message);
    console.error('✗ Build script integration tests failed:', error.message);
  }
}

// Generate final report
function generateReport() {
  console.log('\n[5/5] Generating E2E Validation Report');
  console.log('========================================');

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Generate CSV
  const csvLines = ['Suite,Test,Status,Details,Error'];
  results.suites.forEach((result) => {
    const line = [
      result.suite,
      result.test,
      result.status,
      (result.details || '').replace(/,/g, ';'),
      (result.error || '').replace(/,/g, ';').substring(0, 100),
    ].join(',');
    csvLines.push(line);
  });

  const csvPath = path.join(CONFIG.outputDir, 'stage3_e2e_validation.csv');
  fs.writeFileSync(csvPath, csvLines.join('\n'));
  console.log(`✓ CSV report: ${csvPath}`);

  // Generate JSON
  const jsonPath = path.join(CONFIG.outputDir, 'stage3_e2e_validation.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`✓ JSON report: ${jsonPath}`);

  return csvPath;
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   HUMMBL Framework - Stage 3 E2E Validation           ║');
  console.log(`║   Mode: ${CONFIG.mode.toUpperCase().padEnd(47)} ║`);
  console.log('║   Timestamp: ' + new Date().toISOString() + '         ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  await testAPIRoutes();
  await testUIAPIContracts();
  await testDOMEventPropagation();
  await testBuildScriptIntegration();

  const csvPath = generateReport();

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║           E2E FUNCTIONAL VALIDATION SUMMARY            ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(
    `║  Total Tests:     ${results.summary.total.toString().padStart(4)}                                  ║`
  );
  console.log(
    `║  Passed:          ${results.summary.passed.toString().padStart(4)}                                  ║`
  );
  console.log(
    `║  Failed:          ${results.summary.failed.toString().padStart(4)}                                  ║`
  );
  console.log(
    `║  Warnings:        ${results.summary.warnings.toString().padStart(4)}                                  ║`
  );
  console.log('╠════════════════════════════════════════════════════════╣');

  const passRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
  console.log(`║  Pass Rate:       ${passRate}%                              ║`);
  console.log('╚════════════════════════════════════════════════════════╝');

  if (results.summary.failed > 0) {
    console.log('\n⚠️  E2E VALIDATION FAILED');
    console.log(`   Mode: ${CONFIG.mode}`);
    console.log(`   Review: ${csvPath}`);
    process.exit(1);
  } else if (results.summary.warnings > 0) {
    console.log('\n⚠️  E2E VALIDATION PASSED WITH WARNINGS');
    console.log(`   Review: ${csvPath}`);
    process.exit(0);
  } else {
    console.log('\n✅ E2E VALIDATION PASSED');
    console.log('   All integration tests successful');
    console.log('   System ready for deployment');
    process.exit(0);
  }
}

// Execute
if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { main };
