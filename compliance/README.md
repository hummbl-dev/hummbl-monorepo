# Compliance

This directory contains MRCCs (Machine-Readable Compliance Certificates) and compliance claims.

## Contents

| Type          | Purpose                                  |
| ------------- | ---------------------------------------- |
| `*.mrcc.json` | Machine-Readable Compliance Certificates |
| `claims/`     | Explicit compliance claims               |

## MRCC Structure (v1.0)

Each MRCC must include:

| Field                | Description                        |
| -------------------- | ---------------------------------- |
| `artifact_path`      | Path to validated artifact         |
| `sha256`             | SHA-256 hash of artifact           |
| `governance_version` | Base120 governance version (1.0.0) |
| `claims`             | Explicit compliance claims         |
| `non_claims`         | Explicit non-claims                |
| `timestamp`          | Real execution timestamp (UTC)     |

## Governance

- Use MRCC v1.0 structure only
- Never invent a new compliance schema
- Reference canonical MRCC definition in Base120 governance spec

---

_See: [docs/reference/mrcc-v1.0.md](../docs/reference/mrcc-v1.0.md)_
_See: [docs/protocols/base120-agent-onboarding.md](../docs/protocols/base120-agent-onboarding.md)_
