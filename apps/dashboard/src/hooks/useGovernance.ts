import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  getAuditLog,
  getAuditActions,
  seedAuditEvents,
  type AuditLogOptions,
} from '@/lib/governance-mock';
import { useAuth } from '@/components/AuthGuard';
import { logDashboardAction, canPerform } from '@/lib/auth';
import { validateReason, validateIncidentId, validateAction } from '@/lib/validation';

// Query keys
export const governanceKeys = {
  all: ['governance'] as const,
  state: () => [...governanceKeys.all, 'state'] as const,
  temporal: () => [...governanceKeys.all, 'temporal'] as const,
  chain: () => [...governanceKeys.all, 'chain'] as const,
  presets: () => [...governanceKeys.all, 'presets'] as const,
  audit: (options?: AuditLogOptions) => [...governanceKeys.all, 'audit', options] as const,
  auditActions: () => [...governanceKeys.all, 'auditActions'] as const,
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
    staleTime: Infinity,
  });
}

// Freeze mutation with validation and audit
export function useDeclareFreeze() {
  const queryClient = useQueryClient();
  const auth = useAuth();

  return useMutation({
    mutationFn: async (reason: string) => {
      // Authorization check
      if (!canPerform(auth.role, 'freeze')) {
        throw new Error('Insufficient permissions to declare freeze');
      }

      // Validate input
      const validatedReason = validateReason(reason);

      // Audit log
      logDashboardAction('declareFreeze', { reason: validatedReason }, auth);

      return declareFreeze(validatedReason);
    },
    onSuccess: () => {
      toast.success('Code freeze declared', {
        description: 'All mutation operations are now blocked',
      });
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
    },
    onError: (error: Error) => {
      toast.error('Failed to declare freeze', {
        description: error.message,
      });
    },
  });
}

// Unfreeze mutation
export function useLiftFreeze() {
  const queryClient = useQueryClient();
  const auth = useAuth();

  return useMutation({
    mutationFn: async (reason: string) => {
      if (!canPerform(auth.role, 'unfreeze')) {
        throw new Error('Insufficient permissions to lift freeze');
      }

      const validatedReason = validateReason(reason);
      logDashboardAction('liftFreeze', { reason: validatedReason }, auth);

      return liftFreeze(validatedReason);
    },
    onSuccess: () => {
      toast.success('Freeze lifted', {
        description: 'System returned to normal operation',
      });
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
    },
    onError: (error: Error) => {
      toast.error('Failed to lift freeze', {
        description: error.message,
      });
    },
  });
}

// Incident mutation
export function useDeclareIncident() {
  const queryClient = useQueryClient();
  const auth = useAuth();

  return useMutation({
    mutationFn: async ({ incidentId, reason }: { incidentId: string; reason: string }) => {
      if (!canPerform(auth.role, 'incident')) {
        throw new Error('Insufficient permissions to declare incident');
      }

      const validatedId = validateIncidentId(incidentId);
      const validatedReason = validateReason(reason);

      logDashboardAction('declareIncident', { incidentId: validatedId, reason: validatedReason }, auth);

      return declareIncident(validatedId, validatedReason);
    },
    onSuccess: (_data, variables) => {
      toast.warning('Incident declared', {
        description: `Incident ${variables.incidentId.toUpperCase()} is now active`,
      });
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
    },
    onError: (error: Error) => {
      toast.error('Failed to declare incident', {
        description: error.message,
      });
    },
  });
}

// Resolve incident mutation
export function useResolveIncident() {
  const queryClient = useQueryClient();
  const auth = useAuth();

  return useMutation({
    mutationFn: async (reason: string) => {
      if (!canPerform(auth.role, 'resolve')) {
        throw new Error('Insufficient permissions to resolve incident');
      }

      const validatedReason = validateReason(reason);
      logDashboardAction('resolveIncident', { reason: validatedReason }, auth);

      return resolveIncident(validatedReason);
    },
    onSuccess: () => {
      toast.success('Incident resolved', {
        description: 'System returned to normal operation',
      });
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
    },
    onError: (error: Error) => {
      toast.error('Failed to resolve incident', {
        description: error.message,
      });
    },
  });
}

// Check governance mutation
export function useCheckGovernance() {
  const auth = useAuth();

  return useMutation({
    mutationFn: async (request: { action: string; command?: string }) => {
      if (!canPerform(auth.role, 'check')) {
        throw new Error('Insufficient permissions to check governance');
      }

      const validatedAction = validateAction(request.action);
      const state = getGovernanceState();

      logDashboardAction('checkGovernance', { action: validatedAction, command: request.command }, auth);

      return checkGovernance({
        tenant_id: state.tenant_id,
        agent_id: 'dashboard',
        session_id: generateSessionId(),
        action: validatedAction,
        command: request.command,
      });
    },
  });
}

// Audit log query
export function useAuditLog(options: AuditLogOptions = {}) {
  // Seed sample events on first load
  seedAuditEvents();

  return useQuery({
    queryKey: governanceKeys.audit(options),
    queryFn: () => getAuditLog(options),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Audit actions for filter dropdown
export function useAuditActions() {
  return useQuery({
    queryKey: governanceKeys.auditActions(),
    queryFn: getAuditActions,
    staleTime: 60000, // Cache for 1 minute
  });
}
