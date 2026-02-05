# Agent Dashboard Design

## Overview

Internal operations dashboard for monitoring and controlling the HUMMBL agent governance system. Built to leverage existing infrastructure rather than rebuilding from scratch.

## Strategic Decision: MCP-First Architecture

Instead of building a full Workers backend with KV storage, we leverage:

1. **Existing `hummbl-gov` CLI** - Already built with all commands
2. **MCP Server** - Wrap governance package for tool access
3. **Thin React Dashboard** - UI that calls MCP tools via Claude Code

This approach:

- Reuses 100% of governance logic (no duplication)
- Works with local file system (no KV migration needed)
- Integrates with Claude Code's MCP infrastructure
- Can be extended to work standalone later

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Agent Dashboard (React)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Status  │ │ Temporal │ │  Audit   │ │ Profiles │           │
│  │  Panel   │ │ Controls │ │   Log    │ │  Viewer  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                   │
│       └────────────┴─────┬──────┴────────────┘                   │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │ MCP Client│                                 │
│                    └─────┬─────┘                                 │
└──────────────────────────┼───────────────────────────────────────┘
                           │ MCP Protocol
┌──────────────────────────┼───────────────────────────────────────┐
│                    ┌─────▼─────┐                                 │
│                    │MCP Server │  @hummbl/governance-mcp         │
│                    │  (Node)   │                                 │
│                    └─────┬─────┘                                 │
│                          │                                       │
│              ┌───────────┴───────────┐                           │
│              │ @hummbl/governance    │                           │
│              │ (existing package)    │                           │
│              └───────────┬───────────┘                           │
│                          │                                       │
│              ┌───────────▼───────────┐                           │
│              │ ~/.claude/governance/ │                           │
│              │ - config.yaml         │                           │
│              │ - audit/events.jsonl  │                           │
│              │ - state/temporal.json │                           │
│              └───────────────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

## MCP Server Tools

The MCP server exposes these tools (mapping to CLI commands):

| Tool                  | Description                  | Maps To                             |
| --------------------- | ---------------------------- | ----------------------------------- |
| `governance_status`   | Get current governance state | `hummbl-gov status`                 |
| `governance_check`    | Check if action is allowed   | `hummbl-gov check <action>`         |
| `governance_freeze`   | Declare code freeze          | `hummbl-gov freeze [reason]`        |
| `governance_unfreeze` | Lift code freeze             | `hummbl-gov unfreeze [reason]`      |
| `governance_incident` | Declare incident             | `hummbl-gov incident <id> [reason]` |
| `governance_resolve`  | Resolve incident             | `hummbl-gov resolve [reason]`       |
| `governance_profile`  | Get profile info             | `hummbl-gov profile [name]`         |
| `governance_audit`    | Get recent audit events      | `hummbl-gov audit --tail N`         |
| `governance_chain`    | Get chain state              | `hummbl-gov chain`                  |

## Implementation Plan

### Phase 1: MCP Server (apps/mcp-server)

Repurpose existing `apps/mcp-server` directory:

```typescript
// apps/mcp-server/src/governance-tools.ts
import {
  getGovernanceState,
  checkGovernance,
  declareFreeze,
  liftFreeze,
  declareIncident,
  resolveIncident,
  loadPresets,
  getChainState,
  getTemporalSummary,
} from "@hummbl/governance";

export const governanceTools = {
  governance_status: {
    description: "Get current governance state",
    handler: () => getGovernanceState(),
  },
  governance_check: {
    description: "Check if an action is allowed",
    parameters: { action: "string", command: "string?" },
    handler: ({ action, command }) => checkGovernance({ action, command, ... }),
  },
  // ... other tools
};
```

### Phase 2: Dashboard UI (apps/dashboard)

Create new dashboard app OR repurpose `apps/web`:

**Option A: New App** (Recommended)

- Clean slate for ops-focused UI
- Different nav structure than public web app
- Can use stricter auth requirements

**Option B: Add Route to Existing Web**

- Faster to implement
- Share components
- Add `/ops` or `/governance` route

**Dashboard Pages:**

1. **Home** (`/`)
   - Current temporal state (large indicator)
   - Active profile summary
   - Quick action buttons
   - Last 5 audit events

