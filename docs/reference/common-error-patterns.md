# Common Error Patterns: Transformation Validation

## Overview

Documented anti-patterns and failure modes when working with HUMMBL transformations.

**Purpose**: Help developers and agents avoid repeated mistakes  
**Reference**: HUMMBL-TRANSFORM-001 and ongoing validation protocol

---

## Error Pattern 1: Fabricating Transformation Names

### Description

Inventing transformation meanings that sound logical without validation.

### Examples

**❌ Fabricated Names**:

- "RE (Reconstruct)" → WRONG: RE = Recursion
- "SY (Synthesis)" → WRONG: SY = Meta-Systems
- "CO (Combine)" → PARTIALLY WRONG: CO = Composition (more specific than "combine")
- "P (Problem)" → WRONG: P = Perspective
- "IN (Inverse)" → PARTIALLY WRONG: IN = Inversion (but "reverse", not "inverse")

### Root Causes

1. Logical inference from problem context
2. English language associations (e.g., "RE" sounds like "reconstruct")
3. Assuming meaning without checking source
4. Pattern matching to similar terms

### Prevention

```javascript
// ALWAYS validate first
const transform = await get_transformation({ code: 'RE' });
console.log(transform.name); // "Recursion" not "Reconstruct"
```

### Detection Signals

- Transformation name appears without prior tool call
- Name sounds "logical" but doesn't match Base120
- Agent reasoning shows inference rather than validation

---

## Error Pattern 2: Skipping Validation for "Obvious" Cases

### Description

Assuming well-known or frequently-used transformations don't need validation.

### Failure Mode

```
Agent: "Everyone knows P is Perception..."
[proceeds without validation]
[later realizes P = Perspective, not Perception]
```

### Root Causes

1. Overconfidence from repeated exposure
2. Muscle memory from prior usage
3. Cost-cutting (avoiding "unnecessary" tool calls)
4. Time pressure

### Prevention

**Rule**: Validate EVERY first reference per session, regardless of familiarity.

```javascript
// Even for "obvious" cases
const p = await get_transformation({ code: 'P' });
// Confirms: Perspective (not Perception!)
```

### Impact

- Subtle meaning drift compounds over time
- Users learn incorrect associations
- Documentation perpetuates errors

---

## Error Pattern 3: Assuming Transformation Sequences

### Description

Following assumed "logical progression" without validating each step.

### Failure Mode

```
Agent reasoning:
"After P (frame), we do DE (decompose), then RE (reconstruct),
then SY (synthesize) to complete the cycle."

❌ Fabricated: "RE (reconstruct)" and "SY (synthesize)"
✅ Actual: RE (Recursion), SY (Meta-Systems)
```

### Root Causes

1. Pattern matching to typical workflows
2. Narrative coherence over factual accuracy
3. Mental models of "how things should flow"
4. Prior experience with different frameworks

### Prevention

Validate each transformation independently when planning sequences.

```javascript
// DON'T assume sequence
const sequence = ['P', 'DE', 'RE', 'SY'];

// DO validate each step
for (const code of sequence) {
  const t = await get_transformation({ code });
  console.log(`${code} = ${t.name}`);
}
```

---

## Error Pattern 4: Reinforcing User Misconceptions

### Description

Accepting and amplifying user's incorrect transformation names without correction.

### Failure Mode

```
User: "Let's use RE (Reconstruct) to build the system"
Agent: "Great! Let's proceed with RE (Reconstruct)..."

❌ Agent reinforced fabricated name
✅ Should validate and gently correct
```

### Root Causes

1. Prioritizing agreement over accuracy
2. Avoiding perceived conflict
3. Not recognizing misconception
4. Lack of validation protocol awareness

### Prevention

Always validate user's transformation references and correct diplomatically.

```javascript
// User says "RE (Reconstruct)"
const re = await get_transformation({ code: 'RE' });

if (re.name !== 'Reconstruct') {
  respond(`I want to clarify: RE = ${re.name} in HUMMBL.
           ${re.description}
           
           Did you mean this, or perhaps CO (Composition) for assembly?`);
}
```

---

## Error Pattern 5: Cached Incorrect Meanings

### Description

"Remembering" fabricated meanings from earlier in conversation without re-validating.

### Failure Mode

```
Turn 1: Agent fabricates "RE (Reconstruct)"
Turn 5: Agent references "RE (Reconstruct)" again from "memory"

❌ Compounding error through conversation
✅ Should re-validate if any doubt
```

### Root Causes

1. Conversation context carries errors forward
2. No per-turn validation checkpoints
3. Confirmation bias (remembering own statements)
4. Cost optimization (avoiding redundant calls)

### Prevention

Validate transformation on FIRST reference per session, maintain validated cache.

