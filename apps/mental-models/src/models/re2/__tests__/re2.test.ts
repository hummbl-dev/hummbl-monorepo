import { recursiveDecompose } from '..';
import { RE2_CONSTANTS, createProblemDecomposition } from '../constants';
import { v4 as uuidv4 } from 'uuid';

describe('RE2: Recursive Problem Decomposition Model', () => {
  // Simple test problem: calculate factorial using decomposition
  const factorialConfig = {
    // A number is a base case if it's less than or equal to 1
    isBaseCase: (n: number) => n <= 1,
    
    // Solve base case: 1! = 1
    solveBaseCase: async (n: number) => 1,
    
    // Decompose n! into n * (n-1)!
    decompose: async (n: number) => [n - 1],
    
    // Combine solutions: n * (n-1)!
    combine: async (n: number, subSolutions: Array<{ subproblem: number; solution: number }>) => {
      return n * subSolutions[0].solution;
    },
  };
  
  // More complex example: directory tree size calculation
  interface FileSystemNode {
    type: 'file' | 'directory';
    name: string;
    size?: number;
    children?: FileSystemNode[];
  }
  
  const fsConfig = {
    // Base case: it's a file
    isBaseCase: (node: FileSystemNode) => node.type === 'file',
    
    // Return file size for base case
    solveBaseCase: async (node: FileSystemNode) => node.size || 0,
    
    // Return directory contents for decomposition
    decompose: async (node: FileSystemNode) => node.children || [],
    
    // Sum up sizes of directory contents
    combine: async (node: FileSystemNode, subSolutions: Array<{ subproblem: FileSystemNode; solution: number }>) => {
      return subSolutions.reduce((sum, { solution }) => sum + solution, 0);
    },
  };
  
  describe('Model Initialization', () => {
    it('should create a decomposition with the correct properties', () => {
      const problem = 5; // 5!
      const decomposition = createProblemDecomposition<number, number>(problem, {
        id: 'test-decomposition',
      });
      
      expect(decomposition).toBeDefined();
      expect(decomposition.id).toBe('test-decomposition');
      expect(decomposition.rootProblem).toBe(5);
      expect(decomposition.subproblems.size).toBe(1); // Root problem
      expect(decomposition.status).toBe('pending');
      expect(decomposition.stats.totalSubproblems).toBe(1);
    });
    
    it('should validate inputs', async () => {
      // @ts-ignore - Testing invalid input
      await expect(recursiveDecompose({})).rejects.toThrow('isBaseCase must be a function');
      
      await expect(
        recursiveDecompose({
          // @ts-ignore - Testing invalid input
          isBaseCase: true,
          problem: 5,
        })
      ).rejects.toThrow('isBaseCase must be a function');
      
      await expect(
        recursiveDecompose({
          isBaseCase: () => true,
          // @ts-ignore - Testing invalid input
          solveBaseCase: 'not a function',
          problem: 5,
        })
      ).rejects.toThrow('solveBaseCase must be a function');
    });
  });
  
  describe('Factorial Example', () => {
    it('should calculate factorial using decomposition', async () => {
      const problem = 5; // 5! = 120
      
      const result = await recursiveDecompose({
        problem,
        ...factorialConfig,
      });
      
      expect(result.success).toBe(true);
      expect(result.solution).toBe(120);
      expect(result.decomposition.status).toBe('solved');
      
      // Should have created subproblems for 4, 3, 2, 1
      expect(result.decomposition.stats.totalSubproblems).toBe(5);
      expect(result.decomposition.stats.solvedSubproblems).toBe(5);
      expect(result.decomposition.stats.maxDepth).toBe(4);
    });
    
    it('should respect maxDepth limit', async () => {
      const problem = 10; // Would normally require 10 levels, but we'll limit to 3
      
      await expect(
        recursiveDecompose({
          problem,
          ...factorialConfig,
          maxDepth: 3,
        })
      ).rejects.toThrow(RE2_CONSTANTS.ERRORS.MAX_DEPTH_EXCEEDED);
    });
  });
  
  describe('File System Example', () => {
    const fileSystem: FileSystemNode = {
      type: 'directory',
      name: 'root',
      children: [
        {
          type: 'file',
          name: 'file1.txt',
          size: 100,
        },
        {
          type: 'directory',
          name: 'dir1',
          children: [
            {
              type: 'file',
              name: 'file2.txt',
              size: 200,
            },
            {
              type: 'file',
              name: 'file3.txt',
              size: 300,
            },
          ],
        },
        {
          type: 'file',
          name: 'file4.txt',
          size: 400,
        },
      ],
    };
    
    it('should calculate total size of directory', async () => {
      const result = await recursiveDecompose({
        problem: fileSystem,
        ...fsConfig,
      });
      
      expect(result.success).toBe(true);
      expect(result.solution).toBe(1000); // 100 + 200 + 300 + 400
      expect(result.decomposition.status).toBe('solved');
      expect(result.decomposition.stats.totalSubproblems).toBe(6); // root + 4 files + 1 directory
    });
    
    it('should handle empty directories', async () => {
      const emptyDir: FileSystemNode = {
        type: 'directory',
        name: 'empty',
        children: [],
      };
      
      const result = await recursiveDecompose({
        problem: emptyDir,
        ...fsConfig,
      });
      
      expect(result.success).toBe(true);
      expect(result.solution).toBe(0); // Empty directory has size 0
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors in base case solver', async () => {
      const result = await recursiveDecompose({
        problem: 5,
        ...factorialConfig,
        solveBaseCase: async () => {
          throw new Error('Failed to solve base case');
        },
      });
      
      expect(result.success).toBe(false);
      expect(result.decomposition.status).toBe('failed');
      expect(result.error?.message).toContain('Failed to solve base case');
    });
    
    it('should handle errors in decomposition', async () => {
      const result = await recursiveDecompose({
        problem: 5,
        ...factorialConfig,
        decompose: async () => {
          throw new Error('Failed to decompose');
        },
      });
      
      expect(result.success).toBe(false);
      expect(result.decomposition.status).toBe('failed');
      expect(result.error?.message).toContain('Failed to decompose');
    });
    
    it('should handle errors in solution combination', async () => {
      const result = await recursiveDecompose({
        problem: 5,
        ...factorialConfig,
        combine: async () => {
          throw new Error('Failed to combine');
        },
      });
      
      expect(result.success).toBe(false);
      expect(result.decomposition.status).toBe('failed');
      expect(result.error?.message).toContain('Failed to combine');
    });
  });
  
  describe('Event Handling', () => {
    it('should emit events during decomposition', async () => {
      const events: any[] = [];
      
      await recursiveDecompose({
        problem: 3, // 3! = 6
        ...factorialConfig,
        onEvent: (event) => {
          events.push({
            type: event.type,
            depth: 'subproblem' in event ? event.subproblem.depth : undefined,
          });
        },
      });
      
      // Should have events for starting, creating subproblems, solving base cases, combining, and completing
      expect(events.some(e => e.type === 'started')).toBe(true);
      expect(events.some(e => e.type === 'subproblemCreated' && e.depth === 1)).toBe(true);
      expect(events.some(e => e.type === 'subproblemCreated' && e.depth === 2)).toBe(true);
      expect(events.some(e => e.type === 'baseCaseSolved' && e.depth === 2)).toBe(true);
      expect(events.some(e => e.type === 'completed')).toBe(true);
    });
  });
  
  describe('Subproblem Filtering', () => {
    it('should skip subproblems based on shouldProcessSubproblem', async () => {
      // Only process even numbers
      const result = await recursiveDecompose({
        problem: 6, // 6! = 720, but we'll skip odd numbers
        ...factorialConfig,
        shouldProcessSubproblem: async (n) => n % 2 === 0,
      });
      
      // The decomposition should be incomplete because we skipped odd numbers
      expect(result.success).toBe(false);
      expect(result.decomposition.status).toBe('failed');
      
      // Should have fewer subproblems than normal
      expect(result.decomposition.stats.totalSubproblems).toBeLessThan(6);
    });
  });
});
