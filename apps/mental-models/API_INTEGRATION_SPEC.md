# HUMMBL Framework - React/API Integration Specification

**Version**: 1.0.0  
**Date**: 2025-10-17  
**Target**: hummbl-io React Application  
**Build Pipeline**: Parallel Build Outputs → API Layer → React Components

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Parallel Build Pipeline                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   VIZ    │  │   QDM    │  │  LEDGER  │  │  SITREP  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │      API Layer (REST)      │
        │  /api/narratives           │
        │  /api/network              │
        │  /api/qdm                  │
        │  /api/ledger               │
        │  /api/sitrep               │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    React Application       │
        │  ┌──────────────────────┐ │
        │  │  Narrative Explorer  │ │
        │  │  Network Visualizer  │ │
        │  │  QDM Dashboard       │ │
        │  │  Ledger Viewer       │ │
        │  │  SITREP Panel        │ │
        │  └──────────────────────┘ │
        └────────────────────────────┘
```

---

## 📡 API Endpoints

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://hummbl.io/api`

### Endpoint Specifications

#### 1. GET `/api/narratives`

**Purpose**: Retrieve all narratives with metadata

**Response**:

```json
{
  "metadata": {
    "version": "1.0.0",
    "last_updated": "2025-10-17",
    "total_narratives": 6
  },
  "narratives": [
    {
      "narrative_id": "NAR-HUMMBL-PERSPECTIVE",
      "version": "1.0.0",
      "provenance_hash": "sha256:...",
      "evidence_quality": "A",
      "title": "Perspective / Identity",
      "summary": "Frame Semantics and construction grammar...",
      "category": "perspective",
      "tags": ["cognitive", "linguistic", "frame-semantics"],
      "confidence": 0.92,
      "complexity": {
        "cognitive_load": "medium",
        "time_to_elicit": "20-30 minutes"
      },
      "linked_signals": [...],
      "relationships": [...],
      "citations": [...]
    }
  ]
}
```

**Status Codes**:

- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

#### 2. GET `/api/narratives/:id`

**Purpose**: Retrieve single narrative by ID

**Parameters**:

- `id` (path): Narrative ID (e.g., `NAR-HUMMBL-PERSPECTIVE`)

**Response**:

```json
{
  "narrative_id": "NAR-HUMMBL-PERSPECTIVE",
  "version": "1.0.0",
  "provenance_hash": "sha256:...",
  "evidence_quality": "A",
  "title": "Perspective / Identity",
  "summary": "...",
  "category": "perspective",
  "confidence": 0.92,
  "relationships": [...],
  "examples": [...],
  "related_frameworks": [...]
}
```

**Status Codes**:

- `200 OK`: Success
- `404 Not Found`: Narrative not found
- `500 Internal Server Error`: Server error

---

#### 3. GET `/api/network`

**Purpose**: Retrieve network graph data for visualization

**Query Parameters**:

- `format` (optional): `d3` | `cytoscape` | `raw` (default: `raw`)

**Response**:

```json
{
  "metadata": {
    "generated_at": "2025-10-17T10:26:51-04:00",
    "total_nodes": 6,
    "total_edges": 16,
    "density": 0.50
  },
  "nodes": [
    {
      "id": "NAR-HUMMBL-PERSPECTIVE",
      "label": "Perspective / Identity",
      "category": "perspective",
      "confidence": 0.92,
      "evidence_quality": "A",
      "provenance_hash": "sha256:...",
      "complexity": "medium"
    }
  ],
  "edges": [
    {
      "source": "NAR-HUMMBL-PERSPECTIVE",
      "target": "NAR-HUMMBL-INVERSION",
      "type": "informs",
      "description": "Perspective shifts enable inversion reasoning",
      "weight": 0.85,
      "bidirectional": false
    }
  ],
  "network_statistics": {
    "density": 0.50,
    "avg_degree": 5.0,
    "central_nodes": [...]
  },
  "visualization_hints": {
    "layout": "force-directed",
    "category_colors": {...},
    "evidence_quality_opacity": {...}
  }
}
```

**Status Codes**:

- `200 OK`: Success
- `400 Bad Request`: Invalid format parameter
- `500 Internal Server Error`: Server error

---

#### 4. GET `/api/qdm`

**Purpose**: Retrieve QDM Matrix data

**Query Parameters**:

- `include` (optional): `matrix` | `scores` | `pathways` | `all` (default: `all`)

**Response**:

