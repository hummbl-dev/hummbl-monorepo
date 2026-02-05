import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  FirstPrinciplesModel,
  FirstPrinciplesConfig,
  FirstPrinciplesInput,
  FirstPrinciplesOutput,
  TelemetryData,
  LedgerEntry,
  LedgerEntryType,
} from './types';
import { P1_CONSTANTS } from './constants';

// ============================================================================
// VALIDATION
// ============================================================================

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<FirstPrinciplesConfig> = {
  id: 'p1',
  name: P1_CONSTANTS.MODEL_NAME,
  description: 'First Principles Model for breaking down complex problems into fundamental truths',
  version: '1.0.0',
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    fallbackModel: 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  sla: {
    timeoutMs: 5000,
    maxRetries: 3,
    requiredSuccessRate: 0.95,
  },
  logger: console,
  eventEmitter: new EventEmitter(),
  telemetryEnabled: true,
};

// ============================================================================
// AI PROVIDER INTERFACE
// ============================================================================

interface AIResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

// ============================================================================
// MAIN IMPLEMENTATION
// ============================================================================

export class FirstPrinciplesModelImpl implements FirstPrinciplesModel {
  private config: Required<FirstPrinciplesConfig>;
  private eventEmitter: EventEmitter;
  private telemetryQueue: TelemetryData[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private ledgerEntries: LedgerEntry[] = [];
  private circuitBreaker: CircuitBreaker;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: FirstPrinciplesConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventEmitter = this.config.eventEmitter || new EventEmitter();
    this.circuitBreaker = new CircuitBreaker(5, 60000);

    // Start cleanup interval for memory management
    this.startCleanupInterval();
  }

