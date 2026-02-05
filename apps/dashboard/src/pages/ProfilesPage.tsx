import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@hummbl/ui';
import { usePresets, useGovernanceState } from '@/hooks/useGovernance';
import { type GovernanceProfile } from '@/lib/governance-mock';
import { Shield, Eye, Lock, FileCheck, Check, Loader2 } from 'lucide-react';

const AUDIT_LEVELS = ['none', 'basic', 'full', 'signed'] as const;
const SEPARATION_LEVELS = ['none', 'propose_only', 'review_required', 'full_split'] as const;

const auditDescriptions: Record<string, string> = {
  none: 'No audit logging',
  basic: 'Log decisions only',
  full: 'Log decisions with context',
  signed: 'Cryptographically signed audit trail',
};

const separationDescriptions: Record<string, string> = {
  none: 'Single agent can perform all actions',
  propose_only: 'Agent proposes, human reviews',
  review_required: 'Requires peer review before execution',
  full_split: 'Full separation of duties (propose/review/approve)',
};

const getLevelColor = (level: number, max: number) => {
  const ratio = level / max;
  if (ratio <= 0.25) return 'bg-zinc-600';
  if (ratio <= 0.5) return 'bg-amber-500';
  if (ratio <= 0.75) return 'bg-emerald-500';
  return 'bg-blue-500';
};

interface ProfileCardProps {
  name: string;
  profile: GovernanceProfile;
  isActive: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, profile, isActive }) => {
  const auditLevel = AUDIT_LEVELS.indexOf(profile.audit);
  const separationLevel = SEPARATION_LEVELS.indexOf(profile.separation);

  return (
    <Card className={isActive ? 'ring-2 ring-emerald-500' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-zinc-400" />
            <span className="capitalize">{name}</span>
          </CardTitle>
          {isActive && (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">
              <Check className="h-3 w-3" />
              Active
            </span>
          )}
        </div>
        <CardDescription>
          {name === 'flow' && 'Minimal governance for rapid iteration'}
          {name === 'balanced' && 'Good balance of speed and control'}
          {name === 'strict' && 'High security with full audit trail'}
          {name === 'enterprise' && 'Enterprise-grade with maximum controls'}
          {name === 'minimal' && 'Almost no restrictions'}
          {name === 'development' && 'Optimized for development workflows'}
          {name === 'production' && 'Production-ready security controls'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audit Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <Eye className="h-4 w-4" />
              Audit Level
            </span>
            <span className="font-mono text-zinc-200">{profile.audit}</span>
          </div>
          <div className="flex gap-1">
            {AUDIT_LEVELS.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${i <= auditLevel ? getLevelColor(auditLevel, AUDIT_LEVELS.length - 1) : 'bg-zinc-800'}`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500">{auditDescriptions[profile.audit]}</p>
        </div>

        {/* Separation Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <Lock className="h-4 w-4" />
              Separation
            </span>
            <span className="font-mono text-zinc-200">{profile.separation.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex gap-1">
            {SEPARATION_LEVELS.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${i <= separationLevel ? getLevelColor(separationLevel, SEPARATION_LEVELS.length - 1) : 'bg-zinc-800'}`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500">{separationDescriptions[profile.separation]}</p>
        </div>

        {/* Data Classes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <FileCheck className="h-4 w-4" />
            Data Classes
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.dataClass.map((cls) => (
              <span
                key={cls}
                className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProfilesPage: React.FC = () => {
  const { data: presets, isLoading: presetsLoading } = usePresets();
  const { data: state, isLoading: stateLoading } = useGovernanceState();

  if (presetsLoading || stateLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!presets) {
    return (
      <div className="text-center py-12 text-zinc-500">Failed to load profiles</div>
    );
  }

  // Determine active profile by comparing with current state
  const activeProfile = state?.active_profile;
  const findActivePreset = () => {
    if (!activeProfile) return null;
    return Object.entries(presets).find(
      ([_, profile]) =>
        profile.audit === activeProfile.audit &&
        profile.separation === activeProfile.separation
    )?.[0];
  };

  const activePresetName = findActivePreset();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Governance Profiles</h2>
        <p className="text-zinc-500">Compare and understand governance presets</p>
      </div>

      {/* Comparison Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            Profile Comparison Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Profile</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Audit</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Separation</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Data Classes</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(presets).map(([name, profile]) => (
                  <tr key={name} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 px-2">
                      <span className="font-medium text-zinc-200 capitalize">{name}</span>
                    </td>
                    <td className="py-3 px-2">
                      <code className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                        {profile.audit}
                      </code>
                    </td>
                    <td className="py-3 px-2">
                      <code className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                        {profile.separation.replace(/_/g, ' ')}
                      </code>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-zinc-400">{profile.dataClass.join(', ')}</span>
                    </td>
                    <td className="py-3 px-2">
                      {name === activePresetName ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Profile Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(presets).map(([name, profile]) => (
          <ProfileCard
            key={name}
            name={name}
            profile={profile}
            isActive={name === activePresetName}
          />
        ))}
      </div>
    </div>
  );
};
