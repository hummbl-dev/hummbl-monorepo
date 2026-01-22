import { FirstPrinciplesModel } from '@hummbl/models/p1/FirstPrinciplesModel';

/**
 * HUMMBL P1 Model - Usage Examples
 * 
 * This file demonstrates practical usage of the First Principles Framing model
 * across different problem types and scenarios.
 */

// ============================================================================
// BASIC USAGE
// ============================================================================

async function basicExample(): Promise<void> {
  try {
    console.log('=== BASIC USAGE ===\n');
    
    const model = new FirstPrinciplesModel();
    
    const result = await model.analyze({
      problem: "How can I improve customer retention?"
    });
    
    console.log('Problem:', result.problem);
    console.log('Components:', result.components.length);
    console.log('Truths:', result.truths.length);
    console.log('Wickedness:', result.wickednessScore);
    console.log('Confidence:', result.confidence);
    console.log('Approach:', result.recommendedApproach);
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in basicExample:', error.message);
    } else {
      console.error('An unknown error occurred in basicExample');
    }
    throw error; // Re-throw to allow caller to handle if needed
  }
}

// ============================================================================
// BUSINESS OPTIMIZATION
// ============================================================================

async function businessOptimizationExample(): Promise<void> {
  try {
    console.log('=== BUSINESS OPTIMIZATION ===\n');
    
    const model = new FirstPrinciplesModel();
  
    const result = await model.analyze({
      problem: "How can I reduce customer churn by 20% within 6 months while maintaining profitability?"
    });
  
    console.log('📊 Analysis Results:');
    console.log('-------------------');
    console.log(`Wickedness Score: ${result.wickednessScore.toFixed(2)} (${result.recommendedApproach})`);
    console.log(`Confidence: ${result.confidence.toFixed(2)}`);
    console.log(`Execution Time: ${result.metadata.executionTime}ms`);
    console.log('\n');
  
    console.log('🔍 Components Identified:');
    result.components.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    console.log('\n');
  
    console.log('🎯 Fundamental Truths:');
    result.truths.slice(0, 5).forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
    console.log('\n');
  
    console.log('💡 Solution (excerpt):');
    console.log(result.solution.split('\n').slice(0, 10).join('\n'));
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in businessOptimizationExample:', error.message);
    } else {
      console.error('An unknown error occurred in businessOptimizationExample');
    }
    throw error;
  }
}

// ============================================================================
// TECHNICAL PROBLEM
// ============================================================================

async function technicalProblemExample(): Promise<void> {
  try {
    console.log('=== TECHNICAL PROBLEM ===\n');
    
    const model = new FirstPrinciplesModel();
    
    const result = await model.analyze({
      problem: "Reduce API response time from 500ms to under 100ms without increasing infrastructure costs."
    });
    
    console.log(`Problem Type: Technical (Wickedness: ${result.wickednessScore.toFixed(2)})`);
    console.log(`Recommended Approach: ${result.recommendedApproach}`);
    console.log(`Confidence: ${result.confidence.toFixed(2)}`);
    console.log('\n');
    
    console.log('Key Constraints:');
    const constraints = result.components.filter((c: string) => c.includes('[constraints]'));
    constraints.forEach((c: string) => console.log(`  - ${c}`));
    console.log('\n');
    
    console.log('Key Metrics:');
    const metrics = result.components.filter((c: string) => c.includes('[metrics]') || c.includes('[temporals]'));
    metrics.forEach((m: string) => console.log(`  - ${m}`));
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in technicalProblemExample:', error.message);
    } else {
      console.error('An unknown error occurred in technicalProblemExample');
    }
    throw error;
  }
}

// ============================================================================
// WITH CONTEXT
// ============================================================================

async function withContextExample(): Promise<void> {
  try {
    console.log('=== WITH CONTEXT ===\n');
    
    const model = new FirstPrinciplesModel();
    
    const result = await model.analyze({
      problem: "Should we build or buy a CRM system for our growing sales team?",
      context: {
        urgency: 'high',
        budget: 'limited',
        risk_tolerance: 'low',
        team_size: 25
      }
    });
    
    console.log('Problem with Context:');
    console.log(`  Urgency: high`);
    console.log(`  Budget: limited`);
    console.log(`  Risk Tolerance: low`);
    console.log('\n');
    
    console.log('Context-Aware Solution:');
    // Show context-specific guidance from solution
    const contextSection = result.solution.split('CONTEXT-SPECIFIC GUIDANCE:')[1];
    if (contextSection) {
      console.log(contextSection.split('---')[0]);
    }
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in withContextExample:', error.message);
    } else {
      console.error('An unknown error occurred in withContextExample');
    }
    throw error;
  }
}

// ============================================================================
// WICKED PROBLEM
// ============================================================================

