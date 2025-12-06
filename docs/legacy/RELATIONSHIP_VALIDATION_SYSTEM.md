# HUMMBL Relationship Validation System

**Generated:** 2025-11-28
**Status:** Development Complete

## Overview

This system enables systematic classification of all 7,140 possible model-pair relationships in the HUMMBL Base120 framework.

## Components Created

### 1. Candidate Pair Generator (`generate-pairs.py`)
**Location:** Downloaded files
**Output:** 
- `relationship-candidates.json` (1.6MB, 7,140 pairs)
- `relationship-candidates.csv` (306KB, flat format)

**Priority Scoring:**
| Score | Description | Count |
|-------|-------------|-------|
| 18 | Adjacent foundational within-transformation | 20 |
| 15-17 | High-priority within-transformation | 94 |
| 10-13 | Mid-priority within-transformation | 1,026 |
| 3-9 | High-affinity cross-transformation | 2,067 |
| 0-2 | Standard cross-transformation | 3,933 |

### 2. Validation Service (`apps/mcp-server/src/tools/validation-service.ts`)
**Purpose:** Core logic for classification workflow

**Key Methods:**
- `loadCandidates()` - Load JSON data
- `getNextBatch()` - Get filtered pairs for validation
- `buildContext()` - Build AI classification context
- `generateClassificationPrompt()` - Generate AI prompt
- `recordClassification()` - Store results
- `exportRelationships()` - Export as ModelRelationship[]

### 3. MCP Tools (`apps/mcp-server/src/tools/validation-tools.ts`)
**Purpose:** Claude Desktop integration

**Available Tools:**
- `load_candidates` - Initialize validation session
- `get_validation_stats` - Progress statistics
- `get_next_batch` - Get pairs to classify
- `classify_pair` - Generate AI prompt for pair
- `record_classification` - Save classification
- `export_relationships` - Export results
- `get_priority_tiers` - Strategic planning view

### 4. CLI Tool (`scripts/validate-relationships.ts`)
**Purpose:** Batch processing from terminal

**Commands:**
```bash
npx tsx scripts/validate-relationships.ts --progress
npx tsx scripts/validate-relationships.ts --batch 20 --tier 1
npx tsx scripts/validate-relationships.ts --record RC-0001 enables a→b B "reasoning"
npx tsx scripts/validate-relationships.ts --export
```

### 5. Web Validator (`public/validator.html`)
**Purpose:** Interactive browser-based validation UI

**Features:**
- Load candidates from JSON file
- Filter by priority tier
- One-click relationship type selection
- Direction and confidence controls
- Progress tracking with localStorage persistence
- Export to JSON/CSV

## Relationship Types

| Type | Definition | Typical Direction |
|------|------------|-------------------|
| **enables** | A is prerequisite for effective use of B | a→b or b→a |
| **reinforces** | Using A makes B more effective (mutual) | bidirectional |
| **conflicts** | A and B suggest opposite actions | bidirectional |
| **contains** | A is a subset or special case of B | a→b or b→a |
| **sequences** | A typically precedes B in reasoning | a→b or b→a |
| **complements** | A and B address different aspects | bidirectional |
| **none** | No meaningful relationship exists | N/A |

## Validation Strategy

### Recommended Order

1. **Tier 1 (Priority 15+):** 114 pairs
   - Adjacent foundational models within same transformation
   - Highest confidence, clearest relationships
   - ~2-3 hours to complete

2. **Tier 2 (Priority 10-14):** 1,026 pairs
   - Mid-priority within-transformation
   - Still relatively clear patterns
   - ~20-25 hours to complete

3. **Tier 3 (Priority 3-9):** 2,067 pairs
   - High-affinity cross-transformation (DE↔IN, P↔DE, etc.)
   - More nuanced relationships
   - ~40-50 hours to complete

4. **Tier 4 (Priority 0-2):** 3,933 pairs
   - Standard cross-transformation
   - Many "none" expected
   - ~80-100 hours OR AI-assisted batch processing

### Time Estimates

| Approach | Tier 1 | All Tiers |
|----------|--------|-----------|
| Manual (2 min/pair) | 4 hours | 240 hours |
| AI-assisted (30 sec/pair) | 1 hour | 60 hours |
| Batch AI + review | 30 min | 15 hours |

## Next Steps

1. **Copy downloaded files to project:**
   ```bash
   cp ~/Downloads/relationship-candidates.json apps/mcp-server/src/data/candidates/
   ```

2. **Start with Tier 1 validation:**
   - Open `public/validator.html` in browser
   - Load `relationship-candidates.json`
   - Select Tier 1 (15+)
   - Classify all 114 high-priority pairs

3. **Export and integrate:**
   - Export classified relationships as JSON
   - Update `seed-relationships.ts` with validated pairs
   - Deploy to production

## File Structure

```
apps/mcp-server/src/
├── data/
│   ├── candidates/
│   │   ├── README.md
│   │   ├── relationship-candidates.json  ← PLACE HERE
│   │   └── validation-state.json         ← Auto-created
│   └── seed-relationships.ts
├── tools/
│   ├── validation-service.ts
│   └── validation-tools.ts
└── types/
    └── relationships.ts

public/
└── validator.html

scripts/
└── validate-relationships.ts
```

## Integration with Existing System

The validation system produces `ModelRelationship[]` compatible with:
- `apps/mcp-server/src/types/relationships.ts`
- `apps/mcp-server/src/data/seed-relationships.ts`
- REST API endpoints at `/api/relationships`

After validation, relationships can be:
1. Added to `seed-relationships.ts` for static deployment
2. Stored in D1 database via API
3. Exported for external tools/analysis
