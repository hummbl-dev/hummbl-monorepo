#!/usr/bin/env node

/**
 * AI-Native Documentation Template Generator
 *
 * Scaffolds a new AI-native documentation system for any domain
 */

const fs = require('fs');
const path = require('path');

function generateTemplate(domainName, outputDir) {
  const templates = {
    'README.md': `# ${domainName} - AI-Native Documentation

## Validation Protocol

**CRITICAL**: Always validate ${domainName.toLowerCase()} references before asserting.

### Usage Pattern
\`\`\`typescript
// ❌ INCORRECT - Fabricating meaning
"${domainName} concept X means..."

// ✅ CORRECT - Validated first
const concept = await validate${domainName}Concept('X');
// Use validated definition
\`\`\`

## Authoritative Source

All ${domainName.toLowerCase()} definitions are maintained in \`src/definitions.ts\`.

## Validation Tools

- \`validate${domainName}Concept(id)\` - Validate concept definitions
- \`search${domainName}(query)\` - Search with validation
- \`get${domainName}Details(id)\` - Get full validated details
`,

    'src/definitions.ts': `/**
 * ${domainName} Authoritative Definitions
 * 
 * Single source of truth for all ${domainName.toLowerCase()} concepts
 */

export interface ${domainName}Concept {
  id: string;
  name: string;
  definition: string;
  category: string;
  validation: {
    lastUpdated: string;
    source: string;
  };
}

export const ${domainName.toUpperCase()}_CONCEPTS: Record<string, ${domainName}Concept> = {
  // Add your domain concepts here
  EXAMPLE_001: {
    id: 'EXAMPLE_001',
    name: 'Example Concept',
    definition: 'This is an example concept definition',
    category: 'core',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative'
    }
  }
};

export function validate${domainName}Concept(id: string): ${domainName}Concept | null {
  return ${domainName.toUpperCase()}_CONCEPTS[id] || null;
}

export function search${domainName}(query: string): ${domainName}Concept[] {
  return Object.values(${domainName.toUpperCase()}_CONCEPTS)
    .filter(concept => 
      concept.name.toLowerCase().includes(query.toLowerCase()) ||
      concept.definition.toLowerCase().includes(query.toLowerCase())
    );
}
`,

    'docs/protocols/validation.md': `# ${domainName} Validation Protocol

## Mandatory Rules

### Rule 1: Always Validate Before Asserting
Never reference ${domainName.toLowerCase()} concepts without validation.

### Rule 2: Use Authoritative Source
\`src/definitions.ts\` is the single source of truth.

### Rule 3: Document Failures
When fabrication occurs, document in \`docs/bugs/\`.

## Validation Workflow

1. Call \`validate${domainName}Concept(id)\`
2. Verify returned definition
3. Use validated information only

## Common Errors

- Assuming concept meanings without validation
- Using outdated or cached definitions
- Fabricating relationships between concepts
`,

    'docs/examples/correct-usage.md': `# ${domainName} Usage Examples

## ✅ Correct Patterns

\`\`\`typescript
// Validate before using
const concept = validate${domainName}Concept('EXAMPLE_001');
if (concept) {
  console.log(\`\${concept.name}: \${concept.definition}\`);
}

// Search with validation
const results = search${domainName}('example');
results.forEach(concept => {
  // All results are pre-validated
  console.log(concept.definition);
});
\`\`\`

## ❌ Incorrect Patterns

\`\`\`typescript
// DON'T fabricate meanings
console.log("EXAMPLE_001 means something I think it means");

// DON'T skip validation
const concept = ${domainName.toUpperCase()}_CONCEPTS['EXAMPLE_001']; // Direct access
\`\`\`
`,

    'docs/bugs/fabrication-001.md': `# ${domainName} Fabrication Bug Report

## Issue
AI agent fabricated meaning for ${domainName.toLowerCase()} concept without validation.

## Root Cause
Agent assumed concept meaning instead of calling validation function.

## Fix
Implemented mandatory validation protocol.

## Prevention
- Always call validation functions
- Document this failure pattern
- Test against fabrication scenarios
`,

    'tests/validation.test.ts': `import { validate${domainName}Concept, search${domainName} } from '../src/definitions';

describe('${domainName} Validation', () => {
  test('validates known concepts', () => {
    const concept = validate${domainName}Concept('EXAMPLE_001');
    expect(concept).toBeDefined();
    expect(concept?.name).toBe('Example Concept');
  });

  test('rejects unknown concepts', () => {
    const concept = validate${domainName}Concept('FAKE_CONCEPT');
    expect(concept).toBeNull();
  });

  test('search returns validated results', () => {
    const results = search${domainName}('example');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(concept => {
      expect(concept.validation.source).toBe('authoritative');
    });
  });
});
`,
  };

  try {
    // Create directory structure
    const dirs = ['', 'src', 'docs', 'docs/protocols', 'docs/examples', 'docs/bugs', 'tests'];

    dirs.forEach(dir => {
      const fullPath = path.join(outputDir, dir);
      try {
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      } catch (error) {
        throw new Error(`Failed to create directory ${fullPath}: ${error.message}`);
      }
    });

    // Write template files
    Object.entries(templates).forEach(([filename, content]) => {
      const fullPath = path.join(outputDir, filename);
      try {
        fs.writeFileSync(fullPath, content);
      } catch (error) {
        throw new Error(`Failed to write file ${fullPath}: ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`❌ Template generation failed: ${error.message}`);
    throw error;
  }

  console.log(`✅ AI-Native Documentation template generated for ${domainName}`);
  console.log(`📁 Location: ${outputDir}`);
  console.log(`🚀 Next: Customize src/definitions.ts with your domain concepts`);
}

// CLI usage
if (require.main === module) {
  const [, , domainName, outputDir] = process.argv;

  if (!domainName || !outputDir) {
    console.log('Usage: node template-generator.js <DomainName> <output-directory>');
    console.log('Example: node template-generator.js LegalFramework ./legal-docs');
    process.exit(1);
  }

  try {
    generateTemplate(domainName, outputDir);
  } catch (error) {
    console.error(`❌ Failed to generate template: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generateTemplate };
