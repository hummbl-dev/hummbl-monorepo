// Narrative export utilities

import type { Narrative } from '../../cascade/types/narrative';

/**
 * Export narratives as JSON file
 */
export function exportToJSON(narratives: Narrative[], filename: string = 'narratives.json'): void {
  const dataStr = JSON.stringify(narratives, null, 2);
  downloadFile(dataStr, filename, 'application/json');
}

/**
 * Export narratives as CSV file
 */
export function exportToCSV(narratives: Narrative[], filename: string = 'narratives.csv'): void {
  const headers = [
    'ID',
    'Title',
    'Category',
    'Evidence Grade',
    'Confidence',
    'Summary',
    'Domains',
    'Tags',
    'Complexity Load',
    'Complexity Time',
    'Complexity Expertise',
    'Signals Count',
    'Relations Count',
    'Citations Count',
  ];

  const rows = narratives.map((n: Narrative) => [
    n.narrative_id,
    `"${n.title.replace(/"/g, '""')}"`,
    n.category,
    n.evidence_quality,
    n.confidence || 0,
    `"${(n.summary || '').replace(/"/g, '""')}"`,
    `"${n.domain?.join(', ') || ''}"`,
    `"${n.tags?.join(', ') || ''}"`,
    n.complexity?.cognitive_load || '',
    n.complexity?.time_to_elicit || '',
    n.complexity?.expertise_required || '',
    n.linked_signals?.length || 0,
    n.relationships?.length || 0,
    n.citations?.length || 0,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export narratives as Markdown file
 */
export function exportToMarkdown(
  narratives: Narrative[],
  filename: string = 'narratives.md'
): void {
  const markdown = narratives.map((n: Narrative) => {
    const lines = [
      `# ${n.title}`,
      '',
      `**ID:** \`${n.narrative_id}\`  `,
      `**Category:** ${n.category}  `,
      `**Evidence Grade:** ${n.evidence_quality}  `,
      `**Confidence:** ${n.confidence ? (n.confidence * 100).toFixed(0) : '0'}%`,
      '',
      '## Summary',
      '',
      (typeof n.summary === 'string' ? n.summary : '').trim(),
      '',
    ];

    if (n.complexity) {
      lines.push(
        '## Complexity',
        '',
        `- **Cognitive Load:** ${n.complexity.cognitive_load}`,
        `- **Time to Elicit:** ${n.complexity.time_to_elicit}`,
        `- **Expertise Required:** ${n.complexity.expertise_required}`,
        ''
      );
    }

    if (n.domain && n.domain.length > 0) {
      lines.push('## Domains', '', n.domain?.map((d: string) => `- ${d}`).join('\n'), '');
    }

    if (n.tags && n.tags.length > 0) {
      lines.push('## Tags', '', n.tags.map((t: string) => `\`${t}\``).join(', '), '');
    }

    if (n.citations && n.citations.length > 0) {
      lines.push(
        '## Citations',
        '',
        ...n.citations.map((c: { author: string; year: number | string; title: string; source: string }, idx: number) => {
          // Handle both string and number years
          const year = typeof c.year === 'number' ? c.year : c.year.toString();
          return `${idx + 1}. ${c.author} (${year}). *${c.title}*. ${c.source}`;
        }),
        ''
      );
    }

    if (n.examples && n.examples.length > 0) {
      lines.push('## Examples', '');
      n.examples.forEach(
        (ex: string | { scenario: string; application: string; outcome: string }, idx: number) => {
          lines.push(
            `### Example ${idx + 1}`,
            '',
            `**Scenario:** ${typeof ex === 'string' ? ex : ex.scenario}`,
            `**Application:** ${typeof ex === 'string' ? '' : ex.application}`,
            `**Outcome:** ${typeof ex === 'string' ? '' : ex.outcome}`,
            ''
          );
        }
      );
    }

    if (n.elicitation_methods && n.elicitation_methods.length > 0) {
      lines.push(
        '## Elicitation Methods',
        '',
        ...n.elicitation_methods.map(
          (m: { method: string; duration: string; difficulty: string }) =>
            `- **${m.method}**: ${m.duration} (${m.difficulty} difficulty)`
        ),
        ''
      );
    }

    if (n.relationships && n.relationships.length > 0) {
      lines.push(
        '## Relationships',
        '',
        ...(n.relationships || []).map(
          (r: { type: string; target: string; description: string }) =>
            `- **${r.type}** → ${r.target}: ${r.description}`
        ),
        ''
      );
    }

    lines.push('---', '');
    return lines.join('\n');
  });

  const markdownContent = [
    `# HUMMBL Narratives Export`,
    '',
    `**Generated:** ${new Date().toISOString()}  `,
    `**Total Narratives:** ${narratives.length}`,
    '',
    '---',
    '',
    ...markdown,
  ].join('\n');

  downloadFile(markdownContent, filename, 'text/markdown');
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get export filename with timestamp
 */
export function getExportFilename(
  format: 'json' | 'csv' | 'md',
  prefix: string = 'hummbl-narratives'
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}.${format}`;
}
