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

// Storage keys
const STORAGE_KEYS = {
  state: 'governance_state',
  chain: 'governance_chain',
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

function incrementChain(): void {
  const chain = loadChain();
  chain.eventSequence++;
  chain.lastEventHash = generateHash();
  saveChain(chain);
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
    enterprise: { audit: 'signed', separation: 'full_split', dataClass: ['internal', 'confidential', 'restricted'] },
    minimal: { audit: 'none', separation: 'none', dataClass: ['public'] },
    development: { audit: 'basic', separation: 'none', dataClass: ['internal'] },
    production: { audit: 'full', separation: 'review_required', dataClass: ['internal', 'confidential'] },
  };
}

export function declareFreeze(reason: string): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'freeze';
  state.temporal_reason = reason;
  saveState(state);
  incrementChain();
  return { success: true, new_state: 'freeze' };
}

export function liftFreeze(reason: string): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'normal';
  state.temporal_reason = reason;
  saveState(state);
  incrementChain();
  return { success: true, new_state: 'normal' };
}

export function declareIncident(incidentId: string, reason: string): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'incident';
  state.temporal_reason = `[${incidentId}] ${reason}`;
  saveState(state);
  incrementChain();
  return { success: true, new_state: 'incident' };
}

export function resolveIncident(reason: string): { success: boolean; new_state: string } {
  const state = loadState();
  state.temporal_state = 'normal';
  state.temporal_reason = reason;
  saveState(state);
  incrementChain();
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

  // Check temporal state restrictions
  if (state.temporal_state === 'freeze') {
    const readActions = ['read', 'view', 'check'];
    if (!readActions.includes(request.action)) {
      return { decision: 'deny', message: 'System is frozen. Only read actions allowed.' };
    }
  }

  if (state.temporal_state === 'incident') {
    const restrictedActions = ['deploy', 'schema_change', 'delete'];
    if (restrictedActions.includes(request.action)) {
      return { decision: 'require_approval', message: 'Incident mode requires approval for destructive actions.' };
    }
  }

  return { decision: 'allow', message: 'Action permitted' };
}
