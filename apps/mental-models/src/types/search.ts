import { MentalModel } from './mental-model';
import { Narrative } from './narrative';

/**
 * Represents a single match found during a search operation
 */
export interface SearchMatch {
  /** Field name where the match was found */
  field: string;
  /** The matched value */
  value: string;
  /** Match score (0-1) */
  score: number;
  /** Array of highlighted text snippets */
  highlights: string[];
}

/**
 * Represents a search result item with its score and match details
 */
export interface SearchResult<T = MentalModel | Narrative> {
  /** The matched item */
  item: T;
  /** Overall match score (0-1) */
  score: number;
  /** Array of individual field matches */
  matches: SearchMatch[];
}

/**
 * Configuration options for search operations
 */
export interface SearchOptions {
  /** Fields to search in */
  fields?: string[];
  /** Minimum score threshold for matches (0-1) */
  threshold?: number;
  /** Whether to include the match score in results */
  includeScore?: boolean;
  /** Whether to include match information */
  includeMatches?: boolean;
  /** Minimum number of characters required for a match */
  minMatchCharLength?: number;
  /** Whether to sort results by score */
  shouldSort?: boolean;
  /** Maximum number of results to return */
  limit?: number;
}

/**
 * Type guard to check if an item is a search result
 */
export function isSearchResult<T>(item: unknown): item is SearchResult<T> {
  return (
    typeof item === 'object' &&
    item !== null &&
    'item' in item &&
    'score' in item &&
    'matches' in item
  );
}

/**
 * Type for search filter functions
 */
export type SearchFilter<T> = (item: T) => boolean;

/**
 * Type for search sort functions
 */
export type SearchSorter<T> = (a: T, b: T) => number;
