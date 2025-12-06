# HUMMBL Transformations Reference

## Quick Reference Table

| Code | Name          | Description                                                         | Model Count |
| ---- | ------------- | ------------------------------------------------------------------- | ----------- |
| P    | Perspective   | Frame and name what is. Anchor or shift point of view.              | 20          |
| IN   | Inversion     | Reverse assumptions. Examine opposites, edges, negations.           | 20          |
| CO   | Composition   | Combine parts into coherent wholes.                                 | 20          |
| DE   | Decomposition | Break systems into components.                                      | 20          |
| RE   | Recursion     | Apply operations iteratively, with outputs becoming inputs.         | 20          |
| SY   | Meta-Systems  | Understand systems of systems, coordination, and emergent dynamics. | 20          |

**Total Models**: 120 across 6 transformations

---

## Detailed Transformation Definitions

### P: Perspective

**Description**: Frame and name what is. Anchor or shift point of view.

**When to use**:

- Problem framing and definition phase
- Stakeholder analysis
- Reframing stuck situations
- Identifying implicit assumptions

**Priority 1 Models**:

- P1: First Principles Framing
- P2: Stakeholder Mapping
- P4: Lens Shifting

### IN: Inversion

**Description**: Reverse assumptions. Examine opposites, edges, negations.

**When to use**:

- Stress-testing plans and assumptions
- Finding vulnerabilities before launch
- Exploring failure modes
- Challenging consensus thinking

**Priority 1 Models**:

- IN1: Subtractive Thinking
- IN2: Premortem Analysis

**Priority 2 Models**:

- IN3: Problem Reversal
- IN4: Contra-Logic
- IN7: Boundary Testing
- IN9: Backward Induction
- IN10: Red Teaming
- IN13: Opportunity Cost Focus
- IN15: Constraint Reversal

---

### CO: Composition

**Description**: Combine parts into coherent wholes.

**When to use**:

- Assembling system from components
- Creating synergies between elements
- Building platforms and interfaces
- Integrating multi-disciplinary insights

**Priority 1 Models**:

- CO1: Synergy Principle
- CO2: Chunking

**Priority 2 Models**:

- CO3: Functional Composition
- CO4: Interdisciplinary Synthesis
- CO5: Emergence
- CO7: Network Effects
- CO8: Layered Abstraction
- CO13: Cross-Domain Analogy

---

### DE: Decomposition

**Description**: Break systems into components.

**When to use**:

- Understanding complex systems
- Identifying leverage points
- Isolating constraints
- Creating modular architectures

**Priority 1 Models**:

- DE1: Root Cause Analysis (5 Whys)
- DE3: Modularization
- DE7: Pareto Decomposition (80/20)

**Priority 2 Models**:

- DE2: Factorization
- DE4: Layered Breakdown
- DE6: Taxonomy/Classification
- DE8: Work Breakdown Structure
- DE11: Scope Delimitation
- DE12: Constraint Isolation
- DE15: Decision Tree Expansion
- DE20: Partition-and-Conquer

---

### RE: Recursion

**Description**: Apply operations iteratively, with outputs becoming inputs.

**When to use**:

- Building systems that improve themselves
- Creating feedback loops
- Bootstrapping from limited resources
- Implementing compound growth strategies

**Priority 1 Models**:

- RE1: Recursive Improvement (Kaizen)
- RE2: Feedback Loops
- RE9: Iterative Prototyping

**Priority 2 Models**:

- RE3: Meta-Learning (Learn-to-Learn)
- RE8: Bootstrapping
- RE10: Compounding Cycles
- RE15: Convergence-Divergence Cycling
- RE16: Retrospective→Prospective Loop

---

### SY: Meta-Systems

**Description**: Understand systems of systems, coordination, and emergent dynamics.

**When to use**:

- Designing governance structures
- Managing complex ecosystems
- Identifying leverage points
- Coordinating multiple independent systems

