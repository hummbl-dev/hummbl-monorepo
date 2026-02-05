import * as React from 'react';
import { cn } from '@hummbl/ui';

type TemporalState = 'normal' | 'maintenance' | 'incident' | 'freeze';

const stateConfig: Record<
  TemporalState,
  { color: string; label: string; bg: string; dot: string }
> = {
  normal: {
    color: 'text-emerald-400',
    label: 'Normal',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-400',
  },
  maintenance: {
    color: 'text-amber-400',
    label: 'Maintenance',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-400',
  },
  incident: {
    color: 'text-orange-400',
    label: 'Incident',
    bg: 'bg-orange-500/10',
    dot: 'bg-orange-400',
  },
  freeze: {
    color: 'text-rose-400',
    label: 'Freeze',
    bg: 'bg-rose-500/10',
    dot: 'bg-rose-400',
  },
};

interface TemporalIndicatorProps {
  state: TemporalState;
  reason?: string | null;
  className?: string;
}

export const TemporalIndicator: React.FC<TemporalIndicatorProps> = ({
  state,
  reason,
  className,
}) => {
  const config = stateConfig[state] || stateConfig.normal;

  return (
    <div className={cn('rounded-lg p-4', config.bg, className)}>
      <div className="flex items-center gap-2">
        <div className={cn('h-3 w-3 rounded-full animate-pulse', config.dot)} />
        <span className={cn('text-lg font-semibold', config.color)}>{config.label}</span>
      </div>
      {reason && <p className="mt-1 text-sm text-zinc-400">{reason}</p>}
    </div>
  );
};
