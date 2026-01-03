# Base120 Agent Quick Reference

**Invariant:** This repo validates artifacts about Base120 — not Base120 itself.

## Repo Identity

- **Purpose**: Artifact Validator (NOT corpus validator)
- **Version**: 1.0.0 (FROZEN)
- **Scope**: Entire repository frozen

## Two Systems — Only One Here

- ✅ **Artifact Validator**: Validates `{ id, domain, class, instance, models }`
- ❌ **Corpus Validator**: Does NOT exist here (future/separate)

## Allowed Changes

- Documentation clarifications (no semantic changes)
- Sealed canonical artifacts (with hash + MRCC)
- Tests that do not alter behavior

## Forbidden Changes

- Retroactive spec rewrites
- Validator logic changes
- Failure mode redefinitions
- Schema modifications
- Semantic-altering refactors

## Default Assumption

If uncertain → assume forbidden

## On Ambiguity

**STOP. Surface the ambiguity. Ask for governance intent.**

- Do NOT resolve by assumption
- Do NOT apply "helpful" fixes without approval
- Do NOT infer intent from context

## Prohibited Behaviors

- Treating repo as corpus validator
- Modifying frozen schemas
- Redefining failure modes
- Assuming change permission
- Resolving ambiguity without asking
- Referencing future capabilities
- Conflating Artifact/Corpus systems

## Canonical Artifacts

- Must be: normalized, SHA-256 hashed, MRCC-bound
- NOT validated by artifact validator
- Location: `/artifacts/` (NOT `/tests/corpus/`)

## Observability

- Event emission: best-effort, non-blocking
- Must NOT affect validation outcome

## Default Posture

**Prohibitive. Assume frozen. Ask before acting.**

---

Protocol: docs/protocols/base120-agent-onboarding.md
