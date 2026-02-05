// humbbl/devops/agents/__tests__/validateCascadeContext.test.ts

import { validateCascadeContext } from '../validateCascadeContext';
import { CascadeAgentContext } from '../cascadeAgentContext';

describe('validateCascadeContext', () => {
  let validContext: CascadeAgentContext;

  beforeEach(() => {
    validContext = {
      agent_identity: {
        name: 'Cascade Agent',
        model: 'SWE-1',
        environment: 'Windsurf + GitHub',
        role: 'Implementation Executor',
      },
      team_structure: {
        Reuben: {
          role: 'HITL / Cognitive Engineer',
          authority_level: 'root',
          validation_scope: ['architecture', 'code_merge', 'release'],
        },
        GPT_5: {
          role: 'Advanced Reasoning Model',
          authority_level: 'senior_reasoning',
          validation_scope: ['architecture', 'logic', 'system_design'],
        },
        Claude_Sonnet_4_5: {
          role: 'Collaborative Reasoning Model',
          authority_level: 'co_reasoning',
          validation_scope: ['optimization', 'logic_verification', 'coherence'],
        },
        Cascade_Agent: {
          role: 'Implementation Executor',
          authority_level: 'execution_only',
          validation_scope: ['code_integrity', 'build_health', 'deployment_status'],
        },
      },
      operating_protocol: {
        workflow_sequence: ['plan', 'validate', 'implement', 'review', 'deploy'],
        handoff_protocol: {
          input_channels: ['Reuben', 'GPT-5', 'Claude_Sonnet_4_5'],
          payload_format: 'JSON',
          acknowledgement: {
            on_receive: 'log + confirm receipt',
            on_execute: 'commit_id + diff_summary + status_flag',
          },
          error_handling: {
            syntax_error: 'halt_and_report',
            missing_context: 'request_clarification',
            merge_conflict: 'create_patch_and_notify',
          },
        },
      },
      technical_environment: {
        languages: ['TypeScript', 'React', 'Node.js'],
        frameworks: ['Vite', 'Supabase'],
        repositories: ['GitHub'],
        tools: ['Windsurf', 'VSCode'],
      },
      telemetry: {
        tracked_metrics: ['build_integrity', 'commit_traceability', 'lint_compliance'],
        log_format: 'JSONL',
        reporting_interval: 'per_implementation_cycle',
      },
      state_flags: {
        status: 'idle',
        active_branch: null,
        last_commit: null,
        error_state: false,
      },
      version_control: {
        branch_policy: 'feature/<scope>_<ticketID>',
        commit_style: 'atomic, descriptive, lowercase',
        pr_template: 'include context, diff summary, and validation notes',
      },
      cross_agent_memory_links: {
        enabled: true,
        synchronization_model: 'event_driven + pull_on_demand',
        linked_agents: {
          GPT_5: {
            memory_reference: 'hummbl.devops.reasoning.gpt5',
            data_access: ['architecture_context'],
            refresh_rate: 'on_instruction',
          },
          Claude_Sonnet_4_5: {
            memory_reference: 'hummbl.devops.reasoning.claude_sonnet_4_5',
            data_access: ['validation_feedback'],
            refresh_rate: 'on_validation',
          },
          Reuben: {
            memory_reference: 'hummbl.devops.human_root',
            data_access: ['system_goals'],
            refresh_rate: 'manual_push',
          },
        },
        data_sync_rules: {
          integrity_check: 'sha256_hash_verification',
          conflict_resolution: 'human_override_precedence',
          logging_policy: 'full_trace_in_git_history',
        },
      },
    };
  });

  test('valid context passes validation', () => {
    const result = validateCascadeContext(validContext);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('missing critical section fails validation', () => {
    const invalid = { ...validContext, telemetry: undefined };
    const result = validateCascadeContext(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing telemetry metrics.');
  });

  test('invalid agent name triggers error', () => {
    const invalid = JSON.parse(JSON.stringify(validContext));
    invalid.agent_identity.name = 'WrongAgent';
    const result = validateCascadeContext(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid agent name.');
  });

  test('missing cross-agent link fails validation', () => {
    const invalid = JSON.parse(JSON.stringify(validContext));
    delete invalid.cross_agent_memory_links.linked_agents.Reuben;
    const result = validateCascadeContext(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing cross-agent link: Reuben');
  });
});
