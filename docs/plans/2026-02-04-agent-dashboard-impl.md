# Agent Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build internal operations dashboard for monitoring and controlling hummbl-agent governance system.

**Architecture:** MCP-first approach extending existing `@hummbl/mcp-server` with governance tools. Dashboard imports governance functions directly for local operation. React Query for state management with polling.

**Tech Stack:** React 19, Vite, Tailwind CSS, @modelcontextprotocol/sdk, @hummbl/governance, @hummbl/ui components.

---

## Prerequisites

Before starting, ensure:
1. `hummbl-agent` repo is at `/Users/others/workspace/active/hummbl-agent`
2. Governance package is built: `cd hummbl-agent/packages/governance && pnpm build`
3. Monorepo dependencies installed: `cd hummbl-monorepo && pnpm install`

---

## Task 1: Link Governance Package

**Files:**
- Modify: `/Users/others/workspace/active/hummbl-monorepo/package.json`
- Modify: `/Users/others/workspace/active/hummbl-monorepo/pnpm-workspace.yaml`

**Step 1: Add workspace link to governance**

In root `package.json`, no changes needed - pnpm workspace handles it.

**Step 2: Create symlink for governance package**

Run:
```bash
cd /Users/others/workspace/active/hummbl-monorepo
mkdir -p packages/governance
ln -sf /Users/others/workspace/active/hummbl-agent/packages/governance/dist packages/governance/dist
ln -sf /Users/others/workspace/active/hummbl-agent/packages/governance/package.json packages/governance/package.json
```

**Step 3: Verify link works**

Run: `ls -la packages/governance/`
Expected: Symlinks pointing to hummbl-agent

**Step 4: Install dependencies**

Run: `pnpm install`
Expected: No errors, governance package resolved

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: link @hummbl/governance package from hummbl-agent"
```

---

## Task 2: Add Governance Tools to MCP Server

**Files:**
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/mcp-server/src/governance-tools.ts`
- Modify: `/Users/others/workspace/active/hummbl-monorepo/apps/mcp-server/src/index.ts`
- Modify: `/Users/others/workspace/active/hummbl-monorepo/apps/mcp-server/package.json`

**Step 1: Write failing test for governance tools**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/mcp-server/src/governance-tools.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { governanceTools } from './governance-tools.js';

