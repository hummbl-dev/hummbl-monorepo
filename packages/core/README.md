# @hummbl/core

Core types and utilities for the HUMMBL Base120 cognitive framework.

## Overview

The Base120 framework provides 120 mental models organized across 6 transformations:

- **P** (Perspective) - Reframe viewpoint, reference, or evaluative stance
- **IN** (Inversion) - Negate, reverse, or examine complement
- **CO** (Composition) - Combine elements into unified wholes
- **DE** (Decomposition) - Factor into constituent components
- **RE** (Recursion) - Apply iteratively with self-reference
- **SY** (Meta-Systems) - Operate on structural/governance properties

## Installation

```bash
npm install @hummbl/core
# or
pnpm add @hummbl/core
```

## Usage

```typescript
import { MentalModel, TransformationType, Result, isOk } from '@hummbl/core';

// Type-safe mental model
const model: MentalModel = {
  code: 'P1',
  name: 'First Principles',
  transformation: 'P',
  definition: 'Break down to fundamental truths',
  whenToUse: 'When challenging assumptions',
  example: 'Questioning "why" until reaching axioms',
};

// Explicit error handling
function getModel(code: string): Result<MentalModel, string> {
  // Implementation
  return { ok: true, value: model };
}

const result = getModel('P1');
if (isOk(result)) {
  console.log(result.value.name);
}
```

## Types

### `MentalModel`
Individual mental model with code, name, transformation, definition, usage guidance, and optional example.

### `Transformation`
Transformation category containing metadata and 20 models.

### `TransformationType`
Union type of the 6 transformation codes: `'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY'`

### `Result<T, E>`
Explicit success/error type for robust error handling without exceptions.

## License

UNLICENSED
