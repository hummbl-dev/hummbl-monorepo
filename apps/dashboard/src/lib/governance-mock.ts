/**
 * Browser-compatible mock of @hummbl/governance
 *
 * The actual governance package uses Node.js APIs (fs, path, os) which can't run in browsers.
 * This mock provides the same interface with localStorage persistence for development.
 *
 * TODO: Replace with API calls to a backend service that runs the real governance package.
 */

// Types
export interface GovernanceProfile {
  audit: 'none' | 'basic' | 'full' | 'signed';
  separation: 'none' | 'propose_only' | 'review_required' | 'full_split';
  dataClass: string[];
}

export interface GovernanceState {
  tenant_id: string;
  temporal_state: 'normal' | 'maintenance' | 'incident' | 'freeze';
  temporal_reason: string | null;
  active_profile: GovernanceProfile;
}

export interface TemporalEffects {
  blocks_mutations: boolean;
  enhanced_audit: boolean;
  requires_incident_id: boolean;
}

export interface TemporalSummary {
  state: GovernanceState['temporal_state'];
  record: { reason: string | null };
  effects: TemporalEffects;
}

export interface ChainState {
  eventSequence: number;
  lastEventHash: string;
  chainStartedAt: string;
}

export interface CheckResult {
  decision: 'allow' | 'deny' | 'require_approval';
  message: string;
}

// Audit Event Types
export interface AuditEvent {
  id: string;
  sequence: number;
  timestamp: string;
  action: string;
  decision: 'allow' | 'deny' | 'require_approval';
  agent_id: string;
  session_id: string;
  tenant_id: string;
  reason?: string;
  command?: string;
  temporal_state: GovernanceState['temporal_state'];
  hash: string;
  prev_hash: string;
}

export interface AuditLogOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  decision?: AuditEvent['decision'];
  action?: string;
}

// Storage keys
const STORAGE_KEYS = {
  state: 'governance_state',
  chain: 'governance_chain',
  events: 'governance_events',
};

// Default state
const DEFAULT_STATE: GovernanceState = {
  tenant_id: 'hummbl-dashboard',
  temporal_state: 'normal',
  temporal_reason: null,
  active_profile: {
    audit: 'full',
    separation: 'propose_only',
    dataClass: ['internal'],
  },
};

const DEFAULT_CHAIN: ChainState = {
  eventSequence: 0,
  lastEventHash: generateHash(),
  chainStartedAt: new Date().toISOString(),
};

// Helper functions
function generateHash(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateSessionId(): string {
  return `session-${generateHash()}`;
}

function loadState(): GovernanceState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.state);
    return stored ? JSON.parse(stored) : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state: GovernanceState): void {
  localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));
}

function loadChain(): ChainState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.chain);
    return stored ? JSON.parse(stored) : { ...DEFAULT_CHAIN };
  } catch {
    return { ...DEFAULT_CHAIN };
  }
}

function saveChain(chain: ChainState): void {
  localStorage.setItem(STORAGE_KEYS.chain, JSON.stringify(chain));
}

function incrementChain(): string {
  const chain = loadChain();
  const prevHash = chain.lastEventHash;
  chain.eventSequence++;
  chain.lastEventHash = generateHash();
  saveChain(chain);
  return prevHash;
}

function loadEvents(): AuditEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.events);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: AuditEvent[]): void {
  // Keep only last 1000 events
  const trimmed = events.slice(-1000);
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(trimmed));
}

function emitAuditEvent(
  action: string,
  decision: AuditEvent['decision'],
  details: { agent_id?: string; session_id?: string; reason?: string; command?: string }
): void {
  const state = loadState();
  const prevHash = incrementChain();
  const newChain = loadChain();

  const event: AuditEvent = {
    id: `evt-${generateHash()}`,
    sequence: newChain.eventSequence,
    timestamp: new Date().toISOString(),
    action,
    decision,
    agent_id: details.agent_id || 'dashboard',
    session_id: details.session_id || generateSessionId(),
    tenant_id: state.tenant_id,
    reason: details.reason,
    command: details.command,
    temporal_state: state.temporal_state,
    hash: newChain.lastEventHash,
    prev_hash: prevHash,
  };

  const events = loadEvents();
  events.push(event);
  saveEvents(events);
}

// Exported functions matching @hummbl/governance API

export function getGovernanceState(): GovernanceState {
  return loadState();
}

export function getTemporalSummary(): TemporalSummary {
  const state = loadState();
  return {
    state: state.temporal_state,
    record: { reason: state.temporal_reason },
    effects: getTemporalEffects(state.temporal_state),
  };
}

function getTemporalEffects(temporalState: GovernanceState['temporal_state']): TemporalEffects {
  switch (temporalState) {
    case 'freeze':
      return { blocks_mutations: true, enhanced_audit: true, requires_incident_id: false };
    case 'incident':
      return { blocks_mutations: false, enhanced_audit: true, requires_incident_id: true };
    case 'maintenance':
      return { blocks_mutations: false, enhanced_audit: false, requires_incident_id: false };
    case 'normal':
    default:
      return { blocks_mutations: false, enhanced_audit: false, requires_incident_id: false };
  }
}

export function getChainState(): ChainState {
  return loadChain();
}

