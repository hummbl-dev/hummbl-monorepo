# HUMMBL Transformations Reference

**Version**: 1.0  
**Last Updated**: 2025-12-06  
**Purpose**: Prevent transformation misidentification (see HUMMBL-TRANSFORM-001)

## Quick Reference Table

| Code   | Name          | Description                           | Core Question                     |
| ------ | ------------- | ------------------------------------- | --------------------------------- |
| **P**  | Perspective   | Frame, name, shift POV                | "How should we view this?"        |
| **IN** | Inversion     | Reverse assumptions, work backward    | "What if the opposite were true?" |
| **CO** | Composition   | Build up, combine, integrate parts    | "How do these fit together?"      |
| **DE** | Decomposition | Break down, modularize, separate      | "What are the component parts?"   |
| **RE** | Recursion     | Self-reference, repetition, iteration | "How does this pattern repeat?"   |
| **SY** | Systems       | Meta-systems, patterns, emergence     | "What's the larger system?"       |

## Detailed Definitions

### P (Perspective)

**Purpose**: Frame, name, shift point of view  
**When to Use**: Problem framing, stakeholder analysis, reframing challenges  
**Priority Models**: P1-P20  
**Common Patterns**:

- Stakeholder mapping
- Problem redefinition
- Context shifting
- Narrative reframing

### IN (Inversion)

**Purpose**: Reverse assumptions, work backward from desired outcome  
**When to Use**: Assumption testing, reverse engineering, failure analysis  
**Priority Models**: IN1-IN20  
**Common Patterns**:

- Assumption reversal
- Backward planning
- Failure mode analysis
- Contrarian thinking

### CO (Composition)

**Purpose**: Build up, combine, integrate parts into wholes  
**When to Use**: Synthesis, integration, solution design  
**Priority Models**: CO1-CO20  
**Common Patterns**:

- Component integration
- Solution architecture
- Pattern combination
- Holistic design

### DE (Decomposition)

**Purpose**: Break down, modularize, separate into components  
**When to Use**: Complex problem analysis, system breakdown, root cause  
**Priority Models**: DE1-DE20  
**Common Patterns**:

- System breakdown
- Root cause analysis
- Component isolation
- Hierarchical analysis

### RE (Recursion)

**Purpose**: Self-reference, repetition, iterative patterns  
**When to Use**: Pattern analysis, iterative processes, self-referential systems  
**Priority Models**: RE1-RE20  
**Common Patterns**:

- Pattern recognition
- Iterative refinement
- Self-similar analysis
- Recursive problem solving

### SY (Systems)

**Purpose**: Meta-systems, patterns, emergence  
**When to Use**: System-level thinking, emergent behavior, complex dynamics  
**Priority Models**: SY1-SY20  
**Common Patterns**:

- System mapping
- Emergence analysis
- Feedback loops
- Complex dynamics

## Priority Model Listings

### Perspective (P) Priority Models

- **P1**: Frame Shifting
- **P2**: Stakeholder Mapping
- **P3**: Context Analysis
- **P4**: Narrative Reframing
- **P5**: Problem Definition

### Inversion (IN) Priority Models

- **IN1**: Assumption Reversal
- **IN2**: Backward Planning
- **IN3**: Failure Mode Analysis
- **IN4**: Contrarian Analysis
- **IN5**: Reverse Engineering

### Composition (CO) Priority Models

- **CO1**: Component Integration
- **CO2**: Solution Architecture
- **CO3**: Pattern Combination
- **CO4**: Holistic Design
- **CO5**: Synthesis Framework

### Decomposition (DE) Priority Models

- **DE1**: System Breakdown
- **DE2**: Root Cause Analysis
- **DE3**: Component Isolation
- **DE4**: Hierarchical Analysis
- **DE5**: Modular Design

### Recursion (RE) Priority Models

