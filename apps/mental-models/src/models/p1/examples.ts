/**
 * Canonical examples demonstrating First Principles Thinking (P1)
 * These examples showcase practical applications of breaking down complex problems
 * into fundamental truths and building up solutions from there.
 */

/**
 * SpaceX Rocket Cost Reduction Example
 * 
 * Problem: Traditional rocket launches are too expensive ($65M per launch)
 * Traditional Approach: Optimize existing rocket manufacturing
 * First Principles Approach:
 * 1. Break down rocket components and costs
 * 2. Identify fundamental materials and their costs
 * 3. Challenge assumptions about manufacturing and reusability
 * 4. Rebuild solution from atomic truths
 */
export const spaceXExample = {
  problem: "Rocket launches are too expensive at $65M per launch",
  traditionalApproach: "Optimize existing rocket manufacturing processes",
  firstPrinciplesApproach: {
    decomposed: [
      "What are rockets made of?",
      "What is the cost of materials?",
      "Can we make the manufacturing process more efficient?",
      "Can rockets be made reusable?"
    ],
    fundamentalTruths: [
      "Rocket materials (aluminum, titanium, copper, carbon fiber) cost ~2% of launch price",
      "Most of the cost is in manufacturing and single-use components",
      "Reusability could dramatically reduce costs if implemented effectively"
    ],
    solution: "Develop reusable rockets with in-house manufacturing to reduce costs by ~10x"
  },
  outcome: "SpaceX reduced launch costs to ~$60M (Falcon 9) vs $392M (Space Shuttle)",
  impact: "Revolutionized space industry economics, enabled commercial space ventures"
};

/**
 * Business Model Innovation Example
 * 
 * Problem: Taxi services are expensive and inefficient in many cities
 * Traditional Approach: Add more taxis, optimize dispatch systems
 * First Principles Approach:
 * 1. Break down the transportation value chain
 * 2. Identify core needs (point A to B transport)
 * 3. Challenge assumptions about ownership and utilization
 * 4. Rebuild with modern technology
 */
export const uberExample = {
  problem: "Inefficient urban transportation with high costs and poor availability",
  traditionalApproach: "Add more taxis, improve dispatch systems",
  firstPrinciplesApproach: {
    decomposed: [
      "What do people fundamentally need from transportation?",
      "Why are taxis expensive?",
      "How can technology improve vehicle utilization?",
      "What are the regulatory barriers?"
    ],
    fundamentalTruths: [
      "People need reliable A-to-B transportation, not necessarily car ownership",
      "Taxis are expensive due to low utilization and regulatory costs",
      "Smartphones enable real-time matching of supply and demand",
      "Many car owners would share their vehicles for compensation"
    ],
    solution: "Create a platform connecting drivers with passengers using personal vehicles"
  },
  outcome: "Uber created a $70B+ company and transformed urban transportation",
  impact: "Disrupted taxi industry, created gig economy, changed urban mobility patterns"
};

/**
 * Additional Example: Battery Cost Reduction (Tesla)
 */

export const teslaBatteryExample = {
  problem: "Electric vehicle batteries are too expensive for mass adoption",
  traditionalApproach: "Source cheaper battery cells from suppliers",
  firstPrinciplesApproach: {
    decomposed: [
      "What are batteries made of?",
      "What is the spot market value of these materials?",
      "How are batteries manufactured?",
      "Where are the inefficiencies?"
    ],
    fundamentalTruths: [
      "Batteries are made of lithium, nickel, aluminum, steel, and other materials",
      "Commodity materials cost ~$80/kWh at scale",
      "Existing manufacturing is optimized for small consumer electronics, not cars",
      "Vertical integration could reduce costs significantly"
    ],
    solution: "Build Gigafactories with optimized manufacturing and vertical integration"
  },
  outcome: "Tesla reduced battery costs from $1,200/kWh (2010) to ~$100/kWh (2023)",
  impact: "Enabled mass-market electric vehicles, accelerated transition to sustainable transport"
};

/**
 * Export canonical examples for use in tests and documentation
 */
export const canonicalExamples = [
  {
    name: "SpaceX Rocket Cost Reduction",
    description: "How SpaceX reduced launch costs through first principles thinking",
    data: spaceXExample
  },
  {
    name: "Uber's Disruption of Transportation",
    description: "How Uber reimagined urban mobility from first principles",
    data: uberExample
  },
  {
    name: "Tesla Battery Innovation",
    description: "How Tesla approached battery cost reduction from first principles",
    data: teslaBatteryExample
  }
];

// Export individual examples for direct import
export default {
  spaceXExample,
  uberExample,
  teslaBatteryExample,
  canonicalExamples
};
