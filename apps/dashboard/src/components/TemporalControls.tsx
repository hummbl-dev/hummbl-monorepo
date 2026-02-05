import * as React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@hummbl/ui';
import {
  useDeclareFreeze,
  useLiftFreeze,
  useDeclareIncident,
  useResolveIncident,
  useGovernanceState,
} from '@/hooks/useGovernance';
import { useAuth } from '@/components/AuthGuard';
import { canPerform } from '@/lib/auth';
import { ConfirmDialog } from './ConfirmDialog';
import { Snowflake, Sun, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

type DialogType = 'freeze' | 'unfreeze' | 'incident' | 'resolve' | null;

export const TemporalControls: React.FC = () => {
  const auth = useAuth();
  const { data: state } = useGovernanceState();
  const declareFreeze = useDeclareFreeze();
  const liftFreeze = useLiftFreeze();
  const declareIncident = useDeclareIncident();
  const resolveIncident = useResolveIncident();

  const [freezeReason, setFreezeReason] = React.useState('');
  const [incidentId, setIncidentId] = React.useState('');
  const [incidentReason, setIncidentReason] = React.useState('');
  const [resolveReason, setResolveReason] = React.useState('');
  const [dialogType, setDialogType] = React.useState<DialogType>(null);

  const temporalState = state?.temporal_state ?? 'normal';
  const isLoading =
    declareFreeze.isPending ||
    liftFreeze.isPending ||
    declareIncident.isPending ||
    resolveIncident.isPending;

  const canFreeze = canPerform(auth.role, 'freeze');
  const canIncident = canPerform(auth.role, 'incident');

  const handleConfirm = () => {
    switch (dialogType) {
      case 'freeze':
        declareFreeze.mutate(freezeReason || 'Manual freeze');
        setFreezeReason('');
        break;
      case 'unfreeze':
        liftFreeze.mutate(freezeReason || 'Manual unfreeze');
        setFreezeReason('');
        break;
      case 'incident':
        declareIncident.mutate({
          incidentId: incidentId || 'INC-AUTO',
          reason: incidentReason || 'Manual incident',
        });
        setIncidentId('');
        setIncidentReason('');
        break;
      case 'resolve':
        resolveIncident.mutate(resolveReason || 'Manual resolve');
        setResolveReason('');
        break;
    }
    setDialogType(null);
  };

  const getDialogConfig = () => {
    switch (dialogType) {
      case 'freeze':
        return {
          title: 'Declare Code Freeze?',
          description:
            'This will block all mutation operations across the system. Only read operations will be allowed.',
          confirmLabel: 'Declare Freeze',
          variant: 'destructive' as const,
        };
      case 'unfreeze':
        return {
          title: 'Lift Code Freeze?',
          description: 'This will restore normal operations and allow mutations again.',
          confirmLabel: 'Lift Freeze',
          variant: 'default' as const,
        };
      case 'incident':
        return {
          title: 'Declare Incident Mode?',
          description:
            'This will enable enhanced audit logging and require incident IDs for certain operations.',
          confirmLabel: 'Declare Incident',
          variant: 'warning' as const,
        };
      case 'resolve':
        return {
          title: 'Resolve Incident?',
          description: 'This will return the system to normal operation mode.',
          confirmLabel: 'Resolve Incident',
          variant: 'default' as const,
        };
      default:
        return {
          title: '',
          description: '',
          confirmLabel: 'Confirm',
          variant: 'default' as const,
        };
    }
  };

  const dialogConfig = getDialogConfig();

  return (
    <>
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
                    onChange={e => setFreezeReason(e.target.value)}
                    disabled={!canFreeze}
                  />
                </div>
                <Button
                  onClick={() => setDialogType('freeze')}
                  disabled={isLoading || !canFreeze}
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
                {!canFreeze && <p className="text-xs text-zinc-500">Requires admin role</p>}
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-400">System is frozen. Mutations are blocked.</p>
                <Button
                  onClick={() => setDialogType('unfreeze')}
                  disabled={isLoading || !canFreeze}
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
            {declareFreeze.isError && (
              <p className="text-xs text-rose-400">{declareFreeze.error.message}</p>
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
                    onChange={e => setIncidentId(e.target.value)}
                    disabled={!canIncident}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident-reason">Reason</Label>
                  <Input
                    id="incident-reason"
                    placeholder="e.g., Production outage"
                    value={incidentReason}
                    onChange={e => setIncidentReason(e.target.value)}
                    disabled={!canIncident}
                  />
                </div>
                <Button
                  onClick={() => setDialogType('incident')}
                  disabled={isLoading || !canIncident}
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
                {!canIncident && <p className="text-xs text-zinc-500">Requires operator role</p>}
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-400">
                  Incident mode active. Enhanced audit enabled.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="resolve-reason">Resolution</Label>
                  <Input
                    id="resolve-reason"
                    placeholder="e.g., Issue fixed"
                    value={resolveReason}
                    onChange={e => setResolveReason(e.target.value)}
                    disabled={!canIncident}
                  />
                </div>
                <Button
                  onClick={() => setDialogType('resolve')}
                  disabled={isLoading || !canIncident}
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
            {declareIncident.isError && (
              <p className="text-xs text-rose-400">{declareIncident.error.message}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={dialogType !== null}
        onClose={() => setDialogType(null)}
        onConfirm={handleConfirm}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmLabel={dialogConfig.confirmLabel}
        variant={dialogConfig.variant}
        loading={isLoading}
      />
    </>
  );
};
