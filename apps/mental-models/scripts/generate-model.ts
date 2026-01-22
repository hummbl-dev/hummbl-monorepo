import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

interface ModelDefinition {
  id: string;
  name: string;
  description: string;
  version?: string;
  characteristics: string[];
  relatedModels: string[];
  example: {
    problem: string;
    traditionalApproach: string;
    modelApproach: string;
  };
  options?: Record<string, any>;
}

export async function generateModel(
  templatePath: string,
  outputDir: string,
  definition: ModelDefinition
): Promise<string> {
  try {
    // Set default values
    const model = {
      version: '1.0.0',
      ...definition,
      className: `${definition.id}Model`,
      varName: `${definition.id.toLowerCase()}Model`,
      date: new Date().toISOString()
    };

    // Create output directory if it doesn't exist
    await mkdir(outputDir, { recursive: true });

    // Read template
    const template = await readFile(templatePath, 'utf-8');
    
    // Render template with model data
    const rendered = ejs.render(template, { model }, {
      filename: templatePath,
      delimiter: '%%',
      strict: true
    });

    // Write output file
    const outputPath = path.join(outputDir, `${model.id}Model.ts`);
    await writeFile(outputPath, rendered, 'utf-8');

    console.log(`✅ Model generated at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error generating model:', error);
    throw error;
  }
}

// Example usage:
// generateModel(
//   './templates/model-template.ejs',
//   './src/models/in1',
//   {
//     id: 'IN1',
//     name: 'Inversion Thinking',
//     description: 'Approach problems by considering the opposite of the desired outcome',
//     characteristics: [
//       'Identifies what not to do',
//       'Prevents mistakes by inversion',
//       'Focuses on avoiding failure'
//     ],
//     relatedModels: ['P1', 'ST1'],
//     example: {
//       problem: 'How to be happy?',
//       traditionalApproach: 'Pursue happiness directly',
//       modelApproach: 'Identify what makes you unhappy and eliminate those things'
//     },
//     options: {
//       maxDepth: 3,
//       includeExamples: true
//     }
//   }
// );