describe('governance-tools', () => {
  it('exports governance_status tool', () => {
    expect(governanceTools).toHaveProperty('governance_status');
    expect(governanceTools.governance_status).toHaveProperty('handler');
  });

  it('governance_status returns state object', async () => {
    const result = await governanceTools.governance_status.handler({});
    expect(result).toHaveProperty('tenant_id');
    expect(result).toHaveProperty('temporal_state');
    expect(result).toHaveProperty('active_profile');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/others/workspace/active/hummbl-monorepo/apps/mcp-server && pnpm test`
Expected: FAIL - governance-tools.ts not found

**Step 3: Add governance dependency to MCP server**

In `apps/mcp-server/package.json`, add to dependencies:

```json
{
  "dependencies": {
    "@hummbl/governance": "workspace:*"
  }
}
```

**Step 4: Create governance-tools.ts**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/mcp-server/src/governance-tools.ts`:

```typescript
import {
  getGovernanceState,
  checkGovernance,
  generateSessionId,
  declareFreeze,
  liftFreeze,
  declareIncident,
  resolveIncident,
  getTemporalSummary,
  getChainState,
  loadPresets,
  isActionAllowedInState,
  type GovernanceState,
  type GovernanceCheckResult,
  type TemporalState,
} from '@hummbl/governance';

// Tool definitions for MCP server
export const governanceTools = {
  governance_status: {
    name: 'governance_status',
    description: 'Get current governance state including temporal state, active profile, and tenant info',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (_args: Record<string, unknown>): Promise<GovernanceState> => {
      return getGovernanceState();
    },
  },

  governance_check: {
    name: 'governance_check',
    description: 'Check if an action is allowed under current governance policy',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          description: 'Action to check (commit, push, deploy, read, delete, etc.)',
        },
        command: {
          type: 'string',
          description: 'Optional command string for detailed checking',
        },
      },
      required: ['action'],
    },
    handler: async (args: { action: string; command?: string }): Promise<GovernanceCheckResult> => {
      const state = getGovernanceState();
      return checkGovernance({
        tenant_id: state.tenant_id,
        agent_id: 'mcp-client',
        session_id: generateSessionId(),
        action: args.action as any,
        command: args.command,
      });
    },
  },

  governance_freeze: {
    name: 'governance_freeze',
    description: 'Declare a code freeze - blocks all mutations',
    inputSchema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for the freeze',
        },
      },
      required: ['reason'],
    },
    handler: async (args: { reason: string }) => {
      return declareFreeze(args.reason);
    },
  },

  governance_unfreeze: {
    name: 'governance_unfreeze',
    description: 'Lift a code freeze - returns to normal state',
    inputSchema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for lifting the freeze',
        },
      },
      required: ['reason'],
    },
    handler: async (args: { reason: string }) => {
      return liftFreeze(args.reason);
    },
  },

  governance_incident: {
    name: 'governance_incident',
    description: 'Declare an incident - enables enhanced audit and emergency operations',
    inputSchema: {
      type: 'object',
      properties: {
        incident_id: {
          type: 'string',
          description: 'Incident identifier (e.g., INC-001)',
        },
        reason: {
          type: 'string',
          description: 'Reason for declaring incident',
        },
      },
      required: ['incident_id', 'reason'],
    },
    handler: async (args: { incident_id: string; reason: string }) => {
      return declareIncident(args.incident_id, args.reason);
    },
  },

  governance_resolve: {
    name: 'governance_resolve',
    description: 'Resolve current incident - returns to normal state',
    inputSchema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Resolution reason',
        },
      },
      required: ['reason'],
    },
    handler: async (args: { reason: string }) => {
      return resolveIncident(args.reason);
    },
  },

  governance_temporal: {
    name: 'governance_temporal',
    description: 'Get detailed temporal state summary including effects and active windows',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (_args: Record<string, unknown>) => {
      return getTemporalSummary();
    },
  },

  governance_chain: {
    name: 'governance_chain',
    description: 'Get audit chain state including sequence number and hash',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (_args: Record<string, unknown>) => {
      return getChainState();
    },
  },

  governance_presets: {
    name: 'governance_presets',
    description: 'List all available governance profile presets',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (_args: Record<string, unknown>) => {
      return loadPresets();
    },
  },
};

// Export tool list for MCP registration
export const governanceToolList = Object.values(governanceTools).map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
}));

// Export handler map
export const governanceHandlers = Object.fromEntries(
  Object.values(governanceTools).map((tool) => [tool.name, tool.handler])
);
```

**Step 5: Run test to verify it passes**

Run: `cd /Users/others/workspace/active/hummbl-monorepo/apps/mcp-server && pnpm test`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/mcp-server/src/governance-tools.ts apps/mcp-server/src/governance-tools.test.ts apps/mcp-server/package.json
git commit -m "feat(mcp): add governance tools to MCP server"
```

---

## Task 3: Register Governance Tools in MCP Server

**Files:**
- Modify: `/Users/others/workspace/active/hummbl-monorepo/apps/mcp-server/src/index.ts`

**Step 1: Import governance tools**

At top of `apps/mcp-server/src/index.ts`, add:

```typescript
import { governanceToolList, governanceHandlers } from './governance-tools.js';
```

**Step 2: Add governance tools to ListToolsRequestSchema handler**

In the `server.setRequestHandler(ListToolsRequestSchema, ...)` handler, add governance tools:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools ...
    ...governanceToolList,
  ],
}));
```

**Step 3: Add governance handlers to CallToolRequestSchema handler**

In the `server.setRequestHandler(CallToolRequestSchema, ...)` handler, add:

```typescript
// At the start of the handler, check for governance tools
if (request.params.name.startsWith('governance_')) {
  const handler = governanceHandlers[request.params.name];
  if (handler) {
    try {
      const result = await handler(request.params.arguments as any);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Governance error: ${String(error)}` }],
        isError: true,
      };
    }
  }
}
```

**Step 4: Build and test MCP server**

Run:
```bash
cd /Users/others/workspace/active/hummbl-monorepo/apps/mcp-server
pnpm build
```

Expected: Build succeeds with no errors

**Step 5: Commit**

```bash
git add apps/mcp-server/src/index.ts
git commit -m "feat(mcp): register governance tools in MCP server"
```

---

## Task 4: Create Dashboard App Scaffold

**Files:**
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/package.json`
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/tsconfig.json`
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/vite.config.ts`
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/index.html`
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/main.tsx`

