import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { allModels, ModelMetadata, getModelById } from './model-metadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const ROOT_DIR = join(__dirname, '..');
const OUTPUT_FILE = join(ROOT_DIR, 'MODELS_REFERENCE.md');

// Category metadata
const CATEGORIES = [
  {
    id: 'perspective',
    name: 'Perspective',
    description: 'Models for viewing situations from different angles and perspectives.',
    models: allModels.filter(m => m.category === 'perspective')
  },
  {
    id: 'inversion',
    name: 'Inversion',
    description: 'Models for thinking backwards or considering the opposite of what you want.',
    models: allModels.filter(m => m.category === 'inversion')
  },
  // Add other categories as needed
];

// Generate markdown for a single model
function generateModelSection(model: ModelMetadata): string {
  return `### ${model.id.toUpperCase()}: ${model.name}

${model.description}

**Model Code:** ${model.id.toUpperCase()}  
**Model Name:** ${model.name}  
**Transformation:** ${model.category.charAt(0).toUpperCase() + model.category.slice(1)}  
**Tier:** ${model.tier}

**Usage:**

\`\`\`typescript
import { create${model.id.charAt(0).toUpperCase() + model.id.slice(1)}Model } from './${model.id}';

const model = create${model.id.charAt(0).toUpperCase() + model.id.slice(1)}Model({
  // Configuration options
});
\`\`\`
`;
}

// Generate the complete documentation
function generateDocumentation(): string {
  let markdown = `# HUMMBL Base120 Models Reference

This document provides a comprehensive reference for all 120 mental models in the HUMMBL framework, organized by category.

## Table of Contents
`;

  // Add table of contents
  for (const category of CATEGORIES) {
    markdown += `- [${category.name} Models (${category.id.toUpperCase()}1-${category.id.toUpperCase()}20)](#${category.id}-models-${category.id}1-${category.id}20)\n`;
  }

  // Add content for each category
  for (const category of CATEGORIES) {
    markdown += `\n## ${category.name} Models (${category.id.toUpperCase()}1-${category.id.toUpperCase()}20)\n\n${category.description}\n`;
    
    // Add models for this category
    for (const model of category.models) {
      markdown += '\n' + generateModelSection(model) + '\n';
    }
  }

  return markdown;
}

// Main function
async function main() {
  try {
    console.log('Generating model documentation...');
    const docs = generateDocumentation();
    
    // Ensure the directory exists
    if (!existsSync(ROOT_DIR)) {
      mkdirSync(ROOT_DIR, { recursive: true });
    }
    
    // Write the documentation file
    writeFileSync(OUTPUT_FILE, docs, 'utf-8');
    console.log(`✅ Documentation generated at: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error generating documentation:', error);
    process.exit(1);
  }
}

// Run the script
main();