2. **Temporal** (`/temporal`)
   - State transition controls
   - Freeze/Unfreeze panel
   - Incident management
   - State history timeline

3. **Audit** (`/audit`)
   - Event table with pagination
   - Filters: date, decision, action type
   - Chain verification status
   - Export to JSON/CSV

4. **Profiles** (`/profiles`)
   - List of 7 presets
   - Profile comparison view
   - Dimension breakdown

5. **Checker** (`/check`)
   - Action permission tester
   - Quick check buttons
   - Result with reason codes

### Phase 3: Integration

**Option A: MCP Integration with Claude Code**

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "governance": {
      "command": "node",
      "args": ["./apps/mcp-server/dist/index.js"],
      "cwd": "/path/to/hummbl-monorepo"
    }
  }
}
```

**Option B: REST API Wrapper**

If dashboard needs to run standalone (without Claude Code):

```typescript
// apps/workers/src/routes/governance.ts
import { governanceTools } from '@hummbl/governance-mcp';

app.get('/api/governance/status', async c => {
  return c.json(await governanceTools.governance_status.handler());
});
```

## File Structure

```
hummbl-monorepo/
├── apps/
│   ├── mcp-server/           # Repurpose for governance MCP
│   │   ├── src/
│   │   │   ├── index.ts      # MCP server entry
│   │   │   └── governance-tools.ts
│   │   └── package.json
│   │
│   └── dashboard/            # New dashboard app (or add to web/)
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   ├── Temporal.tsx
│       │   │   ├── Audit.tsx
│       │   │   ├── Profiles.tsx
│       │   │   └── Checker.tsx
│       │   ├── components/
│       │   │   ├── StatusPanel.tsx
│       │   │   ├── TemporalControls.tsx
│       │   │   ├── AuditTable.tsx
│       │   │   ├── ProfileCard.tsx
│       │   │   └── ActionChecker.tsx
│       │   ├── hooks/
│       │   │   └── useGovernance.ts
│       │   └── lib/
│       │       └── mcp-client.ts
│       └── package.json
│
└── packages/
    └── governance/           # Link from hummbl-agent
        └── (symlink or copy)
```

## Dependencies

**MCP Server:**

```json
{
  "dependencies": {
    "@hummbl/governance": "workspace:*",
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

**Dashboard:**

```json
{
  "dependencies": {
    "@hummbl/ui": "workspace:*",
    "@tanstack/react-query": "^5.90.12",
    "react": "^19.2.0",
    "react-router-dom": "^7.12.0"
  }
}
```

## Build Sequence

1. **Link governance package**

   ```bash
   cd hummbl-monorepo
   pnpm add @hummbl/governance@link:../hummbl-agent/packages/governance
   ```

2. **Build MCP server**

   ```bash
   cd apps/mcp-server
   pnpm build
   ```

3. **Test MCP tools**

   ```bash
   # In Claude Code, after adding to settings
   # Call governance_status tool
   ```

4. **Build dashboard**

   ```bash
   cd apps/dashboard
   pnpm dev
   ```

5. **Connect dashboard to MCP**
   - Dashboard calls governance functions directly (same process)
   - Or: Dashboard calls REST API that wraps governance

## Alternative: Direct Function Calls

For local development, the dashboard can import governance directly:

```typescript
// apps/dashboard/src/lib/governance.ts
import {
  getGovernanceState,
  declareFreeze,
  liftFreeze,
  // ... other imports
} from '@hummbl/governance';

// Direct function calls - no shell execution needed
export async function getStatus() {
  return getGovernanceState();
}

export async function freeze(reason: string) {
  return declareFreeze(reason);
}
```

This is the safest and most direct approach - no shell execution, no command injection risks.

## Success Criteria

- [ ] MCP server exposes all governance tools
- [ ] Dashboard displays current state
- [ ] Temporal controls work (freeze/unfreeze/incident)
- [ ] Audit log displays with pagination
- [ ] Profile comparison works
- [ ] Action checker shows correct decisions

## Next Steps

1. Decide: MCP server vs direct import vs REST API
2. Link governance package to monorepo
3. Build MCP server with governance tools
4. Create minimal dashboard MVP (status + temporal)
5. Iterate to add audit, profiles, checker

---

_Design created: 2026-02-04_
_Author: Claude Opus 4.5_