**Step 1: Create package.json**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/package.json`:

```json
{
  "name": "@hummbl/dashboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@fontsource/inter": "^5.2.8",
    "@fontsource/jetbrains-mono": "^5.2.8",
    "@hummbl/ui": "workspace:*",
    "@hummbl/governance": "workspace:*",
    "@tanstack/react-query": "^5.90.12",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.12.0",
    "tailwind-merge": "^3.4.0",
    "class-variance-authority": "^0.7.1",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@hummbl/eslint-config": "workspace:*",
    "@hummbl/tsconfig": "workspace:*",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.2",
    "typescript": "^5.7.2",
    "vite": "^7.3.0",
    "vitest": "^4.0.16",
    "tailwindcss": "^4.1.18"
  }
}
```

**Step 2: Create tsconfig.json**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/tsconfig.json`:

```json
{
  "extends": "@hummbl/tsconfig/react.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create vite.config.ts**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/vite.config.ts`:

```typescript
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
    port: 5174, // Different from web app (5173)
  },
});
```

**Step 4: Create index.html**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HUMMBL Agent Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create main.tsx**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import './index.css';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000, // Poll every 5 seconds
      staleTime: 3000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

**Step 6: Create index.css**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/index.css`:

```css
@import 'tailwindcss';

:root {
  --obsidian-950: #09090b;
  --obsidian-900: #0f0f12;
  --obsidian-800: #18181b;
  --obsidian-700: #27272a;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--obsidian-950);
  color: #f4f4f5;
}
```

**Step 7: Install dependencies**

Run:
```bash
cd /Users/others/workspace/active/hummbl-monorepo
pnpm install
```

Expected: Dependencies installed

**Step 8: Commit**

```bash
git add apps/dashboard/
git commit -m "feat(dashboard): scaffold dashboard app with React 19 + Vite"
```

---

## Task 5: Create Dashboard Layout

**Files:**
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/layouts/DashboardLayout.tsx`

**Step 1: Create DashboardLayout component**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/layouts/DashboardLayout.tsx`:

```typescript
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  FileText,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@hummbl/ui';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Temporal', href: '/temporal', icon: Clock },
  { name: 'Audit Log', href: '/audit', icon: FileText },
  { name: 'Profiles', href: '/profiles', icon: Shield },
  { name: 'Checker', href: '/check', icon: CheckCircle },
];

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-obsidian-900 border-r border-obsidian-700 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-100">
            Agent Dashboard
          </h1>
          <p className="text-sm text-zinc-500">Governance Control</p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-obsidian-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-obsidian-800'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/dashboard/src/layouts/
git commit -m "feat(dashboard): add sidebar navigation layout"
```

---

## Task 6: Create Governance Hook

**Files:**
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/hooks/useGovernance.ts`

