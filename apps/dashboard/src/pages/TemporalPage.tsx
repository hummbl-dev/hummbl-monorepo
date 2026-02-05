import * as React from 'react';
import { TemporalControls } from '@/components/TemporalControls';
import { TemporalIndicator } from '@/components/TemporalIndicator';
import { useGovernanceState, useTemporalSummary } from '@/hooks/useGovernance';
import { Card, CardHeader, CardTitle, CardContent } from '@hummbl/ui';

export const TemporalPage: React.FC = () => {
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
                <span
                  className={
                    summary.effects.blocks_mutations
                      ? 'text-rose-400 font-semibold'
                      : 'text-zinc-100'
                  }
                >
                  {summary.effects.blocks_mutations ? 'YES' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Enhanced Audit</span>
                <span
                  className={
                    summary.effects.enhanced_audit
                      ? 'text-amber-400 font-semibold'
                      : 'text-zinc-100'
                  }
                >
                  {summary.effects.enhanced_audit ? 'YES' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Requires Incident ID</span>
                <span
                  className={
                    summary.effects.requires_incident_id
                      ? 'text-orange-400 font-semibold'
                      : 'text-zinc-100'
                  }
                >
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
};
