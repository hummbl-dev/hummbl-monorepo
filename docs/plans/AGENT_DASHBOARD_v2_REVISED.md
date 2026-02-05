# Agent Dashboard v2 - Revised Implementation Plan

**Date**: 2026-02-04  
**Status**: Ready for implementation  
**Based on**: Agent deliberation feedback (Architect, Security, Code Review, TDD)

---

## 🎯 Core Vision (REVISED)

**Purpose**: Internal operations dashboard for HUMMBL agent ecosystem governance  
**Architecture**: Direct governance package import (NOT MCP-first) + secure auth layer  
**Deployment**: Cloudflare Workers + hummbl-monorepo web app  
**Scope**: Monitor & control agent governance state (freeze, incident, profiles)

---

## 🚨 BLOCKERS FIXED

### 1. Architecture Clarity (FIXED)
**Problem**: Plan said "MCP-first" but code imported governance directly  
**Resolution**: **Direct import approach is correct**
- ✅ Use `@hummbl/governance` package directly (no MCP intermediary)
- ✅ MCP server moved to "future enhancement" task list
- ✅ Reduces latency, increases reliability

### 2. Authentication/Authorization (NEW - CRITICAL)
**Problem**: No auth checks = anyone can freeze agents  
**Resolution**: Add auth layer BEFORE UI
- Integrate **Privy** (or existing auth from hummbl-production)
- Require login for all dashboard access
- Role-based authorization for governance actions:
  - `viewer` - Read-only access
  - `operator` - Can transition states (freeze→normal)
  - `admin` - Can modify profiles, incident declarations

### 3. UI Components (FIXED)
**Problem**: Card subcomponents don't exist in @hummbl/ui  
**Resolution**: Create them as Task 0
- CardHeader, CardTitle, CardContent, CardDescription
- Button variant="warning" (for critical actions)
- StatusBadge component (for freeze/incident states)

### 4. Linking Approach (FIXED)
**Problem**: Symlinks break in CI/other machines  
**Resolution**: Use pnpm workspace protocol
```typescript
// Instead of symlink:
import { createProfile } from '/Users/others/...'

// Use workspace protocol:
import { createProfile } from '@hummbl/governance'
```

### 5. Audit Trail (NEW - CRITICAL)
**Problem**: Dashboard actions not logged  
**Resolution**: Every action writes to governance audit
```typescript
// All mutations flow through governance audit
const freezeAgent = async (reason: string) => {
  // Write to ~/.claude/governance audit trail
  // Creates event with timestamp + user + action
  // Verifies signatures
}
```

### 6. Testing (NEW - COMPREHENSIVE)
**Problem**: Only 2 shallow tests  
**Resolution**: Expand to 50+ tests
- Component tests (unit)
- Integration tests (governance flows)
- E2E tests (Playwright)
- 80% coverage threshold

---

## 📋 REVISED TASK ORDER

### **Phase 0: Prerequisites (1-2 hours)**

**Task 0.1: Build missing UI components**
- [ ] Create `packages/ui/src/components/Card.tsx` with subcomponents
- [ ] Create `packages/ui/src/components/Button.tsx` with variants
- [ ] Create `packages/ui/src/components/StatusBadge.tsx`
- [ ] Add Tailwind color palette (warning, critical, success)

**Task 0.2: Wire governance package**
- [ ] Add `@hummbl/governance` to monorepo `pnpm-workspace.yaml`
- [ ] Import from workspace, NOT symlinks
- [ ] Test imports work in monorepo context

### **Phase 1: Security Foundation (2-3 hours)**

