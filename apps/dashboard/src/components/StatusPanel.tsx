import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@hummbl/ui';
import { useGovernanceState, useChainState } from '@/hooks/useGovernance';
import { TemporalIndicator } from './TemporalIndicator';
import { Loader2 } from 'lucide-react';

export const StatusPanel: React.FC = () => {
  const { data: state, isLoading: stateLoading } = useGovernanceState();
  const { data: chain, isLoading: chainLoading } = useChainState();

  if (stateLoading || chainLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" role="status" />
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
          <CardTitle className="text-sm font-medium text-zinc-400">Temporal State</CardTitle>
        </CardHeader>
        <CardContent>
          <TemporalIndicator state={state.temporal_state} reason={state.temporal_reason} />
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">Active Profile</CardTitle>
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
          <CardTitle className="text-sm font-medium text-zinc-400">Audit Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Sequence</span>
              <span className="font-mono text-zinc-100">{chain?.eventSequence ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Last Hash</span>
              <span
                className="font-mono text-zinc-100 truncate max-w-32"
                title={chain?.lastEventHash}
              >
                {chain?.lastEventHash?.substring(0, 12)}...
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
};
