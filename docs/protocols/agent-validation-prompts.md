# Agent Validation Protocol Mandates

**Version**: 1.0  
**Date**: 2025-12-06  
**Purpose**: Prevent transformation fabrications via mandatory validation

## System Prompt Additions

Add to all agent system prompts working with HUMMBL transformations:

```
## HUMMBL Transformation Validation Protocol (MANDATORY)

Before asserting ANY transformation meaning or name, you MUST:
1. Call get_transformation with the transformation code
2. Use ONLY the authoritative definition returned
3. Never assume or infer transformation meanings

CRITICAL: This prevents transformation fabrications (see HUMMBL-TRANSFORM-001).

Example:
WRONG: "RE means Reconstruct"
RIGHT: get_transformation("RE") → "RE means Recursion"

Available codes: P, IN, CO, DE, RE, SY
```

## Agent Behavior Rules

### Before Transformation Assertions

1. **Always validate** with `get_transformation(code)`
2. **Use exact definition** from tool response
3. **Quote the response** when explaining transformations
4. **Flag uncertainty** if tool response unclear

### When Referencing Transformations

- Use format: "TRANSFORMATION: {name} ({code})"
- Include brief definition from tool response
- Reference validation protocol when explaining

### Error Recovery

- If transformation meaning uncertain → call `get_transformation`
- If user challenges assertion → re-validate with tool
- If multiple interpretations → clarify with tool response

## Implementation Checklist

- [ ] Add validation protocol to system prompts
- [ ] Train agents on mandatory validation flow
- [ ] Monitor for transformation fabrications
- [ ] Log validation calls for audit trail
- [ ] Update error handling for validation failures

## Monitoring Metrics

- Validation call frequency: Should be 100% for transformation references
- Fabrication incidents: Target 0%
- User challenges: Should decrease with validation
- Tool response accuracy: Should be 100%

---

**Related**: HUMMBL-TRANSFORM-001 bug report and fix documentation
