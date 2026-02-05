import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '@hummbl/ui';
import { useCheckGovernance, useGovernanceState } from '@/hooks/useGovernance';
import { TemporalIndicator } from '@/components/TemporalIndicator';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  GitCommit,
  Upload,
  Rocket,
  Trash2,
  Database,
  ThumbsUp,
  Play,
} from 'lucide-react';

const QUICK_ACTIONS = [
  { action: 'read', label: 'Read', icon: FileText, description: 'Read files or data' },
  { action: 'commit', label: 'Commit', icon: GitCommit, description: 'Commit code changes' },
  { action: 'push', label: 'Push', icon: Upload, description: 'Push to remote' },
  { action: 'deploy', label: 'Deploy', icon: Rocket, description: 'Deploy to environment' },
  { action: 'delete', label: 'Delete', icon: Trash2, description: 'Delete resources' },
  {
    action: 'schema_change',
    label: 'Schema',
    icon: Database,
    description: 'Modify database schema',
  },
  { action: 'approve', label: 'Approve', icon: ThumbsUp, description: 'Approve pending action' },
  { action: 'execute', label: 'Execute', icon: Play, description: 'Execute command' },
];

interface CheckResult {
  decision: 'allow' | 'deny' | 'require_approval';
  message: string;
  action: string;
  timestamp: string;
}

export const CheckerPage: React.FC = () => {
  const { data: state } = useGovernanceState();
  const checkMutation = useCheckGovernance();

  const [customAction, setCustomAction] = React.useState('');
  const [customCommand, setCustomCommand] = React.useState('');
  const [results, setResults] = React.useState<CheckResult[]>([]);

  const handleCheck = async (action: string, command?: string) => {
    try {
      const result = await checkMutation.mutateAsync({ action, command });
      setResults(prev => [
        {
          decision: result.decision,
          message: result.message,
          action,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9), // Keep last 10 results
      ]);
    } catch (error) {
      setResults(prev => [
        {
          decision: 'deny',
          message: error instanceof Error ? error.message : 'Check failed',
          action,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleCustomCheck = () => {
    if (customAction.trim()) {
      handleCheck(customAction.trim(), customCommand.trim() || undefined);
      setCustomAction('');
      setCustomCommand('');
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'allow':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'deny':
        return <XCircle className="h-5 w-5 text-rose-400" />;
      case 'require_approval':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return null;
    }
  };

  const getDecisionBg = (decision: string) => {
    switch (decision) {
      case 'allow':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'deny':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'require_approval':
        return 'bg-amber-500/10 border-amber-500/20';
      default:
        return 'bg-zinc-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Action Checker</h2>
        <p className="text-zinc-500">
          Test if actions are permitted under current governance state
        </p>
      </div>

      {/* Current State Context */}
      {state && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Current Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <TemporalIndicator
                state={state.temporal_state}
                reason={state.temporal_reason}
                className="flex-1"
              />
              <div className="text-sm text-zinc-400">
                <p>
                  Audit: <span className="text-zinc-200">{state.active_profile.audit}</span>
                </p>
                <p>
                  Separation:{' '}
                  <span className="text-zinc-200">{state.active_profile.separation}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Check Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(item => (
              <Button
                key={item.action}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => handleCheck(item.action)}
                disabled={checkMutation.isPending}
              >
                <item.icon className="h-5 w-5 text-zinc-400" />
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-zinc-500">{item.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Check */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="custom-action">Action</Label>
              <Input
                id="custom-action"
                placeholder="e.g., deploy, execute, approve"
                value={customAction}
                onChange={e => setCustomAction(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomCheck()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-command">Command (optional)</Label>
              <Input
                id="custom-command"
                placeholder="e.g., git push origin main"
                value={customCommand}
                onChange={e => setCustomCommand(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomCheck()}
              />
            </div>
          </div>
          <Button
            onClick={handleCustomCheck}
            disabled={!customAction.trim() || checkMutation.isPending}
          >
            {checkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Check Permission
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Results</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setResults([])}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, i) => (
                <div
                  key={`${result.timestamp}-${i}`}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${getDecisionBg(result.decision)}`}
                >
                  {getDecisionIcon(result.decision)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-zinc-800 text-zinc-200 text-sm">
                        {result.action}
                      </code>
                      <span className="text-xs text-zinc-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-300">{result.message}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      result.decision === 'allow'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : result.decision === 'deny'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {result.decision.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-zinc-500">
            The checker tests actions against the current governance policy. Results depend on:
          </p>
          <ul className="mt-2 text-sm text-zinc-500 list-disc list-inside space-y-1">
            <li>Temporal state (normal, freeze, incident, maintenance)</li>
            <li>Active profile settings (audit level, separation of duties)</li>
            <li>Action type and any associated command</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