async function wickedProblemExample(): Promise<void> {
  try {
    console.log('=== WICKED PROBLEM ===\n');
    
    const model = new FirstPrinciplesModel();
    
    const result = await model.analyze({
      problem: "How should we balance economic growth with environmental sustainability given conflicting stakeholder interests and uncertain long-term outcomes?"
    });
    
    console.log('⚠️  Wicked Problem Detected');
    console.log('---------------------------');
    console.log(`Wickedness Score: ${result.wickednessScore.toFixed(2)} (HIGH)`);
    console.log(`Confidence: ${result.confidence.toFixed(2)} (LOW)`);
    console.log(`Recommended Approach: ${result.recommendedApproach}`);
    console.log('\n');
    
    console.log('Why This is Wicked:');
    console.log('  - Stakeholder conflicts detected');
    console.log('  - Value judgments present (should, balance)');
    console.log('  - High uncertainty (uncertain outcomes)');
    console.log('  - Large scale (environmental, economic)');
    console.log('\n');
    
    console.log('⚠️  WARNING: First Principles may be insufficient');
    console.log('Consider using Systems Thinking (SY-series models) instead');
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in wickedProblemExample:', error.message);
    } else {
      console.error('An unknown error occurred in wickedProblemExample');
    }
    throw error;
  }
}

// ============================================================================
// EVENT MONITORING
// ============================================================================

async function eventMonitoringExample(): Promise<void> {
  try {
    console.log('=== EVENT MONITORING ===\n');
    
    const model = new FirstPrinciplesModel();
    
    // Set up event listeners
    model
      .on('analysis:start', (data) => {
        console.log('🚀 Analysis started');
        console.log(`   Problem length: ${data.input.problem.length} chars`);
      })
      .on('analysis:complete', (data) => {
        console.log('✅ Analysis complete');
        console.log(`   Execution time: ${data.output.metadata.executionTime}ms`);
        console.log(`   Confidence: ${data.output.confidence.toFixed(2)}`);
      })
      .on('analysis:error', (data) => {
        console.error('❌ Analysis failed');
        console.error(`   Error: ${data.error.message}`);
      });
  
    // Run analysis
    await model.analyze({
      problem: "Optimize warehouse logistics for same-day delivery."
    });
  
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in eventMonitoringExample:', error.message);
    } else {
      console.error('An unknown error occurred in eventMonitoringExample');
    }
    throw error;
  }
}

// ============================================================================
// QUALITY METRICS DEEP DIVE
// ============================================================================

async function qualityMetricsExample(): Promise<void> {
  try {
    console.log('=== QUALITY METRICS DEEP DIVE ===\n');
    
    const model = new FirstPrinciplesModel();
    
    const result = await model.analyze({
      problem: "How can we increase revenue by 25% while maintaining 80% gross margins and staying within our $500k marketing budget?"
    });
    
    console.log('📈 HUMMBL Quality Metrics:');
    console.log('---------------------------');
    console.log(`Model: ${result.hummblMetadata.modelId} (${result.hummblMetadata.modelName})`);
    console.log(`Transformation: ${result.hummblMetadata.transformationType}`);
    console.log('\n');
    
    console.log('Alignment Score:', result.hummblMetadata.alignmentScore.toFixed(3));
    console.log('  → Problem-solution semantic overlap');
    console.log('  → Higher = better fit');
    console.log('\n');
    
    console.log('Trace Fidelity:', result.hummblMetadata.traceFidelity.toFixed(3));
    console.log('  → Decomposition chain quality');
    console.log('  → Problem → Components → Truths → Solution');
    console.log('\n');
    
    console.log('Entropy Delta:', result.hummblMetadata.entropyDelta.toFixed(3));
    console.log('  → Information reduction achieved');
    console.log('  → Higher = more clarity gained');
    console.log('\n');
    
    console.log('Overall Confidence:', result.confidence.toFixed(3));
    console.log('  → Quality × (1 - wickedness_penalty)');
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in qualityMetricsExample:', error.message);
    } else {
      console.error('An unknown error occurred in qualityMetricsExample');
    }
    throw error;
  }
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

