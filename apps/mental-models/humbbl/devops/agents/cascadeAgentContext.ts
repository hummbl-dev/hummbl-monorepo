// humbbl/devops/agents/cascadeAgentContext.ts

export interface CascadeAgentContext {
  agent_identity: {
    name: string; // "Cascade Agent"
    model: string; // "SWE-1"
    environment: string; // "Windsurf + GitHub"
    role: 'Implementation Executor';
  };

  team_structure: {
    Reuben: TeamMember;
    GPT_5: TeamMember;
    Claude_Sonnet_4_5: TeamMember;
    Cascade_Agent: TeamMember;
  };

  operating_protocol: {
    workflow_sequence: string[]; // Ordered process stages
    handoff_protocol: {
      input_channels: string[];
      payload_format: 'JSON';
      acknowledgement: {
        on_receive: string; // "log + confirm receipt"
        on_execute: string; // "commit_id + diff_summary + status_flag"
      };
      error_handling: {
        syntax_error: 'halt_and_report' | 'request_clarification';
        missing_context: 'request_clarification' | 'halt_and_report';
        merge_conflict: 'create_patch_and_notify';
      };
    };
  };

  technical_environment: {
    languages: string[];
    frameworks: string[];
    repositories: string[];
    tools: string[];
  };

  telemetry: {
    tracked_metrics: string[];
    log_format: 'JSONL';
    reporting_interval: string; // "per_implementation_cycle"
  };

  state_flags: {
    status: 'idle' | 'active' | 'paused' | 'error';
    active_branch: string | null;
    last_commit: string | null;
    error_state: boolean;
  };

  version_control: {
    branch_policy: string; // "feature/<scope>_<ticketID>"
    commit_style: string; // "atomic, descriptive, lowercase"
    pr_template: string; // "include context, diff summary, and validation notes"
  };

  cross_agent_memory_links: CrossAgentLinks;
}

export interface TeamMember {
  role: string;
  authority_level: 'root' | 'senior_reasoning' | 'co_reasoning' | 'execution_only';
  validation_scope: string[];
}

export interface CrossAgentLinks {
  enabled: boolean;
  synchronization_model: 'event_driven + pull_on_demand';
  linked_agents: {
    GPT_5: CrossAgentReference;
    Claude_Sonnet_4_5: CrossAgentReference;
    Reuben: CrossAgentReference;
  };
  data_sync_rules: {
    integrity_check: 'sha256_hash_verification';
    conflict_resolution: 'human_override_precedence';
    logging_policy: 'full_trace_in_git_history';
  };
}

export interface CrossAgentReference {
  memory_reference: string;
  data_access: string[];
  refresh_rate: 'on_instruction' | 'on_validation' | 'manual_push';
}
