// Scalable content import pipeline for narratives and mental models

// Core types
export type Complexity = {
  cognitive_load: string;
  time_to_elicit: string;
  expertise_required: string;
};

export type Signal = {
  signal_id: string;
  signal_type: string;
  weight: number;
  context: string;
};

export type Relationship = {
  type: string;
  target: string;
  description: string;
};

export type Citation = {
  author: string;
  year: number | string;
  title: string;
  source: string;
};

export type ElicitationMethod = {
  method: string;
  duration: string;
  difficulty: string;
};

export type Example = {
  scenario: string;
  application: string;
  outcome: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  changes: string;
};

export interface Narrative {
  // Core identification
  id: string;
  narrative_id: string;
  version: string;
  provenance_hash: string;

  // Core content
  title: string;
  content: string;
  summary: string;
  category: string;

  // Classification
  tags: string[];
  domain: string[];
  evidence_quality: 'A' | 'B' | 'C';
  confidence: number;
  complexity: Complexity;
  examples: Array<Example | string>;
  linked_signals: Signal[];
  relationships: Relationship[];
  related_frameworks: string[];
  citations: Citation[];
  elicitation_methods: ElicitationMethod[];
  methods?: Array<{
    method: string;
    description: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }>;
  changelog: ChangelogEntry[];
  lastUpdated?: string;
  approved?: boolean;
}

export interface MentalModel {
  id: string;
  name: string;
  code: string;
  definition?: string;
  description?: string;
  category: string;
  tags: string[];
  transformations: string[];
  sources: Array<{
    name: string;
    reference: string;
  }>;
  example?: string;
  meta: {
    added: string;
    updated: string;
    difficulty: number;
    isCore: boolean;
  };
}

export type TransformationKey = string;

export interface ImportResult<T> {
  success: boolean;
  data?: T[];
  errors: ImportError[];
  stats: ImportStats;
}

export interface ImportError {
  file?: string;
  line?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  duration: number;
}

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean;
}

/**
 * Content Import Pipeline
 */
export class ContentImportPipeline {
  private errors: ImportError[] = [];

