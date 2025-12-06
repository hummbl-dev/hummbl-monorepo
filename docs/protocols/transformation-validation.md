# Transformation Validation Protocol

## Overview

This protocol prevents fabrication of HUMMBL transformation names by requiring explicit validation before asserting transformation meaning.

**Reference**: HUMMBL-TRANSFORM-001 bug report and improvement proposal

---

## Mandatory Validation Rules

### Rule 1: Always Validate Before Asserting

**NEVER** reference transformation meaning without prior validation.

```
❌ INCORRECT:
"Next step is RE (Reconstruct)..."

✅ CORRECT:
1. Call get_transformation(code="RE")
2. Verify returned definition
3. Assert: "Next step is RE (Recursion)..."
```

### Rule 2: Use Authoritative Source

The MCP server's `TRANSFORMATIONS` constant is the single source of truth.

**Transformations**:

- **P**: Perspective (Frame and name what is)
- **IN**: Inversion (Reverse assumptions, examine opposites)
- **CO**: Composition (Combine parts into coherent wholes)
- **DE**: Decomposition (Break systems into components)
- **RE**: Recursion (Apply operations iteratively, outputs→inputs)
- **SY**: Meta-Systems (Systems of systems, coordination, emergence)

### Rule 3: Validate on First Reference Per Session

When transformation referenced for first time in conversation:

1. Retrieve definition via `get_transformation`
2. Confirm code matches intended meaning
3. Proceed with validated definition

---

## Implementation Checklist

### For Agents

- [ ] Before referencing transformation by name, call `get_transformation`
- [ ] Include validation in scratchpad reasoning for non-trivial tasks
- [ ] Flag uncertainty if transformation selection unclear
- [ ] Document transformation choice with explicit justification

### For System Prompts

```markdown
## HUMMBL Transformation Validation Protocol

When selecting or referencing HUMMBL transformations:

1. **Validate first**: Use get_transformation tool to retrieve authoritative definition
2. **Never assume**: Don't infer transformation names from context or logic
3. **Cite source**: Reference transformation code + name from validation
4. **Flag uncertainty**: If transformation unclear, use SY19 (Meta-Model Selection)

Example workflow:
<scratchpad>
Need to select next transformation after Decomposition (DE).
Candidates: CO (assembly) vs RE (iteration)
VALIDATE: Calling get_transformation for both...
[tool responses]
CONFIRMED: RE = Recursion (iterative, outputs→inputs), not "Reconstruct"
</scratchpad>
```

### For Development Teams

- [ ] Add transformation map to agent initialization context
- [ ] Include validation examples in training materials
- [ ] Test against HUMMBL-TRANSFORM-001 reproduction scenario
- [ ] Update methodology docs with validation requirements

---

## Common Errors to Avoid

### Error 1: Fabricating Transformation Names

**Symptom**: Inventing transformation meanings that sound logical

```
❌ "RE stands for Reconstruct" (fabricated)
✅ "RE stands for Recursion" (validated)
```

**Prevention**: Always call `get_transformation` before asserting meaning

### Error 2: Assuming Transformation Sequence

**Symptom**: Following assumed "logical flow" without validation

```
❌ "After DE, we do RE (Reconstruct) to build system"
✅ "After DE, checking transformations... RE (Recursion) or CO (Composition)?"
```

**Prevention**: Validate each transformation independently

### Error 3: Skipping Validation for "Obvious" Cases

**Symptom**: Assuming well-known codes don't need validation

```
❌ "Everyone knows P is Perception" (assumption)
✅ [validates via tool] "Confirmed: P is Perspective" (verified)
```

**Prevention**: Validate even familiar codes

---

## Validation Workflow Examples

### Example 1: Selecting Next Transformation

**Context**: Completed DE (Decomposition), need to select next step

**Correct approach**:

```
<scratchpad>
Current: Completed DE analysis (components identified)
Next: Need to either assemble parts or iterate on them
Candidates: CO (Composition) or RE (Recursion)

VALIDATION REQUIRED - calling get_transformation for both:
</scratchpad>

[Tool call: get_transformation(code="CO")]
[Tool call: get_transformation(code="RE")]

<scratchpad>
VALIDATED:
- CO = Composition (Combine parts into coherent wholes)
- RE = Recursion (Apply operations iteratively, outputs→inputs)

DECISION: Use RE for iterative building strategy (bootstrapping)
</scratchpad>
```

### Example 2: Explaining Transformation to User

**User asks**: "What's the difference between DE and CO?"

**Correct approach**:

```
[Tool call: get_transformation(code="DE")]
[Tool call: get_transformation(code="CO")]

DE (Decomposition): Break systems into components
CO (Composition): Combine parts into coherent wholes

These are complementary transformations - DE analyzes by breaking down,
CO synthesizes by building up.
```

### Example 3: Catching Potential Error

**Scenario**: About to reference transformation meaning

**Correct approach**:

```
<scratchpad>
About to explain RE transformation to user.
CHECKPOINT: Have I validated this transformation this session?
No - calling get_transformation first...
</scratchpad>

[Tool call: get_transformation(code="RE")]

<scratchpad>
VALIDATED: RE = Recursion (not Reconstruct!)
Safe to proceed with correct definition.
</scratchpad>
```

---

## Testing & Verification

### Reproduction Test: HUMMBL-TRANSFORM-001

**Scenario**: Agent selects transformation after decomposition

**Expected behavior**:

1. Agent identifies need for next transformation
2. Agent calls `get_transformation` for candidates
3. Agent uses validated definitions in reasoning
4. Agent presents correct transformation name to user

**Failure mode** (old behavior):

1. Agent assumes transformation meaning without validation
2. Agent fabricates "RE (Reconstruct)" based on logical inference
3. User catches error
4. Agent corrects after validation

**Success criteria**:

- Zero transformation name fabrications
- All transformation references validated before assertion
- Validation visible in reasoning process (scratchpad)

### Unit Test Cases

```typescript
// Test 1: Validate transformation lookup
describe('get_transformation', () => {
  it('returns correct definition for valid code', async () => {
    const result = await getTrans formation('RE');
    expect(result.name).toBe('Recursion');
    expect(result.description).toContain('iteratively');
  });

  it('rejects invalid transformation codes', async () => {
    expect(() => getTransformation('INVALID')).toThrow();
  });
});

// Test 2: Agent validation protocol
describe('agent transformation selection', () => {
  it('validates before asserting transformation name', async () => {
    const agent = new HUMMBLAgent();
    const selection = await agent.selectTransformation('after DE');
    expect(selection.validated).toBe(true);
    expect(selection.source).toBe('get_transformation');
  });
});
```

---

## Rollout Plan

### Phase 1: Infrastructure ✅

- [x] Add transformation map to MCP server
- [x] Implement `get_transformation` tool
- [x] Document validation protocol

### Phase 2: Integration (Current)

- [ ] Update agent system prompts with validation requirements
- [ ] Add validation examples to training materials
- [ ] Test against HUMMBL-TRANSFORM-001 scenario

### Phase 3: Enforcement

- [ ] Automated validation checks in CI/CD
- [ ] Monitoring for transformation reference patterns
- [ ] Quarterly audits of agent transformation usage

---

## References

- **Bug Report**: [docs/bugs/HUMMBL-TRANSFORM-001.md](../bugs/HUMMBL-TRANSFORM-001.md)
- **Improvement Proposal**: [docs/proposals/HUMMBL-TRANSFORM-VALIDATION.md](../proposals/HUMMBL-TRANSFORM-VALIDATION.md)
- **Transformation Reference**: [docs/reference/transformations-reference.md](../reference/transformations-reference.md)
- **MCP Server Implementation**: [apps/mcp-server/src/index.ts](../../apps/mcp-server/src/index.ts)

---

**Version**: 1.0  
**Status**: Phase 1 Complete, Phase 2 In Progress  
**Last Updated**: 2024-12-06
