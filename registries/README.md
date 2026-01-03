# Registries

**Status**: Frozen (v1.0.0)

This directory contains failure mode and error mappings for Base120 validation.

## Contents

| Registry             | Purpose                             |
| -------------------- | ----------------------------------- |
| `failure-modes.json` | FM1-FM30 failure mode definitions   |
| `error-codes.json`   | Error code to failure mode mappings |

## Failure Modes

The artifact validator uses 30 registered failure modes (FM1-FM30) to categorize validation errors.

## Governance

- All registries in this directory are **frozen**
- No failure mode redefinitions permitted
- Adding new failure modes requires governance approval and version bump

## Usage

Validators reference these registries when emitting validation failures.

---

_See: [docs/protocols/base120-agent-onboarding.md](../docs/protocols/base120-agent-onboarding.md)_
