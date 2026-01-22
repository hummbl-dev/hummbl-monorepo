import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateModel } from './generate-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IN1_DEFINITION = {
  id: 'IN1',
  name: 'Inversion Thinking',
  description: 'Approach problems by considering the opposite of the desired outcome',
  version: '1.0.0',
  characteristics: [
    'Identifies what not to do',
    'Prevents mistakes by inversion',
    'Focuses on avoiding failure',
    'Considers worst-case scenarios',
    'Highlights potential pitfalls'
  ],
  relatedModels: ['P1', 'ST1', 'ST2'],
  example: {
    problem: 'How to be happy?',
    traditionalApproach: 'Pursue happiness directly',
    modelApproach: 'Identify what makes you unhappy and eliminate those things'
  },
  options: {
    maxDepth: 3,
    includeExamples: true,
    includeRiskAnalysis: true
  }
};

async function main() {
  try {
    console.log('🚀 Generating IN1 (Inversion) model...');
    
    const templatePath = join(__dirname, 'templates/model-template.ejs');
    const outputDir = join(process.cwd(), 'src/models/in1');
    
    await generateModel(templatePath, outputDir, IN1_DEFINITION);
    
    console.log('✅ IN1 model generated successfully!');
    console.log('📁 Output directory:', outputDir);
    
  } catch (error) {
    console.error('❌ Error generating IN1 model:', error);
    process.exit(1);
  }
}

main();
