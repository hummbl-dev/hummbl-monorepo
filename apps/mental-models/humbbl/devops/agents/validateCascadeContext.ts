// humbbl/devops/agents/validateCascadeContext.ts

import { CascadeAgentContext } from './cascadeAgentContext';

/**
 * Validates a given memory object against the CascadeAgentContext schema.
 * Ensures all required fields exist and contain valid structural data.
 */

export function validateCascadeContext(obj: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!obj) {
    errors.push('Context object is null or undefined.');
    return { valid: false, errors };
  }

  // --- Core identity checks ---
  const ai = obj.agent_identity;
  if (!ai) errors.push('Missing agent_identity section.');
  else {
    if (ai.name !== 'Cascade Agent') errors.push('Invalid agent name.');
    if (ai.role !== 'Implementation Executor') errors.push('Invalid role assignment.');
    if (!ai.model || !ai.environment) errors.push('Missing model or environment.');
  }

  // --- Team structure checks ---
  const ts = obj.team_structure;
  if (!ts) errors.push('Missing team_structure section.');
  else {
    const members = ['Reuben', 'GPT_5', 'Claude_Sonnet_4_5', 'Cascade_Agent'];
    for (const m of members) {
      if (!ts[m]) errors.push(`Missing team member: ${m}`);
    }
  }

  // --- Operating protocol ---
  const op = obj.operating_protocol;
  if (!op?.workflow_sequence?.length) errors.push('Missing workflow_sequence.');
  if (!op?.handoff_protocol?.input_channels?.length)
    errors.push('Missing handoff_protocol input_channels.');

  // --- Technical environment ---
  const te = obj.technical_environment;
  if (!te?.languages?.length) errors.push('Missing technical_environment languages.');
  if (!te?.frameworks?.length) errors.push('Missing frameworks list.');

  // --- Telemetry ---
  const tm = obj.telemetry;
  if (!tm?.tracked_metrics?.length) errors.push('Missing telemetry metrics.');

  // --- Version control ---
  const vc = obj.version_control;
  if (!vc?.branch_policy || !vc?.commit_style) errors.push('Incomplete version_control data.');

  // --- Cross-agent links ---
  const cl = obj.cross_agent_memory_links;
  if (!cl?.enabled) errors.push('Cross-agent memory links disabled or undefined.');
  else {
    const expected = ['GPT_5', 'Claude_Sonnet_4_5', 'Reuben'];
    for (const k of expected) {
      if (!cl.linked_agents?.[k]) errors.push(`Missing cross-agent link: ${k}`);
    }
  }

  const valid = errors.length === 0;
  return { valid, errors };
}

/**
 * Example usage:
 *
 * import { validateCascadeContext } from "./validateCascadeContext";
 * import cascadeContextData from "./cascadeAgentContextData.json";
 *
 * const result = validateCascadeContext(cascadeContextData);
 * if (!result.valid) {
 *   console.error("Invalid context schema:", result.errors);
 *   process.exit(1);
 * }
 */
