// Model Router Tests - Validate routing logic and decision making

import { ModelRouter, TaskContext } from '../modelRouter';
import { TaskClassifier } from '../taskClassifier';
import { intelligentRouting, requiresExecution } from '../intelligentRouting';

describe('Model Router System', () => {
  const router = new ModelRouter();
  const classifier = new TaskClassifier();

  describe('Execution Task Routing', () => {
    test('should route file operations to execution model', () => {
      const context: TaskContext = {
        requiresFileAccess: true,
        requiresCommandExecution: false,
        requiresGitOperations: false,
        requiresRealTimeData: false,
        requiresEnvironmentState: false,
        requiresDeepAnalysis: false,
        requiresResearch: false,
        requiresComparison: false,
        requiresArchitecturalDesign: false,
        requiresDocumentation: false,
        requiresContentGeneration: false,
        requiresCreativeWriting: false,
        requiresMarketingCopy: false,
        requiresUserStories: false,
        requiresBrainstorming: false,
        projectType: 'frontend',
        urgency: 'medium',
        complexity: 'moderate',
        userIntent: 'Edit the React component file',
      };

      const decision = router.route(context);

      expect(decision.selectedModel.modelClass).toBe('execution');
      expect(decision.confidence).toBeGreaterThan(0.7);
      expect(decision.reasoning).toContain('environment access');
    });

    test('should route git operations to execution model', () => {
      const context: TaskContext = {
        requiresFileAccess: false,
        requiresCommandExecution: false,
        requiresGitOperations: true,
        requiresRealTimeData: false,
        requiresEnvironmentState: false,
        requiresDeepAnalysis: false,
        requiresResearch: false,
        requiresComparison: false,
        requiresArchitecturalDesign: false,
        requiresDocumentation: false,
        requiresContentGeneration: false,
        requiresCreativeWriting: false,
        requiresMarketingCopy: false,
        requiresUserStories: false,
        requiresBrainstorming: false,
        projectType: 'fullstack',
        urgency: 'high',
        complexity: 'simple',
        userIntent: 'Commit and push changes',
      };

      const decision = router.route(context);

      expect(decision.selectedModel.modelClass).toBe('execution');
      expect(decision.selectedModel.supportsCodeExecution).toBe(true);
    });
  });

  describe('Reasoning Task Routing', () => {
    test('should route analysis tasks to reasoning model', () => {
      const context: TaskContext = {
        requiresFileAccess: false,
        requiresCommandExecution: false,
        requiresGitOperations: false,
        requiresRealTimeData: false,
        requiresEnvironmentState: false,
        requiresDeepAnalysis: true,
        requiresResearch: true,
        requiresComparison: false,
        requiresArchitecturalDesign: false,
        requiresDocumentation: false,
        requiresContentGeneration: false,
        requiresCreativeWriting: false,
        requiresMarketingCopy: false,
        requiresUserStories: false,
        requiresBrainstorming: false,
        projectType: 'backend',
        urgency: 'low',
        complexity: 'complex',
        userIntent: 'Analyze the best database architecture for our use case',
      };

      const decision = router.route(context);

      expect(decision.selectedModel.modelClass).toBe('reasoning');
      expect(decision.confidence).toBeGreaterThanOrEqual(0.6);
    });

    test('should route architectural design to reasoning model', () => {
      const context: TaskContext = {
        requiresFileAccess: false,
        requiresCommandExecution: false,
        requiresGitOperations: false,
        requiresRealTimeData: false,
        requiresEnvironmentState: false,
        requiresDeepAnalysis: false,
        requiresResearch: false,
        requiresComparison: false,
        requiresArchitecturalDesign: true,
        requiresDocumentation: true,
        requiresContentGeneration: false,
        requiresCreativeWriting: false,
        requiresMarketingCopy: false,
        requiresUserStories: false,
        requiresBrainstorming: false,
        projectType: 'other',
        urgency: 'medium',
        complexity: 'enterprise',
        userIntent: 'Design a microservices architecture',
      };

      const decision = router.route(context);

      expect(decision.selectedModel.modelClass).toBe('reasoning');
      expect(decision.selectedModel.maxTokens).toBeGreaterThan(100000);
    });
  });

  describe('Creative Task Routing', () => {
    test('should route content generation to creative model', () => {
      const context: TaskContext = {
        requiresFileAccess: false,
        requiresCommandExecution: false,
        requiresGitOperations: false,
        requiresRealTimeData: false,
        requiresEnvironmentState: false,
        requiresDeepAnalysis: false,
        requiresResearch: false,
        requiresComparison: false,
        requiresArchitecturalDesign: false,
        requiresDocumentation: false,
        requiresContentGeneration: true,
        requiresCreativeWriting: false,
        requiresMarketingCopy: true,
        requiresUserStories: false,
        requiresBrainstorming: false,
        projectType: 'other',
        urgency: 'medium',
        complexity: 'simple',
        userIntent: 'Write marketing copy for our landing page',
      };

      const decision = router.route(context);

      expect(decision.selectedModel.modelClass).toBe('creative');
    });
  });

  describe('Task Classification', () => {
    test('should classify execution tasks correctly', () => {
      const testCases = [
        'Add streaming responses to the chat widget',
        'Fix the build error in package.json',
        'Deploy the latest changes to production',
        'Run the test suite and fix any failures',
      ];

      testCases.forEach((input) => {
        const result = classifier.classify(input);
        const hasExecution =
          result.context.requiresFileAccess ||
          result.context.requiresCommandExecution ||
          result.context.requiresGitOperations;

        expect(hasExecution).toBe(true);
        expect(result.detectedIntents.length).toBeGreaterThan(0);
      });
    });

    test('should classify reasoning tasks correctly', () => {
      const testCases = [
        'Explain the differences between SQL and NoSQL databases',
        'Analyze the performance implications of this algorithm',
        'Compare React vs Vue for our use case',
        'Design a scalable authentication system',
      ];

      testCases.forEach((input) => {
        const result = classifier.classify(input);
        const hasReasoning =
          result.context.requiresDeepAnalysis ||
          result.context.requiresResearch ||
          result.context.requiresComparison ||
          result.context.requiresArchitecturalDesign;

        expect(hasReasoning).toBe(true);
      });
    });

    test('should classify creative tasks correctly', () => {
      const testCases = [
        'Write a blog post about our new features',
        'Create user stories for the mobile app',
        'Brainstorm ideas for improving user engagement',
        'Write marketing copy for our product launch',
      ];

      testCases.forEach((input) => {
        const result = classifier.classify(input);
        const hasCreative =
          result.context.requiresContentGeneration ||
          result.context.requiresCreativeWriting ||
          result.context.requiresMarketingCopy ||
          result.context.requiresUserStories ||
          result.context.requiresBrainstorming;

        expect(hasCreative).toBe(true);
      });
    });
  });

  describe('Intelligent Routing Integration', () => {
    test('should provide complete routing analysis', async () => {
      const input = 'Add authentication to the React app with Supabase';
      const result = await intelligentRouting.route(input);

      expect(result.classification).toBeDefined();
      expect(result.routing).toBeDefined();
      expect(result.executionPlan).toBeDefined();
      expect(result.estimatedDuration).toBeGreaterThan(0);
      expect(result.recommendedApproach).toContain('Model Selection');
    });

    test('should detect execution requirements correctly', () => {
      const executionTasks = [
        'npm install react-router-dom',
        'Create a new component file',
        'Push changes to GitHub',
        'Start the development server',
      ];

      executionTasks.forEach((task) => {
        expect(requiresExecution(task)).toBe(true);
      });

      const nonExecutionTasks = [
        'What is React?',
        'Explain how JWT tokens work',
        'Compare different state management libraries',
      ];

      nonExecutionTasks.forEach((task) => {
        expect(requiresExecution(task)).toBe(false);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty input gracefully', () => {
      const result = classifier.classify('');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.context.projectType).toBe('other');
    });

    test('should handle ambiguous input', () => {
      const result = classifier.classify('help');
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.detectedIntents.length).toBeLessThanOrEqual(1);
    });

    test('should handle mixed requirements', () => {
      const input = 'Analyze the current authentication system and then implement improvements';
      const result = classifier.classify(input);

      expect(result.context.requiresDeepAnalysis).toBe(true);
      expect(result.context.requiresFileAccess).toBe(true);
      expect(result.detectedIntents.length).toBeGreaterThan(1);
    });
  });
});

// Example usage scenarios
export const exampleScenarios = {
  execution: [
    'Add streaming responses to the chat widget',
    'Fix the TypeScript errors in the auth service',
    'Deploy the latest changes to Vercel',
    'Create a new React component for user profiles',
    'Run the test suite and commit the changes',
  ],

  reasoning: [
    'Explain the trade-offs between different state management approaches',
    'Analyze the security implications of our current API design',
    'Compare Supabase vs Firebase for our authentication needs',
    'Design a scalable architecture for real-time notifications',
    'Document the best practices for our React component structure',
  ],

  creative: [
    'Write user stories for the new dashboard feature',
    'Create marketing copy for our landing page',
    'Brainstorm ideas for improving user onboarding',
    'Write a blog post about our development process',
    'Generate creative names for our new product features',
  ],
};
