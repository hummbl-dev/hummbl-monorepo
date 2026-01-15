# Artifacts

**Status**: Sealed Canonical Datasets

This directory contains sealed canonical artifacts for Base120.

## Requirements

All artifacts in this directory must be:

| Requirement | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
| Normalized  | Deterministically normalized (sorted keys, consistent formatting) |
| Hashed      | SHA-256 hash recorded                                             |
| MRCC-bound  | Compliance certificate in `/compliance/`                          |

## Governance

- Artifacts are **referenced**, not interpreted
- Artifacts are **not validated** by the artifact validator
- Only sealed, governance-approved artifacts may be added

## Important

This directory is for **canonical datasets only**.

- Test fixtures belong in `/tests/corpus/`
- Generated outputs belong elsewhere

---

_See: [docs/protocols/base120-agent-onboarding.md](../docs/protocols/base120-agent-onboarding.md)_
