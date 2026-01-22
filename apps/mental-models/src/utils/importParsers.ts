// Import parsers for exported data

import type { Narrative } from '../../cascade/types/narrative';
import { validateJSONExport } from './exportValidation';

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Parses JSON export back into Narrative array
 */
export function parseJSONImport(jsonContent: string): ParseResult<Narrative[]> {
  try {
    const parsed = JSON.parse(jsonContent);

    // Validate structure
    const validation = validateJSONExport(parsed);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    return {
      success: true,
      data: parsed as Narrative[],
    };
  } catch (error) {
    return {
      success: false,
      error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parses CSV export back into Narrative array
 */
export function parseCSVImport(csvContent: string): ParseResult<Narrative[]> {
  try {
    const lines = csvContent.split('\n').filter((line) => line.trim().length > 0);

    if (lines.length < 1) {
      return {
        success: false,
        error: 'CSV is empty',
      };
    }

    const headerRow = parseCSVRow(lines[0]);
    const header = headerRow.map((h) => cleanCSVValue(h));

    // Find column indices
    const indices = {
      id: header.findIndex((h) => h.includes('ID')),
      title: header.findIndex((h) => h.includes('Title')),
      category: header.findIndex((h) => h.includes('Category')),
      grade: header.findIndex((h) => h.includes('Evidence Grade') || h.includes('Grade')),
      confidence: header.findIndex((h) => h.includes('Confidence')),
      summary: header.findIndex((h) => h.includes('Summary')),
      domains: header.findIndex((h) => h.includes('Domains')),
      tags: header.findIndex((h) => h.includes('Tags')),
    };

    const narratives: Partial<Narrative>[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);

      const narrative: Partial<Narrative> = {
        narrative_id: indices.id >= 0 ? cleanCSVValue(row[indices.id] || '') : '',
        title: indices.title >= 0 ? cleanCSVValue(row[indices.title] || '') : '',
        category: indices.category >= 0 ? cleanCSVValue(row[indices.category] || '') : '',
        evidence_quality: (indices.grade >= 0 ? cleanCSVValue(row[indices.grade] || '') : 'B') as
          | 'A'
          | 'B'
          | 'C',
        confidence:
          indices.confidence >= 0
            ? parseFloat(cleanCSVValue(row[indices.confidence] || '0')) / 100
            : 0,
        summary: indices.summary >= 0 ? cleanCSVValue(row[indices.summary] || '') : '',
        domain:
          indices.domains >= 0
            ? cleanCSVValue(row[indices.domains] || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        tags:
          indices.tags >= 0
            ? cleanCSVValue(row[indices.tags] || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
      };

      narratives.push(narrative);
    }

    return {
      success: true,
      data: narratives as Narrative[],
    };
  } catch (error) {
    return {
      success: false,
      error: `CSV parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse a CSV row handling quoted values
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Clean CSV value (remove quotes, trim)
 */
function cleanCSVValue(value: string): string {
  return value
    .replace(/^"(.*)"$/, '$1')
    .replace(/""/g, '"')
    .trim();
}

/**
 * Parses Markdown export back into Narrative array
 * Note: This is a simplified parser for basic structure
 */
export function parseMarkdownImport(markdownContent: string): ParseResult<Narrative[]> {
  try {
    const narratives: Partial<Narrative>[] = [];

    // Match all h1 headers that are NOT "HUMMBL Narratives Export"
    const headerRegex = /^#\s+(?!HUMMBL)(.+)$/gm;
    const headers: Array<{ title: string; index: number }> = [];

    let match;
    while ((match = headerRegex.exec(markdownContent)) !== null) {
      headers.push({
        title: match[1].trim(),
        index: match.index,
      });
    }

    // Extract sections between headers
    for (let i = 0; i < headers.length; i++) {
      const start = headers[i].index;
      const end = i < headers.length - 1 ? headers[i + 1].index : markdownContent.length;
      const section = markdownContent.slice(start, end);

      const narrative = parseMarkdownSection(section);
      if (narrative) {
        narratives.push(narrative);
      }
    }

    if (narratives.length === 0) {
      return {
        success: false,
        error: 'No narratives found in markdown',
      };
    }

    return {
      success: true,
      data: narratives as Narrative[],
    };
  } catch (error) {
    return {
      success: false,
      error: `Markdown parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse a single markdown narrative section
 */
function parseMarkdownSection(section: string): Partial<Narrative> | null {
  const lines = section.split('\n');
  const titleLine = lines[0]?.trim();

  if (!titleLine) return null;

  // Remove "# " prefix from title
  const title = titleLine.replace(/^#\s*/, '').trim();

  const narrative: Partial<Narrative> = {
    title,
  };

  // Extract metadata - more flexible regex patterns
  const idMatch = section.match(/\*\*ID:\*\*\s*`?([^`\n]+)`?/);
  if (idMatch) narrative.narrative_id = idMatch[1].trim();

  const categoryMatch = section.match(/\*\*Category:\*\*\s*([^\n]+)/);
  if (categoryMatch) narrative.category = categoryMatch[1].trim();

  const gradeMatch = section.match(/\*\*Evidence Grade:\*\*\s*([ABC])/);
  if (gradeMatch) narrative.evidence_quality = gradeMatch[1] as 'A' | 'B' | 'C';

  const confidenceMatch = section.match(/\*\*Confidence:\*\*\s*(\d+)%/);
  if (confidenceMatch) narrative.confidence = parseInt(confidenceMatch[1]) / 100;

  // Extract summary - more flexible multiline matching
  const summaryMatch = section.match(/##\s*Summary\s*\n+([^#]+?)(?=\n##|\n\n---|\n*$)/s);
  if (summaryMatch) narrative.summary = summaryMatch[1].trim();

  // Extract domains
  const domainsMatch = section.match(/##\s*Domains\s*\n+((?:- [^\n]+\n?)+)/);
  if (domainsMatch) {
    narrative.domain = domainsMatch[1]
      .split('\n')
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);
  }

  // Extract tags
  const tagsMatch = section.match(/##\s*Tags\s*\n+([^\n]+)/);
  if (tagsMatch) {
    narrative.tags = tagsMatch[1]
      .split(',')
      .map((tag) => tag.replace(/`/g, '').trim())
      .filter(Boolean);
  }

  return narrative;
}

/**
 * Helper to compare two narratives for round-trip testing
 */
export function compareNarratives(original: Narrative, parsed: Narrative): string[] {
  const differences: string[] = [];

  // Required fields
  if (original.narrative_id !== parsed.narrative_id) {
    differences.push(`ID mismatch: ${original.narrative_id} !== ${parsed.narrative_id}`);
  }
  if (original.title !== parsed.title) {
    differences.push(`Title mismatch: ${original.title} !== ${parsed.title}`);
  }
  if (original.category !== parsed.category) {
    differences.push(`Category mismatch: ${original.category} !== ${parsed.category}`);
  }
  if (original.evidence_quality !== parsed.evidence_quality) {
    differences.push(
      `Evidence quality mismatch: ${original.evidence_quality} !== ${parsed.evidence_quality}`
    );
  }

  // Summary (may have whitespace differences)
  if (original.summary.trim() !== parsed.summary?.trim()) {
    differences.push('Summary content differs');
  }

  // Arrays (check length and content)
  if (original.tags && parsed.tags) {
    if (original.tags.length !== parsed.tags.length) {
      differences.push(`Tags count mismatch: ${original.tags.length} !== ${parsed.tags.length}`);
    }
  }

  return differences;
}