**Priority 1 Models**:

- SY1: Leverage Points
- SY2: System Boundaries
- SY19: Meta-Model Selection

**Priority 2 Models**:

- SY3: Stocks & Flows
- SY5: Systems Archetypes
- SY6: Feedback Structure Mapping
- SY7: Path Dependence
- SY9: Phase Transitions & Tipping Points
- SY11: Governance Patterns
- SY13: Incentive Architecture
- SY14: Risk & Resilience Engineering
- SY18: Measurement & Telemetry

---

## Common Transformation Sequences

### Problem-Solving Flow

1. **P (Perspective)** → Frame the problem, identify stakeholders
2. **DE (Decomposition)** → Break into components, identify constraints
3. **CO (Composition)** → Assemble solution from parts
4. **RE (Recursion)** → Iterate and improve through feedback
5. **SY (Meta-Systems)** → Optimize coordination and emergence

### Risk Analysis Flow

1. **P (Perspective)** → Define boundaries and assumptions
2. **IN (Inversion)** → Premortem, identify failure modes
3. **DE (Decomposition)** → Isolate specific vulnerabilities
4. **SY (Meta-Systems)** → Design resilience mechanisms

### Innovation Flow

1. **IN (Inversion)** → Challenge assumptions, constraint reversal
2. **CO (Composition)** → Cross-domain synthesis
3. **DE (Decomposition)** → Modularize for testing
4. **RE (Recursion)** → Rapid prototyping cycles
5. **P (Perspective)** → Reframe based on learnings

### System Design Flow

1. **P (Perspective)** → First principles framing
2. **DE (Decomposition)** → Modularization, taxonomy
3. **CO (Composition)** → Interface design, integration
4. **RE (Recursion)** → Feedback loops, self-improvement
5. **SY (Meta-Systems)** → Governance, incentive architecture

---

## Validation Guidelines

### Before Referencing Transformations

**Always verify**:

- Retrieve transformation definition via `get_transformation` tool
- Confirm transformation code matches intended meaning
- Check priority models align with problem requirements

**Common errors to avoid**:

- Assuming transformation meaning without verification
- Confusing similar-sounding names (e.g., RE ≠ "Reconstruct")
- Skipping validation when transformation seems obvious

### Transformation Selection Criteria

**Choose transformation based on**:

1. **Current problem state** (framing vs analyzing vs building vs iterating)
2. **Available information** (complete data vs exploring unknowns)
3. **Desired outcome** (understanding vs solution vs optimization)
4. **Resource constraints** (time, expertise, tools)

**Fallback strategy**:

- When uncertain: Use SY19 (Meta-Model Selection)
- When stuck: Try IN (Inversion) to challenge assumptions
- When complex: Start with P (Perspective) to clarify framing

---

## Integration with HUMMBL Workflow

### Standard Protocol

```
1. FRAME: Use P models to establish perspective
2. ANALYZE: Apply DE models to decompose problem
3. TEST: Use IN models to stress-test assumptions
4. BUILD: Apply CO models to compose solution
5. ITERATE: Use RE models for continuous improvement
6. OPTIMIZE: Apply SY models for system-level coordination
```

### Flexible Application

Transformations need not be applied sequentially. Jump between transformations based on:

- Problem characteristics
- Information availability
- Decision urgency
- Team capabilities

### Documentation Requirements

When applying transformations:

- **Document** which models used and why
- **Record** assumptions and constraints
- **Track** outcomes for calibration
- **Share** learnings with team

---

## References

- **HUMMBL Base120**: Complete mental model library
- **Bug Reports**: See `docs/bugs/` for known issues
- **Improvement Proposals**: See `docs/proposals/` for enhancements
- **MCP Integration**: Transformation tools available via HUMMBL MCP server

---

**Last Updated**: 2024-12-06  
**Version**: 1.0  
**Status**: Reference document created following HUMMBL-TRANSFORM-001 bug report
