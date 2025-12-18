# AWSServices Validation Protocol

## Mandatory Rules

### Rule 1: Always Validate Before Asserting

Never reference awsservices concepts without validation.

### Rule 2: Use Authoritative Source

`src/definitions.ts` is the single source of truth.

### Rule 3: Document Failures

When fabrication occurs, document in `docs/bugs/`.

## Validation Workflow

1. Call `validateAWSServicesConcept(id)`
2. Verify returned definition
3. Use validated information only

## Common Errors

- Assuming concept meanings without validation
- Using outdated or cached definitions
- Fabricating relationships between concepts
