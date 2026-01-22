import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { IN1_CONSTANTS } from './constants';
import type { IN1Config, IN1Input, IN1Output } from './types';

// Helper function to invert a question
export function invertQuestion(question: string): string {
  // Handle "How to" questions
  if (question.startsWith('How to ')) {
    return `How to fail at ${question.substring(7)}`;
  }
  // Handle "How can I" questions
  if (question.startsWith('How can I ')) {
    return `How can I fail at ${question.substring(10)}`;
  }
  // Handle questions ending with "?"
  if (question.endsWith('?')) {
    return `How to fail at ${question.slice(0, -1).toLowerCase()}?`;
  }
  // Handle statements
  return `What would cause complete failure at: ${question}`;
}

// Helper to generate failure modes
export function generateFailureModes(inverseProblem: string, context: Record<string, any> = {}): string[] {
  // This is a simplified implementation - in a real app, this would use an LLM
  let failures = [
    'Lack of clear goals',
    'Poor communication',
    'Insufficient resources',
    'Ignoring feedback',
    'Poor planning',
    'Lack of accountability',
    'Resistance to change',
    'Overcomplicating solutions'
  ];

  // Add context-specific failures
  if (context.industry) {
    failures.push(`Not understanding the ${context.industry} industry`);
    failures.push(`Ignoring ${context.industry} regulations`);
  }
  if (context.teamSize > 10) {
    failures.push('Poor team coordination at scale');
    failures.push('Communication breakdowns in large team');
  }

  // Ensure we return a consistent number of items
  return failures.slice(0, 5);
}

// Helper to convert failure modes to avoidance strategies
export function generateAvoidanceStrategies(failureModes: string[]): string[] {
  return failureModes.map(failure => {
    if (failure.startsWith('Lack of ')) {
      return `Ensure ${failure.substring(8).toLowerCase()}`;
    }
    if (failure.startsWith('Poor ')) {
      return `Improve ${failure.substring(5).toLowerCase()}`;
    }
    if (failure.startsWith('Ignoring ')) {
      return `Actively seek and address ${failure.substring(9).toLowerCase()}`;
    }
    return `Mitigate risk of ${failure.toLowerCase()}`;
  });
}

// Helper to generate insights
export function generateInsights(failureModes: string[]): string[] {
  return [
    `Avoiding failure is often more important than pursuing success`,
    `The most critical risks to manage: ${failureModes.slice(0, 2).join(' and ')}`,
    `Regularly review and update your risk assessment`,
    `Create systems to detect early warning signs`
  ];
}

const DEFAULT_CONFIG: Required<IN1Config> = {
  id: 'in1',
  name: 'Inversion Thinking',
  description: 'Approach problems by considering the opposite of the desired outcome',
  version: '1.0.0',
  eventEmitter: new EventEmitter(),
  telemetryEnabled: true,
};

export class IN1Model {
  private config: Required<IN1Config>;
  
  constructor(config: Partial<IN1Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async analyze(input: IN1Input): Promise<IN1Output> {
    const startTime = Date.now();
    const requestId = input.metadata?.requestId || uuidv4();
    const eventEmitter = this.config.eventEmitter;

    try {
      // 1. Invert the problem
      const inverseProblem = invertQuestion(input.problem);
      
      // 2. Generate failure modes
      const failureModes = generateFailureModes(inverseProblem, input.context);
      
      // 3. Convert to avoidance strategies
      const avoidanceStrategies = generateAvoidanceStrategies(failureModes);
      
      // 4. Generate insights
      const insights = generateInsights(failureModes);
      
      // 5. Calculate confidence (simplified)
      const confidence = Math.min(0.9, 0.7 + (Math.min(failureModes.length, 5) * 0.04));
      
      const result: IN1Output = {
        id: uuidv4(),
        problem: input.problem,
        solution: avoidanceStrategies.join('. ') + '.',
        metadata: {
          modelVersion: this.config.version || '1.0.0',
          timestamp: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime,
          telemetry: {
            model: 'IN1',
            version: this.config.version || '1.0.0',
            timestamp: new Date().toISOString()
          }
        },
        inverseProblem,
        failureModes,
        avoidanceStrategies,
        insights,
        confidence
      };

      // Emit analysis complete event
      if (eventEmitter) {
        eventEmitter.emit('analysisComplete', {
          requestId,
          result,
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Emit error event
      if (eventEmitter) {
        const errorEvent = {
          requestId,
          error: errorMessage,
          timestamp: new Date().toISOString()
        };
        eventEmitter.emit('analysisError', errorEvent);
      }
      
      // Re-throw the error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(errorMessage);
    }
  }
}

export function createIN1Model(config?: Partial<IN1Config>) {
  return new IN1Model(config);
}

export default createIN1Model;