```json
{
  "matrix": {
    "matrix": [[...]], // 6x6 matrix
    "labels": ["NAR-HUMMBL-PERSPECTIVE", ...],
    "dimensions": [6, 6]
  },
  "narrative_scores": [
    {
      "narrative_id": "NAR-HUMMBL-PERSPECTIVE",
      "confidence": 0.92,
      "evidence_quality": "A",
      "evidence_score": 1.0,
      "complexity_score": 0.8,
      "relationship_score": 0.4,
      "composite_score": 0.91,
      "rank": 1
    }
  ],
  "decision_pathways": {
    "pathways": [...],
    "total_pathways": 15,
    "strongest_pathway": {...},
    "pathway_types": [...]
  }
}
```

**Status Codes**:

- `200 OK`: Success
- `400 Bad Request`: Invalid include parameter
- `500 Internal Server Error`: Server error

---

#### 5. GET `/api/ledger`

**Purpose**: Retrieve ledger chain

**Query Parameters**:

- `block_id` (optional): Specific block ID
- `narrative_id` (optional): Filter by narrative ID

**Response**:

```json
{
  "blocks": [
    {
      "block_id": 1,
      "narrative_id": "NAR-HUMMBL-PERSPECTIVE",
      "provenance_hash": "sha256:...",
      "evidence_quality": "A",
      "confidence": 0.92,
      "timestamp": "2025-10-17T10:26:51-04:00",
      "previous_hash": "0"
    }
  ],
  "chain_metadata": {
    "total_blocks": 6,
    "chain_integrity": "VALID",
    "last_block_timestamp": "2025-10-17T10:26:51-04:00"
  }
}
```

**Status Codes**:

- `200 OK`: Success
- `404 Not Found`: Block not found
- `500 Internal Server Error`: Server error

---

#### 6. GET `/api/sitrep`

**Purpose**: Retrieve current situation report

**Response**:

```json
{
  "timestamp": "2025-10-17T10:26:51-04:00",
  "status": "operational",
  "narratives_loaded": 6,
  "evidence_quality_distribution": {
    "A": 5,
    "B": 1,
    "C": 0
  },
  "average_confidence": 0.9,
  "network_health": {
    "density": 0.5,
    "connectivity": "HEALTHY",
    "central_nodes": ["NAR-HUMMBL-RECURSION", "NAR-HUMMBL-COMPOSITION"]
  },
  "integrity_status": {
    "schema_compliance": "PASS",
    "provenance_audit": "PASS",
    "cross_reference_sync": "PASS",
    "overall_quality_score": 1.0
  },
  "recommendations": [
    "Consider adding Grade C narratives for experimental frameworks",
    "Monitor signal weight distribution for potential rebalancing"
  ]
}
```

**Status Codes**:

- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

#### 7. GET `/api/integrity`

**Purpose**: Retrieve full integrity report

**Response**: (Full integrity_report.json content)

**Status Codes**:

- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

## 🎨 React Component Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Footer
├── Routes
│   ├── Dashboard (/)
│   │   ├── SITREPPanel
│   │   ├── NetworkPreview
│   │   └── QuickStats
│   ├── Narratives (/narratives)
│   │   ├── NarrativeList
│   │   ├── NarrativeCard
│   │   └── NarrativeDetail
│   ├── Network (/network)
│   │   ├── NetworkVisualizer
│   │   │   ├── D3ForceGraph
│   │   │   └── CytoscapeGraph
│   │   └── NetworkControls
│   ├── QDM (/qdm)
│   │   ├── QDMMatrix
│   │   ├── NarrativeScores
│   │   └── DecisionPathways
│   ├── Ledger (/ledger)
│   │   ├── LedgerChain
│   │   ├── BlockViewer
│   │   └── IntegrityStatus
│   └── SITREP (/sitrep)
│       ├── StatusOverview
│       ├── EvidenceDistribution
│       └── Recommendations
└── Providers
    ├── NarrativeProvider
    ├── NetworkProvider
    └── ThemeProvider
```

---

## 🔌 React Hooks

### Custom Hooks

#### `useNarratives()`

```typescript
import { useNarratives } from '@/hooks/useNarratives';

const { narratives, loading, error, refetch } = useNarratives();
```

**Returns**:

- `narratives`: Array of narrative objects
- `loading`: Boolean loading state
- `error`: Error object or null
- `refetch`: Function to refetch data

---

#### `useNarrative(id: string)`

```typescript
import { useNarrative } from '@/hooks/useNarrative';

const { narrative, loading, error } = useNarrative('NAR-HUMMBL-PERSPECTIVE');
```

**Returns**:

- `narrative`: Single narrative object
- `loading`: Boolean loading state
- `error`: Error object or null

---

#### `useNetwork(format?: string)`

```typescript
import { useNetwork } from '@/hooks/useNetwork';

