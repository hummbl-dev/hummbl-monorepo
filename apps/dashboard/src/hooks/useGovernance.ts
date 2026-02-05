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
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
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
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
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
      queryClient.invalidateQueries({ queryKey: governanceKeys.state() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.temporal() });
      queryClient.invalidateQueries({ queryKey: governanceKeys.chain() });
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
