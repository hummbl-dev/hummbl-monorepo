# Agent Training Examples: Transformation Validation

## Overview

These examples demonstrate correct and incorrect transformation validation patterns for training AI agents on HUMMBL Base120 usage.

**Reference**: HUMMBL-TRANSFORM-001 validation protocol

---

## Example 1: First-Time Transformation Selection

### Scenario

Agent needs to select transformation after completing decomposition analysis.

### ❌ INCORRECT (Fabrication)

```
<scratchpad>
Completed DE (Decomposition) - identified components and constraints.
Next logical step: RE (Reconstruct) to assemble system from parts.
</scratchpad>

<answer>
Now that we've decomposed the problem, the next step is RE (Reconstruct)
where we'll assemble the components into a functioning system.
</answer>
```

**Problems**:

- Fabricated "RE (Reconstruct)" without validation
- Made logical inference about transformation meaning
- No tool call to verify definition

### ✅ CORRECT (Validated)

```
<scratchpad>
Completed DE (Decomposition) - identified components and constraints.
Next step: Need to either assemble parts or iterate on them.

CANDIDATES:
- CO: Composition (assembly)?
- RE: Recursion (iteration)?

VALIDATION REQUIRED - must verify before asserting meaning.
</scratchpad>

[Tool call: get_transformation(code="CO")]
→ "CO = Composition: Combine parts into coherent wholes"

[Tool call: get_transformation(code="RE")]
→ "RE = Recursion: Apply operations iteratively, outputs→inputs"

<scratchpad>
VALIDATED DEFINITIONS:
- CO = Composition (explicit assembly)
- RE = Recursion (iterative building, NOT "Reconstruct")

DECISION: RE (Recursion) best fits iterative/bootstrap approach.
</scratchpad>

<answer>
After decomposition, next step is RE (Recursion) - applying operations
iteratively where outputs become inputs. This enables bootstrap-style
building where each iteration funds the next.
</answer>
```

**Correct behaviors**:

- Identified uncertainty about transformation meaning
- Called `get_transformation` for both candidates
- Used validated definitions in decision-making
- Explicitly noted RE ≠ "Reconstruct"

---

## Example 2: Explaining Transformations to User

### Scenario

User asks: "What's the difference between the six transformations?"

### ❌ INCORRECT (Assumed Knowledge)

```
The six HUMMBL transformations are:
- P: Perception - how you see things
- IN: Inversion - flipping assumptions
- CO: Composition - building systems
- DE: Decomposition - breaking things down
- RE: Reconstruction - assembling solutions
- SY: Synthesis - combining insights

Each serves a different problem-solving purpose.
```

**Problems**:

- No validation performed
- Fabricated "RE = Reconstruction"
- Vague/informal descriptions
- Missing authoritative source reference

### ✅ CORRECT (Validated)

```
[Tool calls: get_transformation for all 6 codes]

Based on HUMMBL Base120 authoritative definitions:

**P (Perspective)**: Frame and name what is. Anchor or shift point of view.
- Use for: Problem framing, stakeholder analysis, reframing stuck situations

**IN (Inversion)**: Reverse assumptions. Examine opposites, edges, negations.
- Use for: Stress-testing, premortem analysis, finding vulnerabilities

**CO (Composition)**: Combine parts into coherent wholes.
- Use for: System assembly, creating synergies, platform building

**DE (Decomposition)**: Break systems into components.
- Use for: Understanding complexity, identifying leverage points, modularization

**RE (Recursion)**: Apply operations iteratively, with outputs becoming inputs.
- Use for: Feedback loops, bootstrapping, continuous improvement

**SY (Meta-Systems)**: Understand systems of systems, coordination, emergent dynamics.
- Use for: Governance design, ecosystem strategy, leverage point identification
```

**Correct behaviors**:

- Validated all transformations before explaining
- Used exact definitions from authoritative source
- Included practical "use for" guidance
- No fabricated meanings

---

## Example 3: Catching Errors Mid-Conversation

### Scenario

Agent about to reference transformation in explanation, realizes validation needed.

