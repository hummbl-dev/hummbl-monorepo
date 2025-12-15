# HUMMBL Quick Start

## Install & Run
```bash
pnpm install
chmod +x scripts/dev.sh
./scripts/dev.sh
```

## Base120 Framework
- **P** (Perspective) - How to view the problem
- **IN** (Inversion) - What if opposite were true  
- **CO** (Composition) - How parts fit together
- **DE** (Decomposition) - Break into components
- **RE** (Recursion) - Repeating patterns
- **SY** (Systems) - Larger system view

## API Usage
```bash
# Search models
curl "http://localhost:8787/v1/models?search=feedback"

# Get model details  
curl "http://localhost:8787/v1/models/RE8"
```

## MCP Integration
```typescript
import { searchModels, getModel } from '@hummbl/mcp-server';
const models = await searchModels('complexity');
```