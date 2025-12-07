import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the authoritative map manually for the test expectation
const EXPECTED_TRANSFORMATIONS = {
  P: {
    name: 'Perspective',
    description: 'Frame and name what is. Anchor or shift point of view.',
  },
  IN: {
    name: 'Inversion',
    description: 'Reverse assumptions. Examine opposites, edges, negations.',
  },
  CO: {
    name: 'Composition',
    description: 'Combine parts into coherent wholes.',
  },
  DE: {
    name: 'Decomposition',
    description: 'Break systems into components.',
  },
  RE: {
    name: 'Recursion',
    description: 'Apply operations iteratively, with outputs becoming inputs.',
  },
  SY: {
    name: 'Meta-Systems',
    description: 'Understand systems of systems, coordination, and emergent dynamics.',
  },
};

describe('Regression: HUMMBL-TRANSFORM-001', () => {
    // We are reading the source file of the MCP server to verify it contains the correct Definitions.
    const serverPath = path.resolve(__dirname, '../apps/mcp-server/src/index.ts');
    const serverCode = fs.readFileSync(serverPath, 'utf8');

    describe('Source of Truth Verification', () => {
        it('should contain the TRANSFORMATIONS constant', () => {
             assert.ok(serverCode.includes('const TRANSFORMATIONS = {'));
        });

        // Test each Critical Definition
        Object.entries(EXPECTED_TRANSFORMATIONS).forEach(([code, def]) => {
             it(`should define ${code} as ${def.name}`, () => {
                  // Relaxed regex to handle whitespace/newlines
                  const nameRegex = new RegExp(`code: '${code}'[\\s\\S]*?name: '${def.name}'`);
                  assert.match(serverCode, nameRegex);
             });

             it(`should NOT define ${code} incorrectly`, () => {
                 if (code === 'RE') {
                     // The critical bug: RE != Reconstruct
                     const bugPattern = new RegExp(`code: 'RE'[\\s\\S]*?name: 'Reconstruct'`);
                     assert.doesNotMatch(serverCode, bugPattern);
                 }
             });
        });
    });

    describe('Tool Implementation Verification', () => {
         it('should implement get_transformation tool handler', () => {
             assert.ok(serverCode.includes("request.params.name === 'get_transformation'"));
         });

         it('should validate tool description warns against fabrication', () => {
             assert.ok(serverCode.includes("Prevents fabrication of transformation names"));
             assert.ok(serverCode.includes("ALWAYS use this to validate"));
         });
    });
});
