/**
 * Example: Using Multiple HUMMBL Models Together
 * 
 * This example demonstrates how to combine multiple mental models from different
 * categories to solve a complex problem. We'll use models from each of the
 * six transformations to analyze a business scenario.
 */

import { 
  // Perspective Models
  createP1Model,
  createP3Model,
  
  // Inversion Models
  createIn1Model,
  createIn3Model,
  
  // Composition Models
  createCo1Model,
  createCo3Model,
  
  // Deconstruction Models
  createDe1Model,
  createDe3Model,
  
  // Reconstruction Models
  createRe1Model,
  createRe3Model,
  
  // Synthesis Models
  createSy1Model,
  createSy3Model
} from '../src/models';

// Business scenario: A company is considering entering a new market
const businessScenario = {
  company: {
    name: 'TechNova',
    industry: 'SaaS',
    currentMarkets: ['North America', 'Europe'],
    proposedMarket: 'Southeast Asia',
    strengths: ['Innovative technology', 'Strong brand', 'Talented team'],
    weaknesses: ['Limited local knowledge', 'No existing presence in region']
  },
  market: {
    size: 'Large and growing',
    competition: 'Moderate',
    regulations: 'Complex',
    growthRate: '12% YoY',
    keyPlayers: ['LocalPlayer1', 'GlobalCompetitor2']
  }
};

async function analyzeMarketEntry() {
  console.log('🚀 Starting HUMMBL Market Entry Analysis\n');
  
  // 1. Apply Perspective Models to understand the situation from different angles
  console.log('🔍 Applying Perspective Models...');
  const p1Model = createP1Model();
  const p3Model = createP3Model();
  
  const perspectives = await Promise.all([
    p1Model.analyze({
      problem: `Should ${businessScenario.company.name} enter the ${businessScenario.company.proposedMarket} market?`,
      context: businessScenario
    }),
    p3Model.analyze({
      problem: `What are the key factors to consider for market entry?`,
      context: businessScenario
    })
  ]);
  
  console.log('✅ Perspective analysis complete\n');
  
  // 2. Apply Inversion Models to identify potential pitfalls
  console.log('🔄 Applying Inversion Models...');
  const in1Model = createIn1Model();
  const in3Model = createIn3Model();
  
  const invertedAnalysis = await Promise.all([
    in1Model.analyze({
      problem: `What would cause this market entry to fail?`,
      context: businessScenario
    }),
    in3Model.analyze({
      problem: `What assumptions are we making that could be wrong?`,
      context: businessScenario
    })
  ]);
  
  console.log('✅ Inversion analysis complete\n');
  
  // 3. Apply Composition Models to combine different perspectives
  console.log('🧩 Applying Composition Models...');
  const co1Model = createCo1Model();
  const co3Model = createCo3Model();
  
  const composition = await co1Model.compose({
    elements: [
      ...perspectives.map(p => p.insights),
      ...invertedAnalysis.map(i => i.insights)
    ].flat(),
    context: businessScenario
  });
  
  console.log('✅ Composition analysis complete\n');
  
  // 4. Apply Deconstruction Models to break down the problem
  console.log('🔨 Applying Deconstruction Models...');
  const de1Model = createDe1Model();
  const de3Model = createDe3Model();
  
  const deconstructed = await de1Model.analyze({
    system: 'Market entry strategy',
    components: [
      'Market research',
      'Regulatory compliance',
      'Local partnerships',
      'Marketing strategy',
      'Talent acquisition'
    ],
    context: businessScenario
  });
  
  console.log('✅ Deconstruction analysis complete\n');
  
  // 5. Apply Reconstruction Models to develop a strategy
  console.log('🏗️  Applying Reconstruction Models...');
  const re1Model = createRe1Model();
  const re3Model = createRe3Model();
  
  const reconstructed = await re1Model.reconstruct({
    components: deconstructed.components,
    relationships: deconstructed.relationships,
    context: businessScenario
  });
  
  console.log('✅ Reconstruction analysis complete\n');
  
  // 6. Apply Synthesis Models to create a cohesive strategy
  console.log('✨ Applying Synthesis Models...');
  const sy1Model = createSy1Model();
  const sy3Model = createSy3Model();
  
  const synthesis = await sy1Model.synthesize({
    models: [
      { type: 'perspectives', data: perspectives },
      { type: 'inversion', data: invertedAnalysis },
      { type: 'composition', data: composition },
      { type: 'deconstruction', data: deconstructed },
      { type: 'reconstruction', data: reconstructed }
    ],
    context: businessScenario
  });
  
  console.log('✅ Synthesis complete\n');
  
  // Final output
  console.log('='.repeat(80));
  console.log('🎯 MARKET ENTRY STRATEGY FOR TECHNOVA');
  console.log('='.repeat(80));
  console.log(`\n💡 Key Insights:`);
  synthesis.insights.forEach((insight, i) => {
    console.log(`${i + 1}. ${insight}`);
  });
  
  console.log(`\n📈 Recommended Approach:`);
  console.log(synthesis.synthesizedResult.strategy);
  
  console.log('\n✅ Analysis complete!');
}

// Run the analysis
analyzeMarketEntry().catch(console.error);