async function batchProcessingExample(): Promise<void> {
  try {
    console.log('=== BATCH PROCESSING ===\n');
    
    const model = new FirstPrinciplesModel();
    
    const problems = [
      "Reduce server costs by 30%",
      "Improve team productivity",
      "Launch product in new market",
      "Optimize supply chain efficiency"
    ];
    
    console.log(`Processing ${problems.length} problems...\n`);
    
    const results = await Promise.all(
      problems.map(problem => model.analyze({ problem }))
    );
    
    // Summary table
    console.log('Results Summary:');
    console.log('-----------------------------------------------------------');
    console.log('Problem                          | Wicked | Confidence | Approach');
    console.log('-----------------------------------------------------------');
    
    results.forEach((result, i) => {
      const problem = problems[i].padEnd(32);
      const wickedness = result.wickednessScore.toFixed(2);
      const confidence = result.confidence.toFixed(2);
      const approach = result.recommendedApproach.padEnd(17);
      console.log(`${problem} | ${wickedness}   | ${confidence}     | ${approach}`);
    });
    
    console.log('-----------------------------------------------------------\n');
    
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    console.log(`Average Confidence: ${avgConfidence.toFixed(2)}`);
    console.log(`Total Execution Time: ${results.reduce((sum, r) => sum + r.metadata.executionTime, 0)}ms`);
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in batchProcessingExample:', error.message);
    } else {
      console.error('An unknown error occurred in batchProcessingExample');
    }
    throw error;
  }
}

// ============================================================================
// TRANSFORMATION CHAIN (MULTI-MODEL)
// ============================================================================

async function transformationChainExample(): Promise<void> {
  try {
    console.log('=== TRANSFORMATION CHAIN ===\n');
    
    const p1Model = new FirstPrinciplesModel();
    
    // Step 1: P1 Analysis
    console.log('Step 1: P1 (First Principles) Analysis');
    const p1Result = await p1Model.analyze({
      problem: "How can we scale our engineering team from 10 to 50 people?"
    });
    
    console.log(`  Wickedness: ${p1Result.wickednessScore.toFixed(2)}`);
    console.log(`  Confidence: ${p1Result.confidence.toFixed(2)}`);
    console.log(`  Truths identified: ${p1Result.truths.length}`);
    console.log('\n');
    
    // Step 2: Prepare for IN1 (Inversion) - would be next
    console.log('Step 2: Prepare metadata for IN1 (Inversion)');
    const in1Input = {
      problem: p1Result.problem,
      metadata: {
        transformationChain: ['P1'],
        priorAnalyses: [
          {
            model: 'P1',
            output: {
              wickedness: p1Result.wickednessScore,
              truths: p1Result.truths,
              approach: p1Result.recommendedApproach
            }
          }
        ]
      }
    };
    
    console.log('  Chain:', in1Input.metadata.transformationChain);
    console.log('  Prior models:', in1Input.metadata.priorAnalyses.length);
    console.log('\n');
    
    console.log('→ Next: Pass to IN1 model for inversion analysis');
    console.log('→ Then: CO1 for composition analysis');
    console.log('→ Pattern: P → IN → CO → DE → RE → SY');
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in transformationChainExample:', error.message);
    } else {
      console.error('An unknown error occurred in transformationChainExample');
    }
    throw error;
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

async function errorHandlingExample(): Promise<void> {
  try {
    console.log('=== ERROR HANDLING ===\n');
    
    const model = new FirstPrinciplesModel();
    
    // Test 1: Empty problem
    try {
      await model.analyze({ problem: '' });
    } catch (error) {
      console.log('❌ Caught error (empty problem):');
      console.log(`   ${error.message}`);
    }
    
    // Test 2: Invalid input
    try {
      await model.analyze(null as any);
    } catch (error) {
      console.log('❌ Caught error (null input):');
      console.log(`   ${error.message}`);
    }
    
    // Test 3: Too long
    try {
      await model.analyze({ problem: 'a'.repeat(10001) });
    } catch (error) {
      console.log('❌ Caught error (too long):');
      console.log(`   ${error.message}`);
    }
    
    console.log('\n✅ All errors handled gracefully');
    console.log('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in errorHandlingExample:', error.message);
    } else {
      console.error('An unknown error occurred in errorHandlingExample');
    }
    throw error;
  }
}

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function main(): Promise<void> {
  try {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  HUMMBL P1: First Principles Framing - Usage Examples     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  await basicExample();
  await businessOptimizationExample();
  await technicalProblemExample();
  await withContextExample();
  await wickedProblemExample();
  await eventMonitoringExample();
  await qualityMetricsExample();
  await batchProcessingExample();
  await transformationChainExample();
  await errorHandlingExample();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Examples complete. See README.md for more documentation.');
  console.log('═══════════════════════════════════════════════════════════');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in main:', error.message);
    } else {
      console.error('An unknown error occurred in main');
    }
    throw error;
  }
}

// @ts-ignore - Node.js types are available via @types/node
const process = require('process');

// @ts-ignore - Node.js types are available via @types/node
if (require.main === module) {
  main().catch((error: unknown) => {
    if (error instanceof Error) {
      console.error('Unhandled error in main:', error.message);
      process.exit(1);
    } else {
      console.error('An unknown error occurred in main');
      process.exit(1);
    }
  });
}

// No exports needed for this example file

export {}; // This makes the file a module
