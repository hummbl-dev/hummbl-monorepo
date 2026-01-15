# MRCC v1.0 Reference

**Status**: REFERENCE — NOT AUTHORITATIVE  
**Canonical Definition**: Base120 governance spec

---

## Overview

MRCC (Machine-Readable Compliance Certificate) is a structured format for documenting compliance claims against validated artifacts.

This document is a **reference copy** for convenience. The canonical MRCC definition lives in the Base120 governance specification.

---

## Required Fields

| Field                | Type   | Description                                      |
| -------------------- | ------ | ------------------------------------------------ |
| `artifact_path`      | string | Path to the validated artifact                   |
| `sha256`             | string | SHA-256 hash of the artifact                     |
| `governance_version` | string | Base120 governance version (e.g., "1.0.0")       |
| `claims`             | array  | Explicit compliance claims                       |
| `non_claims`         | array  | Explicit non-claims                              |
| `timestamp`          | string | Real execution timestamp (UTC, ISO 8601)         |

---

## Example Structure

```json
{
  "mrcc_version": "1.0",
  "artifact_path": "/artifacts/example.json",
  "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "governance_version": "1.0.0",
  "claims": [
    "Schema-valid per artifact.schema.json",
    "Failure mode coverage: FM1-FM30"
  ],
  "non_claims": [
    "Does not assert semantic correctness of models",
    "Does not validate corpus completeness"
  ],
  "timestamp": "2026-01-03T00:00:00Z"
}
```

---

## Constraints

- Use MRCC v1.0 structure only
- Never invent a new compliance schema
- Timestamps must be real execution time (no placeholders)
- Claims must be explicit and verifiable
- Non-claims must be explicit to prevent assumption

---

## Usage Notes

- MRCCs are generated **after** successful artifact validation
- MRCCs are stored in `/compliance/`
- MRCCs reference artifacts, they do not embed them

---

**Reference Version**: 1.0  
**Last Updated**: 2026-01-03

*Note: This is a reference copy. Canonical MRCC definition lives in Base120 governance spec.*