  // ============================================================================
  // PUBLIC INTERFACE
  // ============================================================================

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get version(): string {
    return this.config.version;
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  public on(event: string, listener: (...args: unknown[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  // ============================================================================
  // VISUALIZATION
  // ============================================================================

  public async generateVisualization(data: FirstPrinciplesOutput): Promise<string> {
    try {
      // Simple text-based visualization
      const visualization = [
        'First Principles Analysis:',
        '=========================',
        `Problem: ${data.problem}`,
        '',
        'Decomposed:',
        ...data.decomposed.map((item, i) => `  ${i + 1}. ${item}`),
        '',
        'Assumptions:',
        ...data.assumptions.map((item, i) => `  ${i + 1}. ${item}`),
        '',
        'Fundamental Truths:',
        ...data.fundamentalTruths.map((item, i) => `  ${i + 1}. ${item}`),
        '',
        'Solution:',
        data.solution,
        '',
        `Generated at: ${new Date().toISOString()}`,
      ].join('\n');

      return visualization;
    } catch (error) {
      this.config.logger?.error('Error generating visualization:', error);
      throw new Error('Failed to generate visualization');
    }
  }

  public async analyze(input: unknown): Promise<FirstPrinciplesOutput> {
    const startTime = process.hrtime();
    let requestId: string;

    try {
      // Validate input synchronously before any async operations
      this.validateInput(input);

      // At this point, TypeScript knows input is FirstPrinciplesInput
      const validatedInput = input as FirstPrinciplesInput;
      requestId = validatedInput.metadata?.requestId || uuidv4();
      // Log analysis start
      await this.logToLedger('analysis_start', {
        ...validatedInput,
        metadata: { ...validatedInput.metadata, requestId },
      });

      this.requestCount++;
      this.eventEmitter.emit('analysis:start', {
        ...validatedInput,
        metadata: { ...validatedInput.metadata, requestId },
      });

      // Execute with SLA enforcement
      const result = await this.withSLA(async () => {
        // Decompose the problem
        const { components, telemetry: decomposeTelemetry } = await this.decomposeProblem(
          validatedInput.problem,
          validatedInput.context
        );

        // Identify assumptions
        const { assumptions, telemetry: assumptionsTelemetry } = await this.identifyAssumptions(
          input.problem,
          components
        );

        // Extract fundamental truths
        const { truths, telemetry: truthsTelemetry } = await this.extractFundamentalTruths(
          input.problem,
          components,
          assumptions
        );

        // Rebuild solution
        const { solution, telemetry: solutionTelemetry } = await this.rebuildSolution(
          input.problem,
          truths,
          input.context
        );

        // Generate visualization if requested
        let visualization: string | undefined;
        if (input.options?.includeVisualization) {
          visualization = await this.generateVisualization({
            id: requestId,
            problem: input.problem,
            decomposed: components,
            assumptions,
            fundamentalTruths: truths,
            solution,
            metadata: {
              modelVersion: this.version,
              timestamp: new Date().toISOString(),
              executionTimeMs: this.calculateElapsedTime(startTime),
              telemetry: this.aggregateTelemetry([
                decomposeTelemetry,
                assumptionsTelemetry,
                truthsTelemetry,
                solutionTelemetry,
              ]),
            },
          });
        }

        return {
          id: requestId,
          problem: input.problem,
          decomposed: components,
          assumptions,
          fundamentalTruths: truths,
          solution,
          ...(visualization && { visualization }),
          metadata: {
            modelVersion: this.version,
            timestamp: new Date().toISOString(),
            executionTimeMs: this.calculateElapsedTime(startTime),
            telemetry: this.aggregateTelemetry([
              decomposeTelemetry,
              assumptionsTelemetry,
              truthsTelemetry,
              solutionTelemetry,
            ]),
          },
        };
      }, requestId);

      // Log successful completion
      await this.logToLedger('analysis_complete', {
        ...result,
        metadata: {
          ...result.metadata,
          requestId,
          executionTimeMs: result.metadata.executionTimeMs,
        },
      });

      this.eventEmitter.emit('analysis:complete', result);
      this.emitTelemetry(result.metadata.telemetry);

      return result;
    } catch (error) {
      this.errorCount++;

      // Get requestId from input if available
      let errorRequestId = uuidv4();
      if (input && typeof input === 'object' && input !== null && 'metadata' in input) {
        const metadata = (input as { metadata?: unknown }).metadata;
        if (metadata && typeof metadata === 'object' && 'requestId' in metadata) {
          const requestId = (metadata as { requestId?: unknown }).requestId;
          if (typeof requestId === 'string') {
            errorRequestId = requestId;
          }
        }
      }

      // Log the error to the ledger
      await this.logToLedger('analysis_error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId: errorRequestId,
        executionTimeMs: this.calculateElapsedTime(startTime),
      });

      // Emit error event
      const errorToEmit = error instanceof Error ? error : new Error(String(error));
      this.eventEmitter.emit('analysis:error', errorToEmit);

      throw errorToEmit;
    }
  }

  public async decomposeProblem(
    problem: string,
    context?: Record<string, unknown>
  ): Promise<{ components: string[]; telemetry: TelemetryData }> {
    const startTime = process.hrtime();

    try {
      await this.logToLedger('decompose_problem', { problem, context });

      const prompt = this.buildDecomposePrompt(problem, context);
      const aiResponse = await this.callAIWithFallback(prompt);

      // Parse AI response to extract components
      const components = this.parseDecomposeResponse(aiResponse.content);

      const telemetry: TelemetryData = {
        alignmentScore: this.calculateAlignmentScore(components, problem),
        traceFidelity: this.calculateTraceFidelity(components),
        entropyDelta: this.calculateEntropyDelta(problem, components),
        executionTimeMs: this.calculateElapsedTime(startTime),
        memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024,
        timestamp: new Date().toISOString(),
      };

      this.emitTelemetry(telemetry);

      return { components, telemetry };
    } catch (error) {
      this.errorCount++;
      this.eventEmitter.emit('analysis:error', error);
      throw error;
    }
  }

  public async identifyAssumptions(
    problem: string,
    components: string[]
  ): Promise<{ assumptions: string[]; telemetry: TelemetryData }> {
    const startTime = process.hrtime();

    try {
      await this.logToLedger('identify_assumptions', { problem, components });

      const prompt = this.buildAssumptionsPrompt(problem, components);
      const aiResponse = await this.callAIWithFallback(prompt);

      // Parse AI response to extract assumptions
      const assumptions = this.parseAssumptionsResponse(aiResponse.content);

      const telemetry: TelemetryData = {
        alignmentScore: this.calculateAlignmentScore(assumptions, problem),
        traceFidelity: this.calculateTraceFidelity(assumptions),
        entropyDelta: this.calculateEntropyDelta(components.join(' '), assumptions),
        executionTimeMs: this.calculateElapsedTime(startTime),
        memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024,
        timestamp: new Date().toISOString(),
      };

      this.emitTelemetry(telemetry);

      return { assumptions, telemetry };
    } catch (error) {
      this.errorCount++;
      this.eventEmitter.emit('analysis:error', error);
      throw error;
    }
  }

  public async extractFundamentalTruths(
    problem: string,
    components: string[],
    assumptions: string[]
  ): Promise<{ truths: string[]; telemetry: TelemetryData }> {
    const startTime = process.hrtime();

    try {
      await this.logToLedger('extract_truths', { problem, components, assumptions });

      const prompt = this.buildTruthsPrompt(problem, components, assumptions);
      const aiResponse = await this.callAIWithFallback(prompt);

      // Parse AI response to extract fundamental truths
      const truths = this.parseTruthsResponse(aiResponse.content);

      const telemetry: TelemetryData = {
        alignmentScore: this.calculateAlignmentScore(truths, problem),
        traceFidelity: this.calculateTraceFidelity(truths),
        entropyDelta: this.calculateEntropyDelta(assumptions.join(' '), truths),
        executionTimeMs: this.calculateElapsedTime(startTime),
        memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024,
        timestamp: new Date().toISOString(),
      };

      this.emitTelemetry(telemetry);

      return { truths, telemetry };
    } catch (error) {
      this.errorCount++;
      this.eventEmitter.emit('analysis:error', error);
      throw error;
    }
  }

  public async rebuildSolution(
    problem: string,
    truths: string[],
    context?: Record<string, unknown>
  ): Promise<{ solution: string; telemetry: TelemetryData }> {
    const startTime = process.hrtime();

    try {
      await this.logToLedger('rebuild_solution', { problem, truths, context });

      const prompt = this.buildSolutionPrompt(problem, truths, context);
      const aiResponse = await this.callAIWithFallback(prompt);

      const solution = aiResponse.content.trim();

      const telemetry: TelemetryData = {
        alignmentScore: this.calculateAlignmentScore([solution], problem),
        traceFidelity: this.calculateTraceFidelity([solution]),
        entropyDelta: this.calculateEntropyDelta(truths.join(' '), [solution]),
        executionTimeMs: this.calculateElapsedTime(startTime),
        memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024,
        timestamp: new Date().toISOString(),
      };

      this.emitTelemetry(telemetry);

      return { solution, telemetry };
    } catch (error) {
      this.errorCount++;
      this.cleanupInterval = null;
    }

    this.flushTelemetry();
    this.ledgerEntries = [];
    this.eventEmitter.removeAllListeners();
  }

  // ============================================================================
  // PRIVATE METHODS - AI INTEGRATION
  // ============================================================================

  private async callAIWithFallback(prompt: string): Promise<AIResponse> {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.callAI(prompt, this.config.ai.model);
      } catch (error) {
        if (this.config.ai.fallbackModel) {
          this.config.logger?.warn(
            `Primary model failed, using fallback: ${this.config.ai.fallbackModel}`
          );
          return await this.callAI(prompt, this.config.ai.fallbackModel);
        }
        throw error;
      }
    });
  }

