// Export validation utilities

import type { Narrative } from '../../cascade/types/narrative';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates JSON export data structure
 */
export function validateJSONExport(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is an array
  if (!Array.isArray(data)) {
    errors.push('Export data must be an array of narratives');
    return { isValid: false, errors, warnings };
  }

  // Check if empty
  if (data.length === 0) {
    warnings.push('Export contains no narratives');
  }

  // Validate each narrative
  data.forEach((item, index) => {
    const itemErrors = validateNarrativeStructure(item, index);
    errors.push(...itemErrors);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a single narrative structure
 */
function validateNarrativeStructure(item: unknown, index: number): string[] {
  const errors: string[] = [];

  if (typeof item !== 'object' || item === null) {
    errors.push(`Item ${index}: Must be an object`);
    return errors;
  }

  const narrative = item as Record<string, unknown>;

  // Required fields
  const requiredFields = ['narrative_id', 'title', 'summary', 'category', 'evidence_quality'];
  requiredFields.forEach((field) => {
    if (!(field in narrative)) {
      errors.push(`Item ${index}: Missing required field '${field}'`);
    }
  });

  // Type checks
  if ('narrative_id' in narrative && typeof narrative.narrative_id !== 'string') {
    errors.push(`Item ${index}: 'narrative_id' must be a string`);
  }
  if ('title' in narrative && typeof narrative.title !== 'string') {
    errors.push(`Item ${index}: 'title' must be a string`);
  }
  if ('summary' in narrative && typeof narrative.summary !== 'string') {
    errors.push(`Item ${index}: 'summary' must be a string`);
  }

  // Array fields
  if ('tags' in narrative && !Array.isArray(narrative.tags)) {
    errors.push(`Item ${index}: 'tags' must be an array`);
  }
  if ('domain' in narrative && !Array.isArray(narrative.domain)) {
    errors.push(`Item ${index}: 'domain' must be an array`);
  }
  if ('citations' in narrative && !Array.isArray(narrative.citations)) {
    errors.push(`Item ${index}: 'citations' must be an array`);
  }

  return errors;
}

/**
 * Validates CSV export format
 */
export function validateCSVExport(csvContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if empty
  if (!csvContent || csvContent.trim().length === 0) {
    errors.push('CSV content is empty');
    return { isValid: false, errors, warnings };
  }

  const lines = csvContent.split('\n').filter((line) => line.trim().length > 0);

  // Check if has at least header
  if (lines.length < 1) {
    errors.push('CSV must have at least a header row');
    return { isValid: false, errors, warnings };
  }

  // Validate header
  const header = lines[0];
  const requiredColumns = ['ID', 'Title', 'Category', 'Evidence Grade', 'Confidence', 'Summary'];

  requiredColumns.forEach((col) => {
    if (!header.includes(col)) {
      errors.push(`CSV header missing required column: '${col}'`);
    }
  });

  // Check data rows
  if (lines.length === 1) {
    warnings.push('CSV contains header but no data rows');
  }

  // Validate column count consistency
  const headerColumns = header.split(',').length;
  for (let i = 1; i < lines.length; i++) {
    const columnCount = lines[i].split(',').length;
    if (columnCount !== headerColumns) {
      errors.push(
        `Row ${i + 1}: Column count mismatch (expected ${headerColumns}, got ${columnCount})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates Markdown export format
 */
export function validateMarkdownExport(markdownContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if empty
  if (!markdownContent || markdownContent.trim().length === 0) {
    errors.push('Markdown content is empty');
    return { isValid: false, errors, warnings };
  }

  // Check for required structure
  if (!markdownContent.includes('# HUMMBL Narratives Export')) {
    warnings.push('Missing expected main title');
  }

  // Check for narrative sections (should have h1 headers)
  const h1Count = (markdownContent.match(/^# [^#]/gm) || []).length;
  if (h1Count < 2) {
    warnings.push('Markdown should contain multiple narrative sections (h1 headers)');
  }

  // Check for metadata
  if (!markdownContent.includes('**Generated:**')) {
    warnings.push('Missing generation timestamp');
  }

  if (!markdownContent.includes('**Total Narratives:**')) {
    warnings.push('Missing narrative count');
  }

  // Check for narrative IDs
  if (!markdownContent.includes('**ID:**')) {
    warnings.push('Missing narrative IDs');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Quick validation helper for all formats
 */
export function validateExport(
  content: string | Narrative[],
  format: 'json' | 'csv' | 'md'
): ValidationResult {
  switch (format) {
    case 'json':
      return validateJSONExport(content);
    case 'csv':
      return typeof content === 'string'
        ? validateCSVExport(content)
        : { isValid: false, errors: ['CSV content must be a string'], warnings: [] };
    case 'md':
      return typeof content === 'string'
        ? validateMarkdownExport(content)
        : { isValid: false, errors: ['Markdown content must be a string'], warnings: [] };
    default:
      return { isValid: false, errors: [`Unknown format: ${format}`], warnings: [] };
  }
}
