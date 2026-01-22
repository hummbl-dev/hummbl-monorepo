export function validateCascadeContext(obj: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (!obj) {
    return { valid: false, errors: ['Context object is null or undefined'] };
  }

  // Check for required fields
  const requiredFields = ['agent', 'team', 'telemetry', 'vcs', 'version'];
  for (const field of requiredFields) {
    if (!(field in obj)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check agent structure
  if (obj.agent) {
    if (!obj.agent.id || typeof obj.agent.id !== 'string') {
      errors.push('agent.id must be a non-empty string');
    }
    if (!obj.agent.role || typeof obj.agent.role !== 'string') {
      errors.push('agent.role must be a non-empty string');
    }
  }

  // Check team structure
  if (obj.team) {
    if (!Array.isArray(obj.team.members) || obj.team.members.length === 0) {
      errors.push('team.members must be a non-empty array');
    } else {
      for (const member of obj.team.members) {
        if (typeof member !== 'string') {
          errors.push('All team.members must be strings');
          break;
        }
      }
    }
  }

  // Check telemetry
  if (obj.telemetry) {
    if (typeof obj.telemetry.enabled !== 'boolean') {
      errors.push('telemetry.enabled must be a boolean');
    }
    if (typeof obj.telemetry.interval !== 'number' || obj.telemetry.interval <= 0) {
      errors.push('telemetry.interval must be a positive number');
    }
  }

  // Check VCS
  if (obj.vcs) {
    if (!obj.vcs.repo || typeof obj.vcs.repo !== 'string') {
      errors.push('vcs.repo must be a non-empty string');
    }
    if (!obj.vcs.branch || typeof obj.vcs.branch !== 'string') {
      errors.push('vcs.branch must be a non-empty string');
    }
  }

  // Check version
  if (!obj.version || typeof obj.version !== 'string') {
    errors.push('version must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default validateCascadeContext;