  private async callAI(prompt: string, model: string): Promise<AIResponse> {
    const { provider, apiKey, temperature, maxTokens } = this.config.ai;

    if (!apiKey) {
      // Deterministic fallback when no API key
      return this.deterministicFallback(prompt, model);
    }

    switch (provider) {
      case 'openai':
        return this.callOpenAI(prompt, model, temperature, maxTokens, apiKey);
      case 'anthropic':
        return this.callAnthropic(prompt, model, temperature, maxTokens, apiKey);
      case 'cohere':
        return this.callCohere(prompt, model, temperature, maxTokens, apiKey);
      case 'local':
        return this.deterministicFallback(prompt, model);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private async callOpenAI(
    prompt: string,
    model: string,
    temperature?: number,
    maxTokens?: number,
    apiKey?: string
  ): Promise<AIResponse> {
    // OpenAI API call implementation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens,
      model: data.model,
    };
  }

  private async callAnthropic(
    prompt: string,
    model: string,
    temperature?: number,
    maxTokens?: number,
    apiKey?: string
  ): Promise<AIResponse> {
    // Anthropic API call implementation
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
      model: data.model,
    };
  }

  private async callCohere(
    prompt: string,
    model: string,
    temperature?: number,
    maxTokens?: number,
    apiKey?: string
  ): Promise<AIResponse> {
    // Cohere API call implementation
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.generations[0].text,
      tokensUsed: data.meta.billed_units.input_tokens + data.meta.billed_units.output_tokens,
      model: model,
    };
  }

  private deterministicFallback(_prompt: string, model: string): AIResponse {
    // Simple fallback implementation
    return {
      content: `I'm unable to process this request at the moment. Please try again later.`,
      tokensUsed: 0,
      model: model || 'fallback-model',
    };
  }

  // ============================================================================
  // PRIVATE METHODS - PROMPT BUILDING
  // ============================================================================

  private buildDecomposePrompt(problem: string, context?: Record<string, unknown>): string {
    return `Decompose the following problem into its fundamental components:

Problem: ${problem}
${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

Break this down into 3-7 core components. Each component should be a distinct aspect of the problem.
Return ONLY a JSON array of strings, no additional text.

Example format: ["component 1", "component 2", "component 3"]`;
  }

  private buildAssumptionsPrompt(problem: string, components: string[]): string {
    return `Identify the hidden assumptions in the following problem:

Problem: ${problem}

Components:
${components.map((c, i) => `${i + 1}. ${c}`).join('\n')}

List 3-7 assumptions that are being made about this problem or its components.
Return ONLY a JSON array of strings, no additional text.

Example format: ["assumption 1", "assumption 2", "assumption 3"]`;
  }

  private buildTruthsPrompt(problem: string, components: string[], assumptions: string[]): string {
    return `Extract the fundamental truths from the following:

Problem: ${problem}

Components:
${components.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Assumptions:
${assumptions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Identify 3-7 fundamental truths - facts or principles that are universally true and not dependent on assumptions.
Return ONLY a JSON array of strings, no additional text.

Example format: ["truth 1", "truth 2", "truth 3"]`;
  }

  private buildSolutionPrompt(
    problem: string,
    truths: string[],
    context?: Record<string, unknown>
  ): string {
    return `Build a solution from first principles:

Original Problem: ${problem}

Fundamental Truths:
${truths.map((t, i) => `${i + 1}. ${t}`).join('\n')}

${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

Create a solution based ONLY on the fundamental truths listed above. Do not rely on conventional approaches or assumptions.
Provide a clear, actionable solution in 2-4 paragraphs.`;
  }

  // ============================================================================
  // PRIVATE METHODS - RESPONSE PARSING
  // ============================================================================

  private parseDecomposeResponse(response: string): string[] {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fallback: extract bullet points or numbered lists
      const lines = response
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => l.replace(/^[-*\d.)\]]\s*/, ''))
        .filter((l) => l.length > 10);

      return lines.slice(0, 7);
    }

    return ['Component extraction failed'];
  }

  private parseAssumptionsResponse(response: string): string[] {
    return this.parseDecomposeResponse(response); // Same parsing logic
  }

  private parseTruthsResponse(response: string): string[] {
    return this.parseDecomposeResponse(response); // Same parsing logic
  }

  // ============================================================================
  // PRIVATE METHODS - TELEMETRY CALCULATIONS
  // ============================================================================

  private calculateAlignmentScore(outputs: string[], input: string): number {
    // Calculate semantic alignment between output and input
    const inputWords = new Set(input.toLowerCase().split(/\s+/));
    const outputWords = new Set(outputs.join(' ').toLowerCase().split(/\s+/));

    const intersection = new Set([...inputWords].filter((x) => outputWords.has(x)));
    const union = new Set([...inputWords, ...outputWords]);

    return intersection.size / union.size;
  }

  private calculateTraceFidelity(outputs: string[]): number {
    // Measure completeness and coherence of output
    const avgLength = outputs.reduce((sum, o) => sum + o.length, 0) / outputs.length;
    const lengthScore = Math.min(avgLength / 100, 1); // Normalize to 0-1

    return lengthScore * 0.9 + 0.1; // Base score 0.1 + length contribution
  }

  private calculateEntropyDelta(before: string | string[], after: string[]): number {
    // Measure reduction in uncertainty/complexity
    const beforeText = Array.isArray(before) ? before.join(' ') : before;
    const afterText = after.join(' ');

    const beforeEntropy = this.calculateEntropy(beforeText);
    const afterEntropy = this.calculateEntropy(afterText);

    return beforeEntropy - afterEntropy;
  }

  private calculateEntropy(text: string): number {
    const freq: Record<string, number> = {};
    const words = text.toLowerCase().split(/\s+/);

    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    let entropy = 0;
    const total = words.length;

    Object.values(freq).forEach((count) => {
      const p = count / total;
      entropy -= p * Math.log2(p);
    });

    return entropy;
  }

  // ============================================================================
  // PRIVATE METHODS - SLA ENFORCEMENT
  // ============================================================================

  private async withSLA<T>(fn: () => Promise<T>, requestId: string): Promise<T> {
    const { timeoutMs, maxRetries = 3 } = this.config.sla;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`SLA timeout: ${timeoutMs}ms exceeded`)), timeoutMs);
        });

        // Race between function and timeout
        return await Promise.race([fn(), timeoutPromise]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          this.config.logger?.warn(
            `Retry ${attempt}/${maxRetries} after ${backoffMs}ms for request ${requestId}`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  // ============================================================================
  // PRIVATE METHODS - LEDGER & TELEMETRY
  // ============================================================================

  private async logToLedger(
    type: LedgerEntryType,
    data: unknown,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const entry: LedgerEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        modelId: this.id,
        modelVersion: this.version,
        type,
        data,
        metadata: {
          ...metadata,
          requestId: data.metadata?.requestId || data.requestId || uuidv4(),
        },
      };

      this.ledgerEntries.push(entry);
      this.eventEmitter.emit('ledgerEntry', entry);

      if (this.config.logger) {
        this.config.logger.debug(`[LEDGER] ${type}`, {
          id: entry.id,
          timestamp: entry.timestamp,
          modelId: entry.modelId,
          type: entry.type,
        });
      }
    } catch (error) {
      // Never let ledger logging break the main flow
      this.config.logger?.error('Ledger logging failed:', error);
    }
  }

  private calculateElapsedTime(startTime: [number, number]): number {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    return seconds * 1000 + nanoseconds / 1e6;
  }

  private aggregateTelemetry(telemetryData: TelemetryData[]): TelemetryData {
    const total = telemetryData.length;

    return {
      alignmentScore: telemetryData.reduce((sum, t) => sum + t.alignmentScore, 0) / total,
      traceFidelity: telemetryData.reduce((sum, t) => sum + t.traceFidelity, 0) / total,
      entropyDelta: telemetryData.reduce((sum, t) => sum + t.entropyDelta, 0) / total,
      executionTimeMs: telemetryData.reduce((sum, t) => sum + t.executionTimeMs, 0),
      memoryUsageMb: Math.max(...telemetryData.map((t) => t.memoryUsageMb)),
      timestamp: new Date().toISOString(),
    };
  }

  private emitTelemetry(telemetry: TelemetryData): void {
    if (this.config.telemetryEnabled) {
      this.telemetryQueue.push(telemetry);
      this.eventEmitter.emit('telemetry', telemetry);

      if (this.telemetryQueue.length >= 100) {
        this.flushTelemetry();
      }
    }
  }

  private flushTelemetry(): void {
    if (this.config.logger && this.telemetryQueue.length > 0) {
      this.config.logger.debug(`Flushing ${this.telemetryQueue.length} telemetry records`);
      this.telemetryQueue = [];
    }
  }

  // ============================================================================
  // PRIVATE METHODS - VALIDATION & CONFIGURATION
  // ============================================================================

  public validateInput(input: unknown): asserts input is FirstPrinciplesInput {
    // Check if input is an object
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      throw new Error('Input must be an object');
    }

    // Type assertion since we've checked it's a non-null object
    const inputObj = input as Record<string, unknown>;

    // Check if problem exists and is a string
    if (typeof inputObj.problem !== 'string') {
      throw new Error('Problem statement must be a string with at least 10 characters');
    }

    // Check if problem has at least 10 characters
    if (inputObj.problem.trim().length < 10) {
      throw new Error('Problem statement must be a string with at least 10 characters');
    }
  }

  public getConfig(): Readonly<FirstPrinciplesConfig> {
    // Create a deep frozen copy of the config
    const frozenConfig = JSON.parse(JSON.stringify(this.config));

    // Make it read-only
    Object.freeze(frozenConfig);

    // Also freeze nested objects
    if (frozenConfig.ai) Object.freeze(frozenConfig.ai);
    if (frozenConfig.sla) Object.freeze(frozenConfig.sla);

    return frozenConfig as Readonly<FirstPrinciplesConfig>;
  }

  public configure(config: Partial<FirstPrinciplesConfig>): void {
    // Merge the new config with the existing one
    this.config = { ...this.config, ...config };

    // Emit configuration changed event
    this.eventEmitter.emit('configChanged', this.getConfig());
  }

  private startCleanupInterval(): void {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        const maxAge = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();

        // Keep only recent ledger entries
        this.ledgerEntries = this.ledgerEntries.filter((entry) => {
          const entryTime = new Date(entry.timestamp).getTime();
          return now - entryTime < maxAge;
        });

        // Flush telemetry
        if (this.telemetryQueue.length > 0) {
          this.flushTelemetry();
        }
      },
      5 * 60 * 1000
    );

    // Don't keep process alive just for cleanup
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const createFirstPrinciplesModel = (
  config: FirstPrinciplesConfig = {}
): FirstPrinciplesModel => {
  return new FirstPrinciplesModelImpl(config);
};

export default createFirstPrinciplesModel;