const { network, loading, error } = useNetwork('d3');
```

**Returns**:

- `network`: Network graph data
- `loading`: Boolean loading state
- `error`: Error object or null

---

#### `useQDM(include?: string)`

```typescript
import { useQDM } from '@/hooks/useQDM';

const { qdm, loading, error } = useQDM('all');
```

**Returns**:

- `qdm`: QDM matrix data
- `loading`: Boolean loading state
- `error`: Error object or null

---

#### `useLedger(filters?: LedgerFilters)`

```typescript
import { useLedger } from '@/hooks/useLedger';

const { ledger, loading, error } = useLedger({ narrative_id: 'NAR-HUMMBL-PERSPECTIVE' });
```

**Returns**:

- `ledger`: Ledger chain data
- `loading`: Boolean loading state
- `error`: Error object or null

---

#### `useSITREP()`

```typescript
import { useSITREP } from '@/hooks/useSITREP';

const { sitrep, loading, error, refresh } = useSITREP();
```

**Returns**:

- `sitrep`: SITREP data
- `loading`: Boolean loading state
- `error`: Error object or null
- `refresh`: Function to refresh SITREP

---

## 📦 Data Types (TypeScript)

### Core Types

```typescript
// types/narrative.ts
export interface Narrative {
  narrative_id: string;
  version: string;
  provenance_hash: string;
  evidence_quality: 'A' | 'B' | 'C';
  title: string;
  summary: string;
  category: string;
  tags: string[];
  domain: string[];
  confidence: number;
  complexity: {
    cognitive_load: string;
    time_to_elicit: string;
    expertise_required: string;
  };
  linked_signals: Signal[];
  relationships: Relationship[];
  citations: Citation[];
  elicitation_methods: ElicitationMethod[];
  examples: Example[];
  related_frameworks: string[];
  changelog: ChangelogEntry[];
}

export interface Signal {
  signal_id: string;
  signal_type: string;
  weight: number;
  context: string;
}

export interface Relationship {
  type: string;
  target: string;
  description: string;
}

export interface Citation {
  author: string;
  year: number | string;
  title: string;
  source: string;
}

export interface ElicitationMethod {
  method: string;
  duration: string;
  difficulty: string;
}

export interface Example {
  scenario: string;
  application: string;
  outcome: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string;
}
```

```typescript
// types/network.ts
export interface NetworkNode {
  id: string;
  label: string;
  category: string;
  confidence: number;
  evidence_quality: 'A' | 'B' | 'C';
  provenance_hash: string;
  complexity: string;
  domain: string[];
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: string;
  description: string;
  weight: number;
  bidirectional: boolean;
}

export interface NetworkData {
  metadata: {
    generated_at: string;
    total_nodes: number;
    total_edges: number;
    density: number;
  };
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  network_statistics: NetworkStatistics;
  visualization_hints: VisualizationHints;
}
```

```typescript
// types/qdm.ts
export interface QDMMatrix {
  matrix: number[][];
  labels: string[];
  dimensions: [number, number];
  metadata: {
    generated_at: string;
    integrity_hash: string;
  };
}

export interface NarrativeScore {
  narrative_id: string;
  confidence: number;
  evidence_quality: 'A' | 'B' | 'C';
  evidence_score: number;
  complexity_score: number;
  relationship_score: number;
  composite_score: number;
  rank: number;
}

export interface DecisionPathway {
  from: string;
  to: string;
  type: string;
  description: string;
  confidence: number;
  pathway_strength: number;
}
```

```typescript
// types/ledger.ts
export interface LedgerBlock {
  block_id: number;
  narrative_id: string;
  provenance_hash: string;
  evidence_quality: 'A' | 'B' | 'C';
  confidence: number;
  timestamp: string;
  previous_hash: string;
}

export interface LedgerChain {
  blocks: LedgerBlock[];
  chain_metadata: {
    total_blocks: number;
    chain_integrity: 'VALID' | 'INVALID';
    last_block_timestamp: string;
  };
}
```

```typescript
// types/sitrep.ts
export interface SITREP {
  timestamp: string;
  status: 'operational' | 'degraded' | 'offline';
  narratives_loaded: number;
  evidence_quality_distribution: {
    A: number;
    B: number;
    C: number;
  };
  average_confidence: number;
  network_health: {
    density: number;
    connectivity: 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';
    central_nodes: string[];
  };
  integrity_status: {
    schema_compliance: 'PASS' | 'FAIL';
    provenance_audit: 'PASS' | 'FAIL';
    cross_reference_sync: 'PASS' | 'FAIL';
    overall_quality_score: number;
  };
  recommendations: string[];
}
```

---

## 🔄 State Management

### Context Providers

#### NarrativeProvider

```typescript
import { NarrativeProvider } from '@/providers/NarrativeProvider';

