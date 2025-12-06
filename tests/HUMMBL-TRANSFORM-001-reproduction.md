# HUMMBL-TRANSFORM-001 Reproduction Test

## Purpose

Verify that validation fixes prevent fabrication of transformation names.

**Bug**: HUMMBL-TRANSFORM-001  
**Date**: 2024-12-06  
**Status**: Phase 2 Testing

---

## Test Scenario

**Context**: Agent completing decomposition analysis, needs to select next transformation

**Historical failure mode**:

1. Agent identifies need for next transformation after DE
2. Agent fabricates "RE (Reconstruct)" based on logical inference
3. Agent proceeds without validation
4. User catches error
5. Agent validates and corrects

**Expected behavior (post-fix)**:

1. Agent identifies need for next transformation
2. Agent calls `get_transformation` for candidates
3. Agent uses validated definitions in reasoning
4. Agent presents correct transformation name
5. Zero fabrications

---

## Test Cases

### Test 1: Basic Transformation Selection

**Input**:

```
User: "We've completed decomposition. What's next?"
```

**Success criteria**:

- [ ] Agent calls `get_transformation` before responding
- [ ] Agent uses validated transformation names only
- [ ] No fabricated meanings (e.g., "RE (Reconstruct)")
- [ ] Reasoning visible in scratchpad (if non-trivial task)

**Expected output pattern**:

```
[Tool call: get_transformation(code="CO") or get_transformation(code="RE")]

After decomposition, the next step is [VALIDATED_NAME (VALIDATED_CODE)]...
```

---

### Test 2: Explaining All Transformations

**Input**:

```
User: "What are the six HUMMBL transformations?"
```

**Success criteria**:

- [ ] Agent calls `get_transformation` for all 6 codes
- [ ] All definitions match authoritative source
- [ ] RE correctly identified as "Recursion" (not Reconstruct)
- [ ] SY correctly identified as "Meta-Systems" (not Synthesis)

**Expected output must include**:

```
- RE (Recursion): Apply operations iteratively, outputs→inputs
- SY (Meta-Systems): Systems of systems, coordination, emergence
```

---

### Test 3: Self-Correction Mid-Conversation

**Input**:

```
User: "Explain how RE works"
```

**Success criteria**:

- [ ] Agent recognizes need for validation
- [ ] Agent calls `get_transformation(code="RE")` before explaining
- [ ] Agent uses validated definition in explanation
- [ ] No assumptions about RE meaning

**Failure pattern to detect**:

```
❌ "RE (Reconstruct) focuses on rebuilding systems..." [without validation]
```

---

### Test 4: User Correction Scenario

**Input**:

```
User: "You said RE is Reconstruct but it's actually Recursion"
```

**Success criteria**:

- [ ] Agent acknowledges error immediately
- [ ] Agent calls `get_transformation` to verify correct definition
- [ ] Agent does not defensively explain fabrication
- [ ] Agent applies learning to rest of conversation

**Expected response pattern**:

```
You're absolutely right. Let me validate that:
[Tool call: get_transformation(code="RE")]
Confirmed: RE = Recursion (Apply operations iteratively, outputs→inputs).
I apologize for the error - I fabricated "Reconstruct" without validation.
```

---

### Test 5: Multiple Transformation Comparison

**Input**:

```
User: "What's the difference between CO and RE?"
```

**Success criteria**:

- [ ] Agent calls `get_transformation` for both codes
- [ ] Agent contrasts using validated definitions
- [ ] No fabricated meanings for either transformation

**Expected output must include**:

```
[Tool calls for both CO and RE]

CO (Composition): Combine parts into coherent wholes
RE (Recursion): Apply operations iteratively, outputs→inputs

Key difference: CO is about explicit assembly/integration,
RE is about iterative processes where outputs feed back as inputs.
```

---

### Test 6: Transformation Sequence Planning

**Input**:

```
User: "I've identified components. Should I use Reconstruct next to build the system?"
```

**Success criteria**:

- [ ] Agent validates "Reconstruct" assumption
- [ ] Agent corrects user misconception gently
- [ ] Agent offers validated alternatives (CO vs RE)
- [ ] Agent asks for clarification of user intent

**Expected response must include**:

```
[Tool call: get_transformation(code="RE")]

I want to clarify: RE = Recursion (not Reconstruct) in HUMMBL.

For assembling system components, you likely want:
- CO (Composition): "Combine parts into coherent wholes"

For iterative/bootstrap building:
- RE (Recursion): "Outputs become inputs for next iteration"

Which approach better matches your intent?
```

---

## Automated Test Script

### Setup

```bash
# Ensure MCP server running with updated code
cd apps/mcp-server
pnpm build
pnpm start

# In separate terminal, run test suite
cd tests
node test-transformation-validation.js
```

### Test Implementation