  /**
   * Import narratives from JSON
   */
  async importNarratives(data: unknown[]): Promise<ImportResult<Narrative>> {
    const startTime = Date.now();
    this.errors = [];

    const result: ImportResult<Narrative> = {
      success: true,
      data: [],
      errors: [],
      stats: {
        total: data.length,
        imported: 0,
        skipped: 0,
        failed: 0,
        duration: 0,
      },
    };

    try {
      for (let i = 0; i < data.length; i++) {
        try {
          const narrative = this.validateNarrative(data[i], i);
          if (narrative) {
            result.data?.push(narrative);
            result.stats.imported++;
          } else {
            result.stats.skipped++;
          }
        } catch (error) {
          result.stats.failed++;
          if (error instanceof Error) {
            this.errors.push({
              line: i + 1,
              message: error.message,
              severity: 'error',
            });
          }
        }
      }

      result.errors = this.errors;
      result.success = this.errors.length === 0;
      result.stats.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
          },
        ],
        stats: {
          total: data.length,
          imported: 0,
          skipped: 0,
          failed: data.length,
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Import mental models from JSON
   */
  async importMentalModels(data: unknown[]): Promise<ImportResult<MentalModel>> {
    const startTime = Date.now();
    this.errors = [];

    const result: ImportResult<MentalModel> = {
      success: true,
      data: [],
      errors: [],
      stats: {
        total: data.length,
        imported: 0,
        skipped: 0,
        failed: 0,
        duration: 0,
      },
    };

    try {
      for (let i = 0; i < data.length; i++) {
        try {
          const model = this.validateMentalModel(data[i], i);
          if (model) {
            result.data?.push(model);
            result.stats.imported++;
          } else {
            result.stats.skipped++;
          }
        } catch (error) {
          result.stats.failed++;
          if (error instanceof Error) {
            this.errors.push({
              line: i + 1,
              message: error.message,
              severity: 'error',
            });
          }
        }
      }

      result.errors = this.errors;
      result.success = this.errors.length === 0;
      result.stats.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
          },
        ],
        stats: {
          total: data.length,
          imported: 0,
          skipped: 0,
          failed: data.length,
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Validate narrative object
   */
  private validateNarrative(data: unknown, index: number): Narrative | null {
    if (!data || typeof data !== 'object') {
      this.errors.push({
        line: index + 1,
        message: 'Invalid narrative data: expected an object',
        severity: 'error',
      });
      return null;
    }

    // Define a type for the raw input data
    type RawNarrative = Partial<{
      id: unknown;
      narrative_id: unknown;
      version: unknown;
      provenance_hash: unknown;
      title: unknown;
      content: unknown;
      summary: unknown;
      category: unknown;
      tags: unknown;
      domain: unknown;
      evidence_quality: unknown;
      confidence: unknown;
      complexity: unknown;
      examples: unknown;
      linked_signals: unknown;
      relationships: unknown;
      related_frameworks: unknown;
      citations: unknown;
      elicitation_methods: unknown;
      methods: unknown;
      changelog: unknown;
      lastUpdated: unknown;
      approved: unknown;
    }>;

    const item = data as RawNarrative;
    const required = ['id', 'title', 'content', 'category'] as const;

    // Check required fields
    for (const field of required) {
      if (!item[field]) {
        this.errors.push({
          line: index + 1,
          field: field as string,
          message: `Missing required field: ${field}`,
          severity: 'error',
        });
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Type validation for required fields
    if (typeof item.id !== 'string') {
      throw new Error('id must be a string');
    }

    if (typeof item.title !== 'string') {
      throw new Error('title must be a string');
    }

    if (typeof item.content !== 'string') {
      throw new Error('content must be a string');
    }

    // Construct proper Narrative object with all required fields
    const narrative: Narrative = {
      // Core identification
      id: String(item.id || ''),
      narrative_id: String(item.narrative_id || ''),
      version: String(item.version || '1.0.0'),
      provenance_hash: String(item.provenance_hash || ''),

      // Core content
      title: String(item.title || ''),
      content: String(item.content || ''),
      summary: String(item.summary || ''),
      category: String(item.category || ''),

      // Classification
      tags: Array.isArray(item.tags)
        ? (item.tags as unknown[]).filter((t): t is string => typeof t === 'string')
        : [],
      domain: Array.isArray(item.domain)
        ? (item.domain as unknown[]).filter((d): d is string => typeof d === 'string')
        : [],
      evidence_quality: (['A', 'B', 'C'] as const).includes(item.evidence_quality as any)
        ? (item.evidence_quality as 'A' | 'B' | 'C')
        : 'C',
      confidence:
        typeof item.confidence === 'number' ? Math.min(100, Math.max(0, item.confidence)) : 0,
      complexity: {
        cognitive_load: 'medium',
        time_to_elicit: 'medium',
        expertise_required: 'intermediate',
        ...(typeof item.complexity === 'object' ? item.complexity : {}),
      },
      examples: (() => {
        if (!Array.isArray(item.examples)) return [];
        return (item.examples as Array<unknown>)
          .map((ex) => {
            if (typeof ex === 'string') return ex;
            if (
              ex &&
              typeof ex === 'object' &&
              'scenario' in ex &&
              'application' in ex &&
              'outcome' in ex
            ) {
              return {
                scenario: String((ex as any).scenario || ''),
                application: String((ex as any).application || ''),
                outcome: String((ex as any).outcome || ''),
              } as Example;
            }
            return null;
          })
          .filter((ex): ex is Example | string => ex !== null);
      })(),
      linked_signals: Array.isArray(item.linked_signals) ? (item.linked_signals as Signal[]) : [],
      relationships: Array.isArray(item.relationships)
        ? (item.relationships as Relationship[])
        : [],
      related_frameworks: Array.isArray(item.related_frameworks)
        ? (item.related_frameworks as unknown[]).filter((f): f is string => typeof f === 'string')
        : [],
      citations: Array.isArray(item.citations)
        ? (item.citations as Array<Record<string, unknown>>).map((c) => ({
            author: String(c.author || ''),
            year: String(c.year || ''),
            title: String(c.title || ''),
            source: String(c.source || ''),
          }))
        : [],
      elicitation_methods: Array.isArray(item.elicitation_methods)
        ? (item.elicitation_methods as ElicitationMethod[])
        : [],
      methods: Array.isArray(item.methods)
        ? (item.methods as Array<unknown>).map((method) => ({
            method: String((method as any)?.method || ''),
            description: String((method as any)?.description || ''),
            duration: String((method as any)?.duration || ''),
            difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(
              (method as any)?.difficulty
            )
              ? ((method as any).difficulty as 'Beginner' | 'Intermediate' | 'Advanced')
              : 'Intermediate',
          }))
        : [],
      changelog: Array.isArray(item.changelog)
        ? (item.changelog as Array<unknown>).map((entry) => ({
            version: String((entry as any)?.version || '0.0.1'),
            date: String((entry as any)?.date || new Date().toISOString()),
            changes: String((entry as any)?.changes || 'Initial version'),
          }))
        : [],
      lastUpdated:
        typeof item.lastUpdated === 'string' ? item.lastUpdated : new Date().toISOString(),
      approved: typeof item.approved === 'boolean' ? item.approved : false,
    };

    return narrative;
  }

  /**
   * Validate mental model object
   */
  private validateMentalModel(data: unknown, index: number): MentalModel | null {
    if (!data || typeof data !== 'object') {
      this.errors.push({
        line: index + 1,
        message: 'Invalid mental model data: expected an object',
        severity: 'error',
      });
      return null;
    }

    // Define a type for the raw input data
    type RawMentalModel = Partial<{
      id: unknown;
      name: unknown;
      code: unknown;
      definition: unknown;
      description: unknown;
      category: unknown;
      tags: unknown;
      transformations: unknown;
      transformation: unknown;
      sources: unknown;
      example: unknown;
      complexity: unknown;
      difficulty: unknown;
      lastUpdated: unknown;
    }>;

    const item = data as RawMentalModel;
    const required = ['id', 'name', 'code', 'category'] as const;

    // Check required fields
    for (const field of required) {
      if (!item[field]) {
        this.errors.push({
          line: index + 1,
          field: field as string,
          message: `Missing required field: ${field}`,
          severity: 'error',
        });
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Type validation for required fields
    if (typeof item.id !== 'string') {
      throw new Error('id must be a string');
    }

    if (typeof item.name !== 'string') {
      throw new Error('name must be a string');
    }

    if (typeof item.code !== 'string') {
      throw new Error('code must be a string');
    }

    // Handle transformations - support both 'transformation' and 'transformations' properties
    let transformations: string[] = [];

    if (Array.isArray(item.transformations)) {
      transformations = (item.transformations as unknown[]).filter(
        (t): t is string => typeof t === 'string' && t.length > 0
      );
    } else if (item.transformation && typeof item.transformation === 'string') {
      transformations = [item.transformation as string];
    }

    // Construct proper MentalModel object with all required fields
    const mentalModel: MentalModel = {
      id: item.id as string,
      name: item.name as string,
      code: item.code as string,
      ...(item.definition ? { definition: String(item.definition) } : {}),
      ...(item.description ? { description: String(item.description) } : {}),
      category: item.category as string,
      tags: Array.isArray(item.tags)
        ? (item.tags as unknown[]).filter((t): t is string => typeof t === 'string')
        : [],
      transformations,
      sources: Array.isArray(item.sources)
        ? (item.sources as Array<unknown>)
            .filter((s) => s !== null && s !== undefined)
            .map((s) => ({
              name: (s as any)?.name ? String((s as any).name) : 'Unknown',
              reference: (s as any)?.reference ? String((s as any).reference) : '',
            }))
        : [],
      ...(item.example ? { example: String(item.example) } : {}),
      meta: {
        added: new Date().toISOString(),
        updated: typeof item.lastUpdated === 'string' ? item.lastUpdated : new Date().toISOString(),
        difficulty:
          typeof item.difficulty === 'number'
            ? Math.min(5, Math.max(1, item.difficulty))
            : item.complexity === 'high'
              ? 5
              : item.complexity === 'medium'
                ? 3
                : 1,
        isCore: false,
      },
    };

    return mentalModel;
  }

  /**
   * Import from file
   */
  async importFromFile(
    file: File,
    type: 'narratives' | 'mentalModels'
  ): Promise<ImportResult<Narrative | MentalModel>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error('No content in file');
          }

          const content = event.target.result as string;
          const data = JSON.parse(content) as unknown[];

          if (!Array.isArray(data)) {
            throw new Error('Expected an array of items in the file');
          }

          // Use the appropriate import method based on type
          const result =
            type === 'narratives'
              ? await this.importNarratives(data)
              : await this.importMentalModels(data);

          resolve(result);
        } catch (error) {
          reject(
            new Error(
              `Failed to process file: ${error instanceof Error ? error.message : String(error)}`
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Batch import multiple files
   */
  async batchImport(
    files: File[],
    type: 'narratives' | 'mentalModels'
  ): Promise<ImportResult<Narrative | MentalModel>> {
    const allData: Array<Narrative | MentalModel> = [];
    const allErrors: ImportError[] = [];
    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const startTime = Date.now();

    for (const file of files) {
      try {
        const result = await this.importFromFile(file, type);
        if (result.data) {
          allData.push(...result.data);
        }
        if (result.errors.length > 0) {
          allErrors.push(...result.errors);
        }
        totalImported += result.stats.imported;
        totalSkipped += result.stats.skipped;
        totalFailed += result.stats.failed;
      } catch (error) {
        allErrors.push({
          file: file.name,
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error',
        });
        totalFailed++;
      }
    }

    return {
      success: allErrors.length === 0,
      data: allData,
      errors: allErrors,
      stats: {
        total: files.length,
        imported: totalImported,
        skipped: totalSkipped,
        failed: totalFailed,
        duration: Date.now() - startTime,
      },
    };
  }

  /**
   * Export data to JSON file
   */
  exportToJSON(data: Array<Narrative | MentalModel>, filename: string): void {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error(
        `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Merge content with existing data
   */
  mergeContent<T extends { id?: string; narrative_id?: string }>(
    existing: T[],
    imported: T[],
    strategy: 'replace' | 'skip' | 'merge' = 'replace'
  ): T[] {
    const merged = [...existing];
    const existingMap = new Map<string, T>();

    // Create a map of existing items by ID for quick lookup
    existing.forEach((item) => {
      const id = 'id' in item ? item.id : item.narrative_id;
      if (id) {
        existingMap.set(id, item);
      }
    });

    // Process imported items
    imported.forEach((item) => {
      const id = 'id' in item ? item.id : item.narrative_id;
      if (!id) return;

      if (existingMap.has(id)) {
        // Item exists, handle based on strategy
        switch (strategy) {
          case 'replace': {
            // Replace existing item
            const index = merged.findIndex((m) => {
              const mId = 'id' in m ? m.id : m.narrative_id;
              return mId === id;
            });
            if (index !== -1) {
              merged[index] = item;
            }
            break;
          }
          case 'skip':
            // Skip, keep existing
            break;
          case 'merge': {
            // Merge properties
            const index = merged.findIndex((m) => {
              const mId = 'id' in m ? m.id : m.narrative_id;
              return mId === id;
            });
            if (index !== -1) {
              merged[index] = { ...merged[index], ...item };
            }
            break;
          }
        }
      } else {
        // New item, add it
        merged.push(item);
      }
    });

    return merged;
  }

  /**
   * Get all import errors
   */
  getErrors(): ImportError[] {
    return [...this.errors];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }
}