<NarrativeProvider>
  <App />
</NarrativeProvider>
```

**Provides**:

- Global narrative state
- Caching layer
- Refetch mechanisms

---

#### NetworkProvider

```typescript
import { NetworkProvider } from '@/providers/NetworkProvider';

<NetworkProvider>
  <NetworkVisualizer />
</NetworkProvider>
```

**Provides**:

- Network graph state
- Layout algorithms
- Interaction handlers

---

## 🎯 Integration Bridge

### File Structure

```
/Users/others/CascadeProjects/hummbl-io/
├── src/
│   ├── api/
│   │   ├── client.ts          # API client configuration
│   │   ├── narratives.ts      # Narrative endpoints
│   │   ├── network.ts         # Network endpoints
│   │   ├── qdm.ts             # QDM endpoints
│   │   ├── ledger.ts          # Ledger endpoints
│   │   └── sitrep.ts          # SITREP endpoints
│   ├── hooks/
│   │   ├── useNarratives.ts
│   │   ├── useNarrative.ts
│   │   ├── useNetwork.ts
│   │   ├── useQDM.ts
│   │   ├── useLedger.ts
│   │   └── useSITREP.ts
│   ├── components/
│   │   ├── narratives/
│   │   │   ├── NarrativeList.tsx
│   │   │   ├── NarrativeCard.tsx
│   │   │   └── NarrativeDetail.tsx
│   │   ├── network/
│   │   │   ├── NetworkVisualizer.tsx
│   │   │   ├── D3ForceGraph.tsx
│   │   │   └── CytoscapeGraph.tsx
│   │   ├── qdm/
│   │   │   ├── QDMMatrix.tsx
│   │   │   ├── NarrativeScores.tsx
│   │   │   └── DecisionPathways.tsx
│   │   ├── ledger/
│   │   │   ├── LedgerChain.tsx
│   │   │   └── BlockViewer.tsx
│   │   └── sitrep/
│   │       ├── StatusOverview.tsx
│   │       └── EvidenceDistribution.tsx
│   ├── providers/
│   │   ├── NarrativeProvider.tsx
│   │   └── NetworkProvider.tsx
│   ├── types/
│   │   ├── narrative.ts
│   │   ├── network.ts
│   │   ├── qdm.ts
│   │   ├── ledger.ts
│   │   └── sitrep.ts
│   └── utils/
│       ├── api.ts
│       └── validation.ts
├── public/
│   └── data/              # Static build outputs
│       ├── narratives.json
│       ├── network.json
│       ├── qdm.json
│       ├── ledger.json
│       └── sitrep.json
└── api/                   # API routes (if using Next.js)
    └── [endpoint].ts
```

---

## 🚀 Implementation Steps

### Phase 1: API Layer (Week 1)

1. ✅ Create API client configuration
2. ✅ Implement endpoint handlers
3. ✅ Add error handling and retries
4. ✅ Set up CORS and security

### Phase 2: Data Layer (Week 1-2)

1. ✅ Define TypeScript types
2. ✅ Create custom hooks
3. ✅ Implement context providers
4. ✅ Add caching layer

### Phase 3: Components (Week 2-3)

1. ✅ Build narrative components
2. ✅ Create network visualizer
3. ✅ Implement QDM dashboard
4. ✅ Build ledger viewer
5. ✅ Create SITREP panel

### Phase 4: Integration (Week 3-4)

1. ✅ Connect build outputs to API
2. ✅ Wire up React components
3. ✅ Add routing and navigation
4. ✅ Implement state management

### Phase 5: Testing & Deployment (Week 4)

1. ✅ Unit tests for hooks
2. ✅ Integration tests for API
3. ✅ E2E tests for components
4. ✅ Deploy to Vercel

---

## 📝 Configuration

### Environment Variables

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BUILD_OUTPUT_DIR=/Users/others/Downloads/dist
VITE_ENABLE_CACHING=true
VITE_CACHE_TTL=300000
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## ✅ Next Actions

1. **Implement API client** (`src/api/client.ts`)
2. **Create TypeScript types** (`src/types/*.ts`)
3. **Build custom hooks** (`src/hooks/*.ts`)
4. **Develop core components** (`src/components/*`)
5. **Set up routing** (React Router or Next.js)
6. **Connect build outputs** (static JSON or API endpoints)

---

**Status**: ✅ Specification Complete  
**Ready for**: Implementation Phase  
**Dependencies**: React 18, TypeScript 5, Vite 5

---

_End of Integration Specification_
