interface Agent {
  id: string;
  role: string;
}

interface Team {
  members: string[];
}

interface Telemetry {
  enabled: boolean;
  interval: number;
}

interface VCS {
  repo: string;
  branch: string;
}

export interface CascadeAgentContext {
  agent: Agent;
  team: Team;
  telemetry: Telemetry;
  vcs: VCS;
  version: string;
}

const cascadeAgentContext: CascadeAgentContext = {
  agent: { id: 'cascade-001', role: 'validator' },
  team: { members: ['gpt5', 'claude', 'cascade'] },
  telemetry: { enabled: true, interval: 5000 },
  vcs: { repo: 'hummbl-io', branch: 'main' },
  version: '1.0.0',
};

export default cascadeAgentContext;