export function loadPresets(): Record<string, GovernanceProfile> {
  return {
    flow: { audit: 'basic', separation: 'none', dataClass: ['internal'] },
    balanced: { audit: 'full', separation: 'propose_only', dataClass: ['internal'] },
    strict: { audit: 'signed', separation: 'full_split', dataClass: ['internal', 'confidential'] },
    enterprise: {
      audit: 'signed',
      separation: 'full_split',
      dataClass: ['internal', 'confidential', 'restricted'],
    },
    minimal: { audit: 'none', separation: 'none', dataClass: ['public'] },
    development: { audit: 'basic', separation: 'none', dataClass: ['internal'] },
    production: {
      audit: 'full',
      separation: 'review_required',
      dataClass: ['internal', 'confidential'],
    },
  };
}

export function declareFreeze(reason: string): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'freeze';
  state.temporal_reason = reason;
  saveState(state);
  emitAuditEvent('temporal_freeze', 'allow', { reason });
  return { success: true, new_state: 'freeze' };
}

export function liftFreeze(reason: string): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'normal';
  state.temporal_reason = reason;
  saveState(state);
  emitAuditEvent('temporal_unfreeze', 'allow', { reason });
  return { success: true, new_state: 'normal' };
}

export function declareIncident(
  incidentId: string,
  reason: string
): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'incident';
  state.temporal_reason = `[${incidentId}] ${reason}`;
  saveState(state);
  emitAuditEvent('temporal_incident', 'allow', { reason: `[${incidentId}] ${reason}` });
  return { success: true, new_state: 'incident' };
}

export function resolveIncident(reason: string): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'normal';
  state.temporal_reason = reason;
  saveState(state);
  emitAuditEvent('temporal_resolve', 'allow', { reason });
  return { success: true, new_state: 'normal' };
}

export interface GovernanceCheckRequest {
  tenant_id: string;
  agent_id: string;
  session_id: string;
  action: string;
  command?: string;
}

export function checkGovernance(request: GovernanceCheckRequest): CheckResult {
  const state = loadState();
  let decision: CheckResult['decision'] = 'allow';
  let message = 'Action permitted';

  // Check temporal state restrictions
  if (state.temporal_state === 'freeze') {
    const readActions = ['read', 'view', 'check'];
    if (!readActions.includes(request.action)) {
      decision = 'deny';
      message = 'System is frozen. Only read actions allowed.';
    }
  }

  if (state.temporal_state === 'incident') {
    const restrictedActions = ['deploy', 'schema_change', 'delete'];
    if (restrictedActions.includes(request.action)) {
      decision = 'require_approval';
      message = 'Incident mode requires approval for destructive actions.';
    }
  }

  // Emit audit event for the check
  emitAuditEvent(request.action, decision, {
    agent_id: request.agent_id,
    session_id: request.session_id,
    command: request.command,
  });

  return { decision, message };
}

// Audit log retrieval
export function getAuditLog(options: AuditLogOptions = {}): {
  events: AuditEvent[];
  total: number;
} {
  let events = loadEvents();

  // Apply filters
  if (options.startDate) {
    events = events.filter(e => e.timestamp >= options.startDate!);
  }
  if (options.endDate) {
    events = events.filter(e => e.timestamp <= options.endDate!);
  }
  if (options.decision) {
    events = events.filter(e => e.decision === options.decision);
  }
  if (options.action) {
    events = events.filter(e => e.action === options.action);
  }

  const total = events.length;

  // Sort by sequence descending (most recent first)
  events.sort((a, b) => b.sequence - a.sequence);

  // Apply pagination
  const offset = options.offset || 0;
  const limit = options.limit || 20;
  events = events.slice(offset, offset + limit);

  return { events, total };
}

// Get unique actions for filter dropdown
export function getAuditActions(): string[] {
  const events = loadEvents();
  const actions = new Set(events.map(e => e.action));
  return Array.from(actions).sort();
}

// Seed some sample audit events for demo purposes
export function seedAuditEvents(): void {
  const existingEvents = loadEvents();
  if (existingEvents.length > 0) return; // Don't seed if events exist

  const sampleActions = ['read', 'commit', 'push', 'deploy', 'check', 'approve', 'execute'];
  const decisions: AuditEvent['decision'][] = ['allow', 'deny', 'require_approval'];
  const agents = ['claude-code', 'dashboard', 'ci-pipeline', 'developer'];

  const events: AuditEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < 50; i++) {
    const action = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    const decision = decisions[Math.floor(Math.random() * decisions.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];

    events.push({
      id: `evt-seed-${i}`,
      sequence: i + 1,
      timestamp: new Date(now - i * 3600000).toISOString(), // Each event 1 hour apart
      action,
      decision,
      agent_id: agent,
      session_id: `session-seed-${Math.floor(i / 5)}`,
      tenant_id: 'hummbl-dashboard',
      temporal_state: 'normal',
      hash: generateHash(),
      prev_hash: i > 0 ? events[i - 1].hash : generateHash(),
    });
  }

  saveEvents(events);

  // Update chain state
  const chain = loadChain();
  chain.eventSequence = events.length;
  chain.lastEventHash = events[events.length - 1].hash;
  saveChain(chain);
}
