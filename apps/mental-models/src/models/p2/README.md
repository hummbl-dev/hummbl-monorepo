# P2 - Stakeholder Mapping

## Overview

Stakeholder Mapping is a powerful model in the HUMMBL framework that helps identify, analyze, and manage all parties with interest, influence, or impact in a system or decision. As part of the Perspective/Identity (P) transformation, it provides a structured approach to understanding complex stakeholder landscapes.

## Key Features

- **Comprehensive Party Identification**: Systematically identify all relevant stakeholders
- **Influence-Interest Matrix**: Categorize stakeholders based on their influence and interest levels
- **Relationship Mapping**: Visualize connections and relationships between stakeholders
- **Impact Analysis**: Assess the potential impact of each stakeholder
- **Network Visualization**: Generate interactive network maps of stakeholder relationships

## Installation

```bash
# If not already installed
npm install @hummbl/models
```

## Usage

### Basic Usage

```typescript
import { createStakeholderModel, analyzeStakeholderMap } from '@hummbl/models/p2';

// Create a model instance
const model = createStakeholderModel();

// Create stakeholders
const stakeholder1 = model.methods.createStakeholder({
  name: 'End Users',
  type: 'customer',
  influence: 4,
  interest: 5,
  description: 'Primary users of the product/service'
});

const stakeholder2 = model.methods.createStakeholder({
  name: 'Regulatory Body',
  type: 'regulator',
  influence: 5,
  interest: 3,
  description: 'Government agency overseeing compliance'
});

// Analyze stakeholders
const analysis = analyzeStakeholderMap([stakeholder1, stakeholder2]);

console.log('Key Stakeholders:', analysis.keyStakeholders);
console.log('Stakeholders to Keep Satisfied:', analysis.keepSatisfied);
console.log('Stakeholders to Keep Informed:', analysis.keepInformed);
```

### Creating a Stakeholder Map

```typescript
// Create a new stakeholder map
const stakeholderMap = model.methods.createStakeholderMap(
  'Product Launch Stakeholders',
  'Stakeholder analysis for Q2 product launch'
);

// Add stakeholders to the map
stakeholderMap.stakeholders = [stakeholder1, stakeholder2];

// Analyze the map
const mapAnalysis = model.methods.analyzeStakeholders(stakeholderMap.stakeholders);
```

## API Reference

### `createStakeholderModel()`

Creates a new instance of the Stakeholder Mapping model.

**Returns**: `StakeholderModel` - The model instance with all methods.

### `analyzeStakeholderMap(stakeholders: Stakeholder[])`

Analyzes an array of stakeholders and returns categorized results.

**Parameters**:

- `stakeholders`: Array of stakeholder objects to analyze

**Returns**: `StakeholderAnalysis` object with categorized stakeholders and network map

### Model Methods

#### `createStakeholder(params: Omit<Stakeholder, 'id'>)`

Creates a new stakeholder with a unique ID.

#### `createStakeholderMap(name: string, description?: string)`

Creates a new stakeholder map container.

#### `analyzeStakeholders(stakeholders: Stakeholder[])`

Analyzes stakeholders and categorizes them into groups.

#### `generateNetworkMap(stakeholders: Stakeholder[])`

Generates a network map for visualization.

#### `findInfluencers(stakeholders: Stakeholder[], minInfluence?: number)`

Finds stakeholders with influence above a threshold.

#### `findKeyStakeholders(stakeholders: Stakeholder[])`

Identifies key stakeholders (high influence and high interest).

## Example Scenario

### Problem

Launching a new product in a regulated market

### Stakeholder Analysis

```typescript
const analysis = analyzeStakeholderMap(exampleStakeholders);

// Key stakeholders (high influence, high interest)
analysis.keyStakeholders.forEach(stakeholder => {
  console.log(`Key: ${stakeholder.name} (Influence: ${stakeholder.influence}, Interest: ${stakeholder.interest})`);
});

// Generate network map data for visualization
const networkData = model.methods.generateNetworkMap(exampleStakeholders);
```

## Related Models

- **P3: Identity Stack** - Understand individual stakeholder identities
- **CO5: Network Effects** - Analyze how stakeholders influence each other
- **SY3: Requisite Variety** - Ensure sufficient stakeholder representation

## Best Practices

1. **Be Comprehensive**: Include all potential stakeholders, even those with indirect influence
2. **Regular Updates**: Stakeholder landscapes change - update your analysis regularly
3. **Consider Context**: Stakeholder influence and interest may vary by issue or decision
4. **Visualize**: Use the network map to identify clusters and central players
5. **Engage Proactively**: Develop engagement strategies for each stakeholder category

## License

Part of the HUMMBL framework. See main repository for license information.