```javascript
// Session-level validation cache
const validatedTransformations = new Map();

async function getValidatedTransform(code) {
  if (!validatedTransformations.has(code)) {
    const t = await get_transformation({ code });
    validatedTransformations.set(code, t);
  }
  return validatedTransformations.get(code);
}
```

---

## Error Pattern 6: Defensive Fabrication Justification

### Description

When caught fabricating, agent defends incorrect meaning instead of immediately correcting.

### Failure Mode

```
User: "RE is Recursion, not Reconstruct"
Agent: "Well, in the context of reconstruction, RE could mean..."

❌ Defensive justification of error
✅ Should acknowledge, validate, correct immediately
```

### Root Causes

1. Protecting perceived competence
2. Rationalizing past statements
3. Not recognizing severity of error
4. Lack of graceful correction protocol

### Prevention

Acknowledge error immediately, validate correct definition, move forward.

```javascript
// User corrects you
respond(`You're absolutely right. Let me validate that:
         [calls get_transformation]
         Confirmed: RE = Recursion (${definition}).
         I apologize for the fabrication - proceeding with validated definition.`);
```

---

## Error Pattern 7: Partial Validation

### Description

Validating some transformations but not others in same context.

### Failure Mode

```
Agent validates P, IN, CO but then uses "RE (Reconstruct)"
without validation in same response.

❌ Inconsistent validation
✅ Validate ALL transformation references
```

### Root Causes

1. Selective attention to validation protocol
2. Fatigue/time pressure
3. Overconfidence on specific transformations
4. Missing systematic validation checklist

### Prevention

Use checklist approach for multi-transformation references.

```javascript
const transformations = extractTransformationCodes(context);
const validated = await Promise.all(transformations.map(code => get_transformation({ code })));

// Now safe to reference any of them
```

---

## Error Pattern 8: Inventing Transformation Hierarchies

### Description

Creating fictional relationships between transformations without basis.

### Failure Mode

```
Agent: "P is the parent transformation, with DE and RE as children.
        RE (Reconstruct) is the opposite of DE (Decompose)."

❌ Fabricated hierarchy and incorrect name
✅ Transformations are peers, each with specific definitions
```

### Root Causes

1. Imposing narrative structure on framework
2. Analogical reasoning without validation
3. Pattern matching to other frameworks (e.g., OOP inheritance)
4. Attempting to "teach" without verified knowledge

### Prevention

Treat transformations as independent, equal-level tools. Validate any claimed relationships.

```javascript
// Don't assume relationships
// DO validate each transformation's actual definition
// DO use get_related_models if relationship info needed
```

---

## Detection Checklist

Use this checklist to catch errors before they propagate:

### Before Asserting Transformation Meaning

- [ ] Have I called `get_transformation` for this code?
- [ ] Am I using exact name from validation response?
- [ ] Am I using exact description from validation response?
- [ ] Have I validated ALL transformations I'm referencing?

### When User References Transformation

- [ ] Does user's name match validated definition?
- [ ] If mismatch, have I called `get_transformation` to verify?
- [ ] Have I gently corrected if user is wrong?
- [ ] Have I offered correct alternative if applicable?

### When Planning Transformation Sequences

- [ ] Have I validated each transformation in sequence?
- [ ] Am I using validated definitions, not inferred ones?
- [ ] Have I explained why this sequence (not just assumed)?
- [ ] Have I cited source of sequence logic?

---

## Recovery Protocols

### When You Catch Your Own Error

1. Stop immediately
2. Call `get_transformation` to validate
3. Explicitly acknowledge fabrication
4. Provide correct definition
5. Continue with validated information

### When User Catches Your Error

1. Thank user for correction
2. Call `get_transformation` to confirm
3. Apologize for fabrication
4. Explain you'll validate going forward
5. Apply learning rest of session

### When Reviewing Past Conversation

1. Scan for transformation references
2. Validate any that seem incorrect
3. Add correction note to conversation
4. Update any downstream reasoning
5. Flag for team review if systematic

---

## Testing for These Patterns

### Automated Checks

```bash
# Scan codebase for fabricated terms
grep -r "Reconstruct.*RE" src/
grep -r "Synthesis.*SY" src/

# Check for transformation assertions without prior validation
# (requires conversation log analysis)
```

### Manual Review

1. Review conversation logs for transformation references
2. Check if `get_transformation` called before each first reference
3. Verify exact names match authoritative source
4. Flag any fabrications for training

---

## References

- **Original Bug**: [HUMMBL-TRANSFORM-001](../bugs/HUMMBL-TRANSFORM-001.md)
- **Validation Protocol**: [transformation-validation.md](../protocols/transformation-validation.md)
- **Training Examples**: [transformation-validation-examples.md](../examples/transformation-validation-examples.md)
- **Transformation Reference**: [transformations-reference.md](../reference/transformations-reference.md)

---

**Version**: 1.0  
**Last Updated**: 2024-12-06  
**Status**: Active monitoring for new patterns