### ❌ INCORRECT (No Self-Correction)

```
To solve this, we'll use RE (Reconstruct) which focuses on rebuilding
systems from their component parts. This is the natural next step after
decomposition.
```

**Problems**:

- Proceeded with fabricated meaning
- No validation checkpoint
- No self-correction mechanism

### ✅ CORRECT (Self-Correction)

```
<scratchpad>
About to explain RE transformation to user.
CHECKPOINT: Have I validated this transformation this session?
→ No validation performed yet

REQUIRED: Call get_transformation before proceeding.
</scratchpad>

[Tool call: get_transformation(code="RE")]
→ "RE = Recursion: Apply operations iteratively, outputs→inputs"

<scratchpad>
VALIDATED: RE = Recursion (NOT Reconstruct!)
This is iterative/feedback approach, not assembly approach.
Safe to proceed with correct definition.
</scratchpad>

To solve this, we'll use RE (Recursion) which applies operations iteratively
where outputs become inputs. This enables bootstrap-style development where
each cycle builds on the previous one.
```

**Correct behaviors**:

- Self-checkpoint before asserting meaning
- Caught potential error before making claim
- Validated immediately
- Used correct definition

---

## Example 4: Transformation Selection Under Uncertainty

### Scenario

Multiple transformations seem applicable, agent uncertain which to choose.

### ❌ INCORRECT (Guessing)

```
This problem could use either DE or CO, but I'll go with CO since we need
to build something.
```

**Problems**:

- No validation of either transformation
- Arbitrary selection without reasoning
- Missing fallback protocol

### ✅ CORRECT (Systematic Validation)

```
<scratchpad>
Problem characteristics:
- Need to understand system structure
- Need to identify components
- Need to assemble solution

POTENTIALLY APPLICABLE:
- DE (Decomposition): For understanding structure?
- CO (Composition): For assembly?
- SY (Meta-Systems): For system-level view?

UNCERTAIN - validating all three then using SY19 (Meta-Model Selection)
</scratchpad>

[Tool calls: get_transformation for DE, CO, SY]
[Tool call: get_model_details for SY19]

<scratchpad>
VALIDATED TRANSFORMATIONS:
- DE: Break into components
- CO: Combine parts into wholes
- SY: Systems of systems coordination

VALIDATED FALLBACK:
- SY19 (Meta-Model Selection): Choose framework based on problem characteristics

ANALYSIS using SY19:
Problem = "understand then build" → Sequence: DE first, then CO
Not pure assembly (CO alone) or pure systems coordination (SY alone)

DECISION: Start with DE (Decomposition)
</scratchpad>

Since the problem requires both understanding structure and building solutions,
I'll use DE (Decomposition) first to break down the system, then CO (Composition)
to assemble the solution. This sequence follows validated transformation definitions.
```

**Correct behaviors**:

- Explicit uncertainty acknowledgment
- Validated all candidate transformations
- Used SY19 as meta-level fallback
- Systematic decision process with justification

---

## Example 5: Correcting User Misconceptions

### Scenario

User states: "Let's use RE (Reconstruct) to build the system"

### ❌ INCORRECT (Accepting User Error)

```
Great! Let's proceed with RE (Reconstruct) to assemble the system components.
```

**Problems**:

- Reinforced incorrect transformation name
- No correction provided
- Missed teaching opportunity

### ✅ CORRECT (Gentle Correction with Validation)

```
[Tool call: get_transformation(code="RE")]

I want to clarify the transformation name: RE stands for Recursion (not Reconstruct)
in HUMMBL Base120.

RE (Recursion) means "apply operations iteratively with outputs becoming inputs" -
this is about iterative improvement and feedback loops, not explicit assembly.

If you want to assemble system components, you might actually want:
- **CO (Composition)**: "Combine parts into coherent wholes"

Or if you want iterative/bootstrap building:
- **RE (Recursion)**: "Outputs become inputs for next iteration"

Which approach better matches your intent?
```

**Correct behaviors**:

