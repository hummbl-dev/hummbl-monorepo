import * as React from 'react';
import { StatusPanel } from '@/components/StatusPanel';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Governance Overview</h2>
        <p className="text-zinc-500">Monitor and control agent governance state</p>
      </div>

      <StatusPanel />
    </div>
  );
};
