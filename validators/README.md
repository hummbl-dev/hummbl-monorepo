# Validators

**Status**: Frozen (v1.0.0)

This directory contains validation logic for Base120 artifacts.

## Purpose

- Enforce schema correctness against `/schemas/`
- Map validation failures to failure modes (FM1-FM30)
- Emit deterministic observability events

## Governance

- All validation logic in this directory is **frozen**
- No behavior changes permitted without governance approval
- Validator output must be deterministic

## Relationship to Other Directories

| Directory        | Relationship                                 |
| ---------------- | -------------------------------------------- |
| `/schemas/`      | Validators reference frozen schemas          |
| `/registries/`   | Validators emit registered failure modes     |
| `/tests/corpus/` | Validators tested against synthetic fixtures |

---

_See: [docs/protocols/base120-agent-onboarding.md](../docs/protocols/base120-agent-onboarding.md)_
