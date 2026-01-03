# Test Corpus

**Purpose**: Synthetic test fixtures for validator testing ONLY

## Important

This directory contains **synthetic artifacts** for testing validator behavior.

- These are **NOT** canonical Base120 data
- These are **NOT** real compliance artifacts
- These fixtures are designed to exercise validator edge cases

## Contents

| Type          | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `valid/`      | Artifacts that should pass validation                  |
| `invalid/`    | Artifacts that should fail with specific failure modes |
| `edge-cases/` | Boundary condition tests                               |

## Governance

- Test fixtures may be added without governance approval
- Fixtures must not alter validator behavior
- Fixtures must be clearly synthetic (not derived from real data)

## Canonical Data Location

For canonical Base120 data, see `/artifacts/` directory.

---

*See: [docs/protocols/base120-agent-onboarding.md](../../docs/protocols/base120-agent-onboarding.md)*