**Task 1.1: Add authentication**
- [ ] Integrate auth provider (Privy or hummbl-production's auth)
- [ ] Add login component
- [ ] Protect routes with ProtectedRoute wrapper
- [ ] Store auth token in localStorage

**Task 1.2: Add authorization**
- [ ] Define role schema (viewer, operator, admin)
- [ ] Fetch user role from auth provider
- [ ] Create `useAuthorization()` hook
- [ ] Guard governance mutations behind role checks

**Task 1.3: Add audit trail**
- [ ] Create `useGovernanceAction()` hook
- [ ] Every action writes to governance audit
- [ ] Display audit log in dashboard
- [ ] Verify signatures on state transitions

### **Phase 2: Core Dashboard (3-4 hours)**

**Task 2.1: Layout & navigation**
- [ ] Create main layout with header, sidebar, content area
- [ ] Add navigation menu (Dashboard, Governance, Audit Log, Settings)
- [ ] Create responsive design (mobile, tablet, desktop)

**Task 2.2: Governance state display**
- [ ] TemporalIndicator (normal/freeze/incident/maint)
- [ ] StatusPanel (current mode, last action, next deadline)
- [ ] ProfileDisplay (audit level, separation policy, classifications)
- [ ] Real-time polling (5s refresh with Tanstack Query)

**Task 2.3: Governance controls**
- [ ] FreezeControls (enter/exit freeze, require reason)
- [ ] IncidentButton (declare incident, select severity)
- [ ] ProfileSelector (switch between presets)
- [ ] TemporalEditor (modify time windows)

**Task 2.4: Audit log viewer**
- [ ] Display 2,303+ audit events
- [ ] Filter by action type, timestamp, agent
- [ ] Show event details (signatures, chain of custody)
- [ ] Export audit trail

### **Phase 3: Testing (2-3 hours)**

**Task 3.1: Unit tests (20+ tests)**
- [ ] governance-tools.test.ts (expand from 2 → 20 tests)
- [ ] Component tests for each dashboard component
- [ ] Hook tests (useGovernanceAction, useAuthorization)

**Task 3.2: Integration tests (15+ tests)**
- [ ] Governance flow tests (freeze→normal transitions)
- [ ] Auth integration tests
- [ ] Audit trail generation tests

**Task 3.3: E2E tests (15+ tests)**
- [ ] Playwright tests for full user flows
- [ ] Test freeze workflow end-to-end
- [ ] Test incident declaration workflow

**Task 3.4: Coverage threshold**
- [ ] Set minimum 80% coverage
- [ ] Add coverage reporting to CI

### **Phase 4: Deployment & Documentation (1-2 hours)**

**Task 4.1: Workers deployment**
- [ ] Build Workers API for governance state polling
- [ ] Add authentication middleware
- [ ] Deploy to Cloudflare Workers

**Task 4.2: Documentation**
- [ ] Write API documentation
- [ ] Create user guide (how to use dashboard)
- [ ] Document governance state machine
- [ ] Create troubleshooting guide

---

## 🏗️ Architecture Diagram (CORRECTED)

```
┌────────────────────────────────────────────────────────┐
│         Agent Dashboard (apps/web)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Authentication Layer (Privy)                    │   │
│  │ - Login/logout                                  │   │
│  │ - Role resolution (viewer/operator/admin)       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Authorization Middleware                        │   │
│  │ - Check role for each action                    │   │
│  │ - Guard mutations (freeze, incident, etc.)      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Dashboard Components                            │   │
│  │ - StatusPanel, TemporalIndicator                │   │
│  │ - FreezeControls, IncidentButton                │   │
│  │ - AuditLog, ProfileDisplay                      │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
         ↓ import { createProfile, ... }
┌────────────────────────────────────────────────────────┐
│    @hummbl/governance (packages/governance)            │
│  - Profile creation & management                      │
│  - Temporal state machine                             │
│  - Audit event generation                             │
│  - Signature verification                             │
└────────────────────────────────────────────────────────┘
         ↓ write to
┌────────────────────────────────────────────────────────┐
│    ~/.claude/governance (local filesystem)             │
│  - 2,303+ audit events                                │
│  - Cryptographic signatures                           │
│  - Chain of custody                                   │
└────────────────────────────────────────────────────────┘
         ↓ also exposed by
┌────────────────────────────────────────────────────────┐
│    Cloudflare Workers (apps/workers)                   │
│  - GET /governance/state                              │
│  - POST /governance/action (authenticated)            │
│  - GET /governance/audit-log                          │
└────────────────────────────────────────────────────────┘
```

---

## 📦 File Structure (Updated)

```
apps/web/src/
├── main.tsx                          # Entry point with auth provider
├── App.tsx                           # Layout + routes
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx        # Route guard
│   │   └── LoginPage.tsx             # Login UI
│   ├── dashboard/
│   │   ├── Dashboard.tsx             # Main dashboard
│   │   ├── StatusPanel.tsx           # Current state display
│   │   ├── TemporalIndicator.tsx     # Visual state indicator
│   │   └── AuditLog.tsx              # Event history viewer
│   ├── governance/
│   │   ├── FreezeControls.tsx        # Freeze workflow
│   │   ├── IncidentButton.tsx        # Incident declaration
│   │   ├── ProfileSelector.tsx       # Profile switcher
│   │   └── TemporalEditor.tsx        # Time window editor
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MainLayout.tsx
├── hooks/
│   ├── useGovernanceAction.ts        # Action wrapper with audit
│   ├── useAuthorization.ts           # Role checking
│   ├── useGovernanceState.ts         # Poll governance state
│   └── useAuth.ts                    # Auth context
├── utils/
│   ├── governance-tools.ts           # Helpers
│   ├── auth-helpers.ts               # Auth utilities
│   └── validation.ts                 # Input validation
├── types/
│   ├── governance.d.ts               # Governance types
│   ├── auth.d.ts                     # Auth types
│   └── api.d.ts                      # API types
└── __tests__/
    ├── governance-tools.test.ts      # Unit tests
    ├── components/                   # Component tests
    ├── hooks/                        # Hook tests
    ├── integration/                  # Integration tests
    └── e2e/                          # Playwright tests
```

---

## ✅ Acceptance Criteria

**Phase 0 Complete When:**
- [ ] All UI components exist in @hummbl/ui
- [ ] Governance package imports work from monorepo
- [ ] No symlinks used

**Phase 1 Complete When:**
- [ ] Auth provider integrated
- [ ] All dashboard routes protected
- [ ] Role checks working
- [ ] Audit trail writing to governance

**Phase 2 Complete When:**
- [ ] All governance controls present
- [ ] State updates reflect in real-time
- [ ] No mutations without auth/authz

**Phase 3 Complete When:**
- [ ] 80%+ code coverage
- [ ] All critical paths tested
- [ ] E2E tests passing

**Phase 4 Complete When:**
- [ ] Deployed to Cloudflare Workers
- [ ] Documentation complete
- [ ] Ready for operations team

---

## 🚀 Success Metrics

| Metric | Target |
|--------|--------|
| Auth coverage | 100% of routes protected |
| Authz coverage | All mutations guarded |
| Audit compliance | All actions logged |
| Test coverage | 80%+ |
| Response time | <500ms governance state fetch |
| Uptime | 99.9% (Cloudflare SLA) |
| User experience | No stale state after actions |

---

## 📝 Notes

- **No MCP server tasks** - Move to "Phase 5: Future Enhancements"
- **Direct import preferred** - Simpler, faster, more reliable
- **Governance package is stable** - Built by Claude Code, 10 test suites, verified
- **Focus on auth first** - Security is non-negotiable for ops dashboard
- **Aim for enterprise-grade** - This controls agent behavior, must be bulletproof
