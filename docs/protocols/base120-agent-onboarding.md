# Base120 Repository — Agent Onboarding Protocol

**Version**: 1.0.0  
**Status**: Frozen  
**Scope**: Base120 Artifact Validator  
**Last Updated**: 2026-01-03

---

## 1. Repository Purpose

This repository implements the **Base120 Artifact Validator**.

### What This Repo Does

- Validates **governance and compliance artifacts**
- Enforces schema correctness, failure mode mapping, dominance rules
- Emits deterministic observability events
- Supports MRCC-style compliance workflows

### What This Repo Does NOT Do

- Does **not** validate the Base120 120-model corpus
- Does **not** assert semantic correctness of mental models
- Does **not** generate or curate the Base120 dataset

**Invariant:**

> This repo validates artifacts about Base120 — not Base120 itself.

Any reasoning that violates this invariant is incorrect.

---

## 2. Canonical Systems Distinction

Two systems exist. Only one is implemented here.

### System A — Artifact Validator (THIS REPO)

| Property      | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Input         | Generic artifacts: `{ id, domain, class, instance, models }` |
| Schema        | `schemas/v1.0.0/artifact.schema.json`                        |
| Failure Modes | FM1–FM30                                                     |
| Status        | **Canonical, frozen, audit-clean**                           |

### System B — Corpus Validator (DOES NOT EXIST HERE)

| Property | Value                                                                                   |
| -------- | --------------------------------------------------------------------------------------- |
| Input    | Base120 corpus: `{ schema_version, base120_version, canonical, model_count, models[] }` |
| Status   | Conceptual / future / separate project                                                  |

⚠️ **Never conflate these systems.**

---

## 3. Governance Rules

### Version Status

- **Base120 v1.0.0 is frozen**
- No behavior changes permitted
- No schema changes permitted
- No failure mode changes permitted
- Frozen semantics apply to the **entire repository**

### Allowed Changes

| Change Type                                          | Permitted |
| ---------------------------------------------------- | --------- |
| Documentation clarifications (no semantic changes)   | ✅        |
| Addition of sealed canonical artifacts (hash + MRCC) | ✅        |
| Test additions that do not alter behavior            | ✅        |

### Forbidden Changes

| Change Type                              | Permitted |
| ---------------------------------------- | --------- |
| Retroactive spec rewrites                | ❌        |
| Validator logic changes                  | ❌        |
| Failure mode redefinitions               | ❌        |
| Schema modifications                     | ❌        |
| "Helpful" refactors that alter semantics | ❌        |

**Default assumption**: If uncertain whether a change is allowed → **assume forbidden**.

---

## 4. Canonical Artifact Handling

Canonical artifacts (e.g., Base120 seed JSON) are **sealed datasets**.

### Requirements

| Requirement   | Description                                   |
| ------------- | --------------------------------------------- |
| Normalization | Deterministically normalized                  |
| Integrity     | SHA-256 hashed                                |
| Governance    | MRCC-bound                                    |
| Validation    | NOT validated by the artifact validator       |
| Location      | Must live outside /tests/corpus               |

Canonical artifacts are **referenced**, not interpreted.

---

## 5. Directory Semantics

```text
/schemas/        → JSON Schemas (frozen)
/validators/     → Validation logic (frozen)
/registries/     → Failure mode + error mappings (frozen)
/tests/corpus/   → Validator test fixtures ONLY
/artifacts/      → Sealed canonical datasets
/compliance/     → MRCCs and compliance claims
/docs/           → Specifications and governance docs
```

⚠️ `/tests/corpus` is **not** a data repository. It contains synthetic test fixtures only.

---

## 6. Testing Philosophy

- Tests validate **validator behavior**, not domain truth
- Corpus tests use **synthetic artifacts**
- Observability tests ensure:
  - Event emission correctness
  - Failure isolation
  - Backward compatibility

No test may attempt to validate "Base120 itself."

---

## 7. Observability Contract

Validation may emit events. Event emission must:

| Constraint    | Description                      |
| ------------- | -------------------------------- |
| Non-affecting | Never affect validation outcome  |
| Non-raising   | Never raise upstream exceptions  |
| Deterministic | Deterministic in structure       |

Observability is **best-effort, non-blocking**.

---

## 8. MRCC Expectations

When generating an MRCC (Machine-Readable Compliance Certificate):

### Required Fields

| Field                | Description                        |
| -------------------- | ---------------------------------- |
| `artifact_path`      | Path to validated artifact         |
| `sha256`             | SHA-256 hash of artifact           |
| `governance_version` | Base120 governance version (1.0.0) |
| `claims`             | Explicit compliance claims         |
| `non_claims`         | Explicit non-claims                |
| `timestamp`          | Real execution timestamp (UTC)     |

### Constraints

- Use MRCC v1.0 structure only
- Never invent a new compliance schema
- Reference canonical MRCC definition in Base120 governance spec

---

## 9. Mandatory Clarification Behavior

When an agent encounters:

- Apparent spec/implementation mismatch
- Conflicting semantics
- Ambiguous terminology
- Uncertainty about permitted changes

**Required action:**

> **STOP. Surface the ambiguity. Ask for governance intent.**

Do **not** resolve ambiguity by assumption.  
Do **not** apply "helpful" fixes without explicit approval.  
Do **not** infer intent from context.

---

## 10. Prohibited Agent Behaviors

| Behavior                                 | Status    |
| ---------------------------------------- | --------- |
| Treating this repo as a corpus validator | Forbidden |
| Modifying frozen schemas                 | Forbidden |
| Redefining failure modes                 | Forbidden |
| Assuming change permission               | Forbidden |
| Resolving ambiguity without asking       | Forbidden |
| Referencing future capabilities          | Forbidden |
| Conflating Artifact/Corpus systems       | Forbidden |

---

## 11. Summary

**One-line mental model for agents:**

> This repo validates artifacts about Base120 — not Base120 itself.

**Default posture:** Prohibitive. Assume frozen. Ask before acting.

---

## References

- Agent Policy: [.github/agent-policy.yaml](../../.github/agent-policy.yaml)
- Quick Reference: [docs/AGENTS.md](../AGENTS.md)
- MRCC Reference: [docs/reference/mrcc-v1.0.md](../reference/mrcc-v1.0.md)

---

**Protocol Version**: 1.0.0  
**Status**: Frozen  
**Effective Date**: 2026-01-03