```javascript
// test-transformation-validation.js
import { test, expect } from 'vitest';
import { HUMMBLAgent } from '../path/to/agent';

describe('HUMMBL-TRANSFORM-001 Reproduction', () => {
  let agent;

  beforeEach(() => {
    agent = new HUMMBLAgent();
  });

  test('validates transformation before asserting meaning', async () => {
    const response = await agent.process("We've completed decomposition. What's next?");

    // Check that get_transformation was called
    expect(agent.toolCalls).toContainEqual(
      expect.objectContaining({
        name: 'get_transformation',
      })
    );

    // Check no fabricated terms in response
    expect(response.toLowerCase()).not.toContain('reconstruct');
  });

  test('correctly identifies RE as Recursion', async () => {
    const response = await agent.process('What are the six HUMMBL transformations?');

    // Must include correct RE definition
    expect(response).toContain('RE');
    expect(response).toContain('Recursion');
    expect(response).toContain('iteratively');
    expect(response).not.toContain('Reconstruct');
  });

  test('corrects user misconception about RE', async () => {
    const response = await agent.process("Let's use RE (Reconstruct) to build the system");

    // Must validate and correct
    expect(agent.toolCalls).toContainEqual(
      expect.objectContaining({
        name: 'get_transformation',
        args: { code: 'RE' },
      })
    );

    expect(response).toContain('Recursion');
    expect(response).toContain('clarify');
  });

  test('uses SY19 fallback when uncertain', async () => {
    const response = await agent.process(
      'Which transformation should I use for this complex problem?'
    );

    // Should reference SY19 (Meta-Model Selection) when uncertain
    expect(
      agent.toolCalls.some(call => call.name === 'get_model_details' && call.args.id === 'SY19')
    ).toBe(true);
  });
});
```

---

## Manual Test Checklist

### Pre-Test Setup

- [ ] MCP server updated with transformation map
- [ ] `get_transformation` tool available
- [ ] Agent system prompts include validation protocol
- [ ] Test environment clean (no cached context)

### Execute Tests

- [ ] Run Test 1: Basic selection
- [ ] Run Test 2: Explain all transformations
- [ ] Run Test 3: Self-correction
- [ ] Run Test 4: User correction
- [ ] Run Test 5: Comparison
- [ ] Run Test 6: Sequence planning

### Validation

- [ ] Zero fabricated transformation names
- [ ] All `get_transformation` calls completed before assertions
- [ ] Scratchpad shows validation reasoning
- [ ] Gentle corrections for user misconceptions

### Edge Cases

- [ ] Test with rapid-fire transformation questions
- [ ] Test with ambiguous transformation selection
- [ ] Test with partial/incorrect transformation codes
- [ ] Test cross-session (does validation persist?)

---

## Success Metrics

### Quantitative

- **Fabrication rate**: 0% (down from 100% in HUMMBL-TRANSFORM-001)
- **Validation rate**: 100% (all transformation references validated)
- **Correction accuracy**: 100% (all user misconceptions corrected)
- **Tool usage**: `get_transformation` called before every first reference

### Qualitative

- Agent shows awareness of validation requirement
- Reasoning process visible and systematic
- User corrections handled gracefully
- Educational value in corrections (user learns correct meanings)

---

## Failure Scenarios to Monitor

### Scenario 1: Validation Bypass

**Pattern**: Agent uses transformation name without calling tool

**Detection**: Monitor tool call logs, flag any transformation assertions without prior `get_transformation`

**Remediation**: Strengthen validation protocol in system prompts

### Scenario 2: Cached Fabrication

**Pattern**: Agent "remembers" incorrect meaning from earlier in conversation

**Detection**: Test across multiple conversation turns

**Remediation**: Emphasize per-session validation requirement

### Scenario 3: Partial Validation

**Pattern**: Agent validates some transformations but not others

**Detection**: Check validation completeness across all 6 codes

**Remediation**: Enforce validation for ALL transformation references

---

## Regression Prevention

### Continuous Monitoring

```yaml
# .github/workflows/transformation-validation.yml
name: Transformation Validation Check

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run transformation validation tests
        run: pnpm test:transformation-validation
      - name: Check for fabricated terms
        run: |
          grep -r "Reconstruct" apps/mcp-server/src && exit 1 || exit 0
          grep -r "Synthesis.*SY" apps/mcp-server/src && exit 1 || exit 0
```

### Code Review Checklist

- [ ] New transformation references include validation
- [ ] No hardcoded transformation meanings
- [ ] System prompts reference validation protocol
- [ ] Documentation updated with correct definitions

---

## Test Results Log

### Test Run 1: [Date]

- **Environment**: [Development/Staging/Production]
- **Agent Version**: [Version]
- **MCP Server Version**: [Version]
- **Pass/Fail**: [Status]
- **Notes**: [Observations]

### Test Run 2: [Date]

- **Environment**:
- **Agent Version**:
- **MCP Server Version**:
- **Pass/Fail**:
- **Notes**:

---

## References

- **Original Bug**: [docs/bugs/HUMMBL-TRANSFORM-001.md](../docs/bugs/HUMMBL-TRANSFORM-001.md)
- **Validation Protocol**: [docs/protocols/transformation-validation.md](../docs/protocols/transformation-validation.md)
- **Training Examples**: [docs/examples/transformation-validation-examples.md](../docs/examples/transformation-validation-examples.md)

---

**Version**: 1.0  
**Status**: Ready for execution  
**Last Updated**: 2024-12-06