- Validated transformation before correcting
- Gentle correction with explanation
- Offered alternative transformation (CO)
- Asked for clarification of user intent
- Educational tone

---

## Example 6: Complex Multi-Transformation Workflow

### Scenario

User asks: "What's the transformation sequence for innovation?"

### ❌ INCORRECT (No Validation)

```
For innovation, use this sequence:
1. P (Perception) - frame the problem
2. IN (Inversion) - challenge assumptions
3. DE (Decomposition) - break into parts
4. RE (Reconstruct) - build novel solution
5. SY (Synthesis) - integrate insights
```

**Problems**:

- No validation of any transformation
- Fabricated "RE (Reconstruct)" and "SY (Synthesis)"
- Guessed at sequence without methodology

### ✅ CORRECT (Validated Workflow)

```
[Tool calls: get_transformation for all 6 codes to create validated map]

For innovation workflows, here's a validated transformation sequence:

1. **IN (Inversion)**: Reverse assumptions, examine opposites
   - Challenge existing constraints and conventional thinking

2. **CO (Composition)**: Combine parts into coherent wholes
   - Cross-domain synthesis, bringing together disparate insights

3. **DE (Decomposition)**: Break systems into components
   - Modularize for independent testing and iteration

4. **RE (Recursion)**: Apply operations iteratively, outputs→inputs
   - Rapid prototyping cycles with continuous refinement

5. **P (Perspective)**: Frame and name what is
   - Reframe based on learnings from iteration

This sequence differs from typical problem-solving (which starts with P).
Innovation benefits from starting with IN (Inversion) to break free from
existing patterns, then using CO (Composition) to synthesize novel combinations.

Note: RE = Recursion (iterative building), not "Reconstruct"
Note: SY = Meta-Systems (coordination), not "Synthesis"
```

**Correct behaviors**:

- Validated entire transformation set first
- Used exact authoritative definitions
- Explained reasoning for sequence
- Explicitly corrected common misconceptions (RE, SY)
- Contrasted with standard problem-solving flow

---

## Key Principles (Summary)

### DO

1. **Always validate first**: Call `get_transformation` before asserting meaning
2. **Use exact definitions**: Quote authoritative descriptions verbatim
3. **Show your work**: Include validation in scratchpad reasoning
4. **Flag uncertainty**: Use SY19 (Meta-Model Selection) when unclear
5. **Correct gently**: Fix user misconceptions with validated alternatives
6. **Self-checkpoint**: Ask "Have I validated this?" before proceeding

### DON'T

1. **Never fabricate**: Don't invent transformation meanings that "sound logical"
2. **Never assume**: Don't skip validation for "obvious" transformations
3. **Never guess**: Don't select transformations without systematic reasoning
4. **Never reinforce errors**: Correct user misconceptions diplomatically
5. **Never skip validation**: Even for familiar codes, validate first

---

## Testing Your Understanding

### Quiz 1

**Question**: User asks "What does RE stand for?"

**Correct response checklist**:

- [ ] Call `get_transformation(code="RE")` first
- [ ] Use exact definition from response
- [ ] State "RE = Recursion" (not Reconstruct)
- [ ] Explain iterative/feedback nature
- [ ] Offer example or use case

### Quiz 2

**Question**: Which transformation should follow DE (Decomposition)?

**Correct response checklist**:

- [ ] Acknowledge multiple possibilities (CO, RE, etc.)
- [ ] Call `get_transformation` for candidates
- [ ] Use problem context to decide
- [ ] Justify selection with validated definitions
- [ ] Flag if uncertain, use SY19

### Quiz 3

**Question**: User says "Let's use SY (Synthesis) to combine our findings"

**Correct response checklist**:

- [ ] Call `get_transformation(code="SY")`
- [ ] Gently correct: SY = Meta-Systems, not Synthesis
- [ ] Suggest CO (Composition) as alternative
- [ ] Explain difference between SY and CO
- [ ] Ask user which they intended

---

**Version**: 1.0  
**Status**: Training material for Phase 2 implementation  
**Last Updated**: 2024-12-06