**Step 1: Write failing test**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/hooks/useGovernance.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGovernanceState } from './useGovernance';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useGovernanceState', () => {
  it('returns governance state', async () => {
    const { result } = renderHook(() => useGovernanceState(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveProperty('tenant_id');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/others/workspace/active/hummbl-monorepo/apps/dashboard && pnpm test`
Expected: FAIL - useGovernance not found

**Step 3: Create useGovernance hook**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/hooks/useGovernance.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGovernanceState,
  checkGovernance,
  generateSessionId,
  declareFreeze,
  liftFreeze,
  declareIncident,
  resolveIncident,
  getTemporalSummary,
  getChainState,
  loadPresets,
  type GovernanceState,
  type GovernanceCheckRequest,
} from '@hummbl/governance';

// Query keys
export const governanceKeys = {
  all: ['governance'] as const,
  state: () => [...governanceKeys.all, 'state'] as const,
  temporal: () => [...governanceKeys.all, 'temporal'] as const,
  chain: () => [...governanceKeys.all, 'chain'] as const,
  presets: () => [...governanceKeys.all, 'presets'] as const,
};

// State query
export function useGovernanceState() {
  return useQuery({
    queryKey: governanceKeys.state(),
    queryFn: getGovernanceState,
    refetchInterval: 5000,
  });
}

// Temporal summary query
export function useTemporalSummary() {
  return useQuery({
    queryKey: governanceKeys.temporal(),
    queryFn: getTemporalSummary,
    refetchInterval: 5000,
  });
}

// Chain state query
export function useChainState() {
  return useQuery({
    queryKey: governanceKeys.chain(),
    queryFn: getChainState,
  });
}

// Presets query
export function usePresets() {
  return useQuery({
    queryKey: governanceKeys.presets(),
    queryFn: loadPresets,
    staleTime: Infinity, // Presets don't change
  });
}

// Freeze mutation
export function useDeclareFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => declareFreeze(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
    },
  });
}

// Unfreeze mutation
export function useLiftFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => liftFreeze(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
    },
  });
}

// Incident mutation
export function useDeclareIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ incidentId, reason }: { incidentId: string; reason: string }) =>
      declareIncident(incidentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
    },
  });
}

// Resolve incident mutation
export function useResolveIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => resolveIncident(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
    },
  });
}

// Check governance mutation (not cached - always fresh)
export function useCheckGovernance() {
  return useMutation({
    mutationFn: (request: Omit<GovernanceCheckRequest, 'tenant_id' | 'agent_id' | 'session_id'>) => {
      const state = getGovernanceState();
      return checkGovernance({
        tenant_id: state.tenant_id,
        agent_id: 'dashboard',
        session_id: generateSessionId(),
        ...request,
      });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/others/workspace/active/hummbl-monorepo/apps/dashboard && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/dashboard/src/hooks/
git commit -m "feat(dashboard): add governance React Query hooks"
```

---

## Task 7: Create Home Page with Status Panel

**Files:**
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/pages/HomePage.tsx`
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/components/StatusPanel.tsx`
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/components/TemporalIndicator.tsx`

**Step 1: Create TemporalIndicator component**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/components/TemporalIndicator.tsx`:

```typescript
import { cn } from '@hummbl/ui';
import type { TemporalState } from '@hummbl/governance';

const stateConfig: Record<TemporalState, { color: string; label: string; bg: string }> = {
  normal: { color: 'text-emerald-400', label: 'Normal', bg: 'bg-emerald-500/10' },
  maintenance: { color: 'text-amber-400', label: 'Maintenance', bg: 'bg-amber-500/10' },
  incident: { color: 'text-orange-400', label: 'Incident', bg: 'bg-orange-500/10' },
  freeze: { color: 'text-rose-400', label: 'Freeze', bg: 'bg-rose-500/10' },
};

interface TemporalIndicatorProps {
  state: TemporalState;
  reason?: string;
  className?: string;
}

export function TemporalIndicator({ state, reason, className }: TemporalIndicatorProps) {
  const config = stateConfig[state];

  return (
    <div className={cn('rounded-lg p-4', config.bg, className)}>
      <div className="flex items-center gap-2">
        <div className={cn('h-3 w-3 rounded-full', config.color.replace('text-', 'bg-'))} />
        <span className={cn('text-lg font-semibold', config.color)}>
          {config.label}
        </span>
      </div>
      {reason && (
        <p className="mt-1 text-sm text-zinc-400">{reason}</p>
      )}
    </div>
  );
}
```

**Step 2: Create StatusPanel component**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/components/StatusPanel.tsx`:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@hummbl/ui';
import { useGovernanceState, useChainState } from '@/hooks/useGovernance';
import { TemporalIndicator } from './TemporalIndicator';
import { Loader2 } from 'lucide-react';

export function StatusPanel() {
  const { data: state, isLoading: stateLoading } = useGovernanceState();
  const { data: chain, isLoading: chainLoading } = useChainState();

  if (stateLoading || chainLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </CardContent>
      </Card>
    );
  }

  if (!state) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-zinc-500">
          Failed to load governance state
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Temporal State Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            Temporal State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemporalIndicator
            state={state.temporal_state}
            reason={state.temporal_reason}
          />
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            Active Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Audit</span>
              <span className="font-mono text-zinc-100">{state.active_profile.audit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Separation</span>
              <span className="font-mono text-zinc-100">{state.active_profile.separation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Data Class</span>
              <span className="font-mono text-zinc-100">
                {state.active_profile.dataClass.join(', ')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            Audit Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Sequence</span>
              <span className="font-mono text-zinc-100">{chain?.eventSequence ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Last Hash</span>
              <span className="font-mono text-zinc-100 truncate max-w-32">
                {chain?.lastEventHash.substring(0, 12)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tenant</span>
              <span className="font-mono text-zinc-100">{state.tenant_id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Create HomePage component**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/pages/HomePage.tsx`:

```typescript
import { StatusPanel } from '@/components/StatusPanel';

export function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Governance Overview</h2>
        <p className="text-zinc-500">Monitor and control agent governance state</p>
      </div>

      <StatusPanel />
    </div>
  );
}
```

**Step 4: Build and run dev server**

Run:
```bash
cd /Users/others/workspace/active/hummbl-monorepo/apps/dashboard
pnpm dev
```

Expected: Dev server starts at http://localhost:5174

**Step 5: Commit**

```bash
git add apps/dashboard/src/pages/ apps/dashboard/src/components/
git commit -m "feat(dashboard): add home page with status panel"
```

---

## Task 8: Create Temporal Controls Page

**Files:**
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/pages/TemporalPage.tsx`
- Create: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/components/TemporalControls.tsx`
- Modify: `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/main.tsx`

**Step 1: Create TemporalControls component**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/components/TemporalControls.tsx`:

```typescript
import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@hummbl/ui';
import {
  useDeclareFreeze,
  useLiftFreeze,
  useDeclareIncident,
  useResolveIncident,
  useGovernanceState,
} from '@/hooks/useGovernance';
import { Snowflake, Sun, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export function TemporalControls() {
  const { data: state } = useGovernanceState();
  const declareFreeze = useDeclareFreeze();
  const liftFreeze = useLiftFreeze();
  const declareIncident = useDeclareIncident();
  const resolveIncident = useResolveIncident();

  const [freezeReason, setFreezeReason] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [incidentReason, setIncidentReason] = useState('');
  const [resolveReason, setResolveReason] = useState('');

  const temporalState = state?.temporal_state ?? 'normal';
  const isLoading =
    declareFreeze.isPending ||
    liftFreeze.isPending ||
    declareIncident.isPending ||
    resolveIncident.isPending;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Freeze Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-400" />
            Code Freeze
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {temporalState !== 'freeze' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="freeze-reason">Reason</Label>
                <Input
                  id="freeze-reason"
                  placeholder="e.g., End of quarter release"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                />
              </div>
              <Button
                onClick={() => declareFreeze.mutate(freezeReason || 'Manual freeze')}
                disabled={isLoading}
                className="w-full"
                variant="destructive"
              >
                {declareFreeze.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Snowflake className="h-4 w-4 mr-2" />
                )}
                Declare Freeze
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-400">
                System is currently frozen. Mutations are blocked.
              </p>
              <Button
                onClick={() => liftFreeze.mutate(freezeReason || 'Manual unfreeze')}
                disabled={isLoading}
                className="w-full"
              >
                {liftFreeze.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                Lift Freeze
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Incident Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Incident Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {temporalState !== 'incident' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="incident-id">Incident ID</Label>
                <Input
                  id="incident-id"
                  placeholder="e.g., INC-001"
                  value={incidentId}
                  onChange={(e) => setIncidentId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident-reason">Reason</Label>
                <Input
                  id="incident-reason"
                  placeholder="e.g., Production outage"
                  value={incidentReason}
                  onChange={(e) => setIncidentReason(e.target.value)}
                />
              </div>
              <Button
                onClick={() =>
                  declareIncident.mutate({
                    incidentId: incidentId || 'INC-AUTO',
                    reason: incidentReason || 'Manual incident',
                  })
                }
                disabled={isLoading}
                className="w-full"
                variant="warning"
              >
                {declareIncident.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                Declare Incident
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-400">
                Incident mode active. Enhanced audit enabled.
              </p>
              <div className="space-y-2">
                <Label htmlFor="resolve-reason">Resolution Reason</Label>
                <Input
                  id="resolve-reason"
                  placeholder="e.g., Issue fixed"
                  value={resolveReason}
                  onChange={(e) => setResolveReason(e.target.value)}
                />
              </div>
              <Button
                onClick={() => resolveIncident.mutate(resolveReason || 'Manual resolve')}
                disabled={isLoading}
                className="w-full"
              >
                {resolveIncident.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Resolve Incident
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Create TemporalPage component**

Create `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/pages/TemporalPage.tsx`:

```typescript
import { TemporalControls } from '@/components/TemporalControls';
import { TemporalIndicator } from '@/components/TemporalIndicator';
import { useGovernanceState, useTemporalSummary } from '@/hooks/useGovernance';
import { Card, CardHeader, CardTitle, CardContent } from '@hummbl/ui';

export function TemporalPage() {
  const { data: state } = useGovernanceState();
  const { data: summary } = useTemporalSummary();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Temporal State</h2>
        <p className="text-zinc-500">Manage system state transitions</p>
      </div>

      {/* Current State */}
      {state && (
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <TemporalIndicator
              state={state.temporal_state}
              reason={state.temporal_reason}
              className="max-w-md"
            />
          </CardContent>
        </Card>
      )}

      {/* Effects */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Active Effects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Blocks Mutations</span>
                <span className={summary.effects.blocks_mutations ? 'text-rose-400' : 'text-zinc-100'}>
                  {summary.effects.blocks_mutations ? 'YES' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Enhanced Audit</span>
                <span className={summary.effects.enhanced_audit ? 'text-amber-400' : 'text-zinc-100'}>
                  {summary.effects.enhanced_audit ? 'YES' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Requires Incident ID</span>
                <span className={summary.effects.requires_incident_id ? 'text-orange-400' : 'text-zinc-100'}>
                  {summary.effects.requires_incident_id ? 'YES' : 'No'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <TemporalControls />
    </div>
  );
}
```

**Step 3: Add route to main.tsx**

Update `/Users/others/workspace/active/hummbl-monorepo/apps/dashboard/src/main.tsx` to add the Temporal route:

```typescript
import { TemporalPage } from './pages/TemporalPage';

// In Routes:
<Route path="temporal" element={<TemporalPage />} />
```

**Step 4: Test temporal controls**

Run: `pnpm dev`
Navigate to http://localhost:5174/temporal
Test: Click "Declare Freeze" then "Lift Freeze"

Expected: State transitions work, UI updates

**Step 5: Commit**

```bash
git add apps/dashboard/src/
git commit -m "feat(dashboard): add temporal state controls page"
```

---

## Summary Checklist

- [ ] Task 1: Link governance package
- [ ] Task 2: Add governance tools to MCP server
- [ ] Task 3: Register governance tools
- [ ] Task 4: Create dashboard app scaffold
- [ ] Task 5: Create dashboard layout
- [ ] Task 6: Create governance hooks
- [ ] Task 7: Create home page with status panel
- [ ] Task 8: Create temporal controls page

## Future Tasks (Phase 2)

- Task 9: Audit log viewer page
- Task 10: Profile viewer page
- Task 11: Action checker page
- Task 12: Real-time WebSocket updates
- Task 13: Export functionality

---

*Plan created: 2026-02-04*
*Author: Claude Opus 4.5*
