// Citation link generation utilities

import type { Citation } from '@cascade/types/narrative';

/**
 * Generates a Google Scholar search URL for a citation
 */
export function generateScholarUrl(citation: Citation): string {
  const query = `${citation.author} ${citation.title} ${citation.year}`;
  const encoded = encodeURIComponent(query.trim());
  return `https://scholar.google.com/scholar?q=${encoded}`;
}

/**
 * Generates a direct link to the source if it's a known URL pattern
 * This could be extended to handle DOIs, arXiv IDs, etc.
 */
export function getDirectSourceUrl(citation: Citation): string | null {
  const source = citation.source.toLowerCase();

  // Check for DOI in source
  const doiMatch = source.match(/doi:\s*([^\s,]+)/i);
  if (doiMatch) {
    return `https://doi.org/${doiMatch[1]}`;
  }

  // Check for arXiv
  const arxivMatch = source.match(/arxiv:\s*([^\s,]+)/i);
  if (arxivMatch) {
    return `https://arxiv.org/abs/${arxivMatch[1]}`;
  }

  // Check if source is already a URL
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return citation.source;
  }

  return null;
}

/**
 * Formats citation for APA-style display
 */
export function formatCitationAPA(citation: Citation): string {
  return `${citation.author} (${citation.year}). ${citation.title}. ${citation.source}`;
}

/**
 * Copies citation to clipboard in APA format
 */
export async function copyCitationToClipboard(citation: Citation): Promise<boolean> {
  try {
    const formatted = formatCitationAPA(citation);
    await navigator.clipboard.writeText(formatted);
    return true;
  } catch (error) {
    console.error('Failed to copy citation:', error);
    return false;
  }
}
