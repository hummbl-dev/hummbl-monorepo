# Mental Model Template Guide

This guide explains how to use the `model-template.ts` to create new mental model implementations.

## Template Structure

The template is organized into several key sections:

1. **Constants** - Model-specific configuration and metadata
2. **Validation Schemas** - Input validation using Zod
3. **Default Configuration** - Default settings for the model
4. **Core Implementation** - The main model class with lifecycle methods
5. **Factory Function** - For creating model instances

## Creating a New Model

### 1. Copy the Template

```bash
cp src/models/model-template.ts src/models/your-model-id/YourModelName.ts
```

### 2. Update Placeholders

Replace all `{{PLACEHOLDERS}}` in the template with your model-specific values:

- `{{MODEL_CODE}}` - Short code (e.g., 'P1', 'IN1')
- `{{MODEL_NAME}}` - Full model name
- `{{DESCRIPTION}}` - Brief description
- `{{CHARACTERISTIC_X}}` - Key characteristics of the model
- `{{RELATED_MODEL_X}}` - Related model codes
- `{{EXAMPLE_*}}` - Example usage

### 3. Implement Core Logic

Customize these methods in the `ModelImpl` class:

- `executeAnalysis()` - Main entry point for the model's logic
- `step1()`, `step2()`, etc. - Break down complex logic into steps
- Add any additional helper methods needed

### 4. Update Validation Schema

Modify the `ModelInputSchema` to validate your model's specific input requirements.

## Example: Creating the IN1 (Inversion) Model

1. Copy the template:
   ```bash
   mkdir -p src/models/in1
   cp src/models/model-template.ts src/models/in1/InversionModel.ts
   ```

2. Update placeholders in `InversionModel.ts`:
   ```typescript
   const MODEL_CONSTANTS = {
     MODEL_CODE: 'IN1',
     MODEL_NAME: 'Inversion Thinking',
     DESCRIPTION: 'Approach problems by considering the opposite of the desired outcome',
     // ... other constants
   };
   ```

3. Implement the core logic:
   ```typescript
   private async executeAnalysis(input: ModelInput): Promise<Omit<ModelOutput, 'metadata'>> {
     // 1. Identify the desired outcome
     const outcome = await this.identifyOutcome(input.problem);
     
     // 2. Invert the outcome
     const inverted = await this.invertOutcome(outcome);
     
     // 3. Analyze the inverted outcome
     const analysis = await this.analyzeInvertedOutcome(inverted);
     
     // 4. Derive insights
     const insights = await this.deriveInsights(analysis);
     
     return {
       id: uuidv4(),
       problem: input.problem,
       outcome,
       invertedOutcome: inverted,
       analysis,
       insights,
       solution: insights.join('\n\n')
     };
   }
   ```

## Testing Your Model

1. Create a test file:
   ```typescript
   // src/models/__tests__/YourModel.test.ts
   import { createModel } from '../your-model/YourModel';
   
   describe('YourModel', () => {
     let model: Model;
     
     beforeEach(() => {
       model = createModel({
         // Test configuration
       });
     });
     
     it('should process basic input', async () => {
       const result = await model.analyze({
         problem: 'How can I be more productive?',
         options: {
           // Model-specific options
         }
       });
       
       expect(result.solution).toBeDefined();
       expect(result.metadata.telemetry).toBeDefined();
     });
   });
   ```

2. Run the tests:
   ```bash
   npm test src/models/__tests__/YourModel.test.ts
   ```

## Best Practices

1. **Modular Design**: Break down complex logic into smaller, testable methods.
2. **Error Handling**: Implement proper error handling and validation.
3. **Telemetry**: Include relevant telemetry data for monitoring.
4. **Documentation**: Document your model's behavior and usage.
5. **Testing**: Write comprehensive tests for all major functionality.

## Next Steps

1. Add your model to the main export in `src/models/index.ts`
2. Update documentation with examples and usage guidelines
3. Consider adding integration tests
4. Create example notebooks or demos