- **RE1**: Pattern Recognition
- **RE2**: Iterative Refinement
- **RE3**: Self-Similar Analysis
- **RE4**: Recursive Problem Solving
- **RE5**: Bootstrapping

### Systems (SY) Priority Models

- **SY1**: System Mapping
- **SY2**: Emergence Analysis
- **SY3**: Feedback Loop Analysis
- **SY4**: Complex Dynamics
- **SY5**: Meta-System Thinking

## Common Transformation Sequences

### Problem Solving Flow

1. **P** → Frame the problem
2. **DE** → Break down components
3. **IN** → Test assumptions
4. **CO** → Build solution
5. **SY** → Consider system impacts

### Innovation Flow

1. **IN** → Challenge assumptions
2. **P** → Reframe opportunity
3. **CO** → Combine novel elements
4. **RE** → Iterate and refine
5. **SY** → Scale to system level

### Analysis Flow

1. **DE** → Decompose system
2. **RE** → Identify patterns
3. **SY** → Map system dynamics
4. **P** → Shift perspective
5. **IN** → Stress test conclusions

## Validation Guidelines

### Before Using Any Transformation

1. **Verify Definition**: Check this reference document
2. **Confirm Code**: Ensure transformation code matches name
3. **Validate Context**: Confirm transformation fits problem type
4. **Check Dependencies**: Identify prerequisite transformations

### Common Errors to Avoid

- **RE ≠ Reconstruct**: RE means Recursion, not Reconstruction
- **DE ≠ Destroy**: DE means Decomposition, not destruction
- **IN ≠ Negative**: IN means Inversion, not negativity
- **SY ≠ Simplify**: SY means Systems thinking, not simplification

### Validation Checklist

- [ ] Transformation code verified against reference
- [ ] Definition matches intended use
- [ ] Priority model selected appropriately
- [ ] Sequence logic validated
- [ ] Context fit confirmed

## Integration Protocols

### MCP Server Integration

```typescript
const TRANSFORMATION_MAP = {
  P: { name: 'Perspective', description: 'Frame, name, shift POV' },
  IN: { name: 'Inversion', description: 'Reverse assumptions, work backward' },
  CO: { name: 'Composition', description: 'Build up, combine, integrate parts' },
  DE: { name: 'Decomposition', description: 'Break down, modularize, separate' },
  RE: { name: 'Recursion', description: 'Self-reference, repetition, iteration' },
  SY: { name: 'Systems', description: 'Meta-systems, patterns, emergence' },
};
```

### Agent Validation Protocol

1. Before asserting transformation meaning, reference this document
2. Use `get_transformation` tool for verification
3. Flag uncertainty when transformation meaning unclear
4. Cross-reference with priority model listings

## Usage Patterns by Problem Type

### Strategic Problems

- **Primary**: P, IN, SY
- **Secondary**: DE, CO
- **Avoid**: Over-reliance on RE without clear patterns

### Technical Problems

- **Primary**: DE, CO, RE
- **Secondary**: P, SY
- **Avoid**: IN without technical constraints

### Creative Problems

- **Primary**: P, IN, CO
- **Secondary**: RE, SY
- **Avoid**: DE without creative context

### Analytical Problems

- **Primary**: DE, RE, SY
- **Secondary**: P, IN
- **Avoid**: CO without complete analysis

## Troubleshooting

### Transformation Not Working

1. Check problem type alignment
2. Verify sequence dependencies
3. Confirm priority model selection
4. Review context fit

### Confusion Between Transformations

1. Reference quick table above
2. Review detailed definitions
3. Check common errors section
4. Validate with examples

### Sequence Issues

1. Review common sequences
2. Check logical dependencies
3. Validate problem flow
4. Consider alternative paths

---

**Related Documents**:

- Bug Report: HUMMBL-TRANSFORM-001
- Improvement Proposal: HUMMBL-TRANSFORM-VALIDATION
- Methodology Guide: HUMMBL Base120 Framework

**Maintenance**: Update when new transformations added or priority models modified
