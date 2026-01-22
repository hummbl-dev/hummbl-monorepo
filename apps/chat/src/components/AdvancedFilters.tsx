import { useState } from 'react';
import type { Base120Model } from '../hooks/useModels';

interface AdvancedFiltersProps {
  models: Base120Model[];
  onFiltersChange: (filters: AdvancedFilterState) => void;
}

export interface AdvancedFilterState {
  tags: string[];
  baseLevels: number[];
  hasRelatedModels: boolean;
  searchTerm: string;
}

const getAllTags = (models: Base120Model[]): string[] => {
  const allTags = new Set<string>();
  models.forEach(model => {
    model.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
};

const getAllBaseLevels = (models: Base120Model[]): number[] => {
  const levels = new Set<number>();
  models.forEach(model => levels.add(model.base_level));
  return Array.from(levels).sort((a, b) => a - b);
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ models, onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilterState>({
    tags: [],
    baseLevels: [],
    hasRelatedModels: false,
    searchTerm: '',
  });

  const allTags = getAllTags(models);
  const allBaseLevels = getAllBaseLevels(models);

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];

    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBaseLevelToggle = (level: number) => {
    const newLevels = filters.baseLevels.includes(level)
      ? filters.baseLevels.filter(l => l !== level)
      : [...filters.baseLevels, level];

    const newFilters = { ...filters, baseLevels: newLevels };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRelatedModelsToggle = () => {
    const newFilters = { ...filters, hasRelatedModels: !filters.hasRelatedModels };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = {
      tags: [],
      baseLevels: [],
      hasRelatedModels: false,
      searchTerm: '',
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters =
    filters.tags.length > 0 ||
    filters.baseLevels.length > 0 ||
    filters.hasRelatedModels ||
    filters.searchTerm.length > 0;

  const getFilterCount = () => {
    return (
      filters.tags.length +
      filters.baseLevels.length +
      (filters.hasRelatedModels ? 1 : 0) +
      (filters.searchTerm.length > 0 ? 1 : 0)
    );
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
          isOpen
            ? 'bg-zinc-800 border-zinc-600 text-white'
            : hasActiveFilters
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white'
        }`}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Advanced Filters
        {hasActiveFilters && (
          <span className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
            {getFilterCount()}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl w-80 z-50">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-100">Advanced Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label="Close advanced filters"
                  title="Close"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Search Term */}
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">Search Term</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={e => {
                  const newFilters = { ...filters, searchTerm: e.target.value };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
                placeholder="Search in names, descriptions, tags..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">Tags</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {allTags.map(tag => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-3 h-3 text-blue-500 bg-zinc-900 border-zinc-700 rounded"
                    />
                    <span className="text-xs text-zinc-300">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Base Levels */}
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">Base Levels</label>
              <div className="flex flex-wrap gap-2">
                {allBaseLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => handleBaseLevelToggle(level)}
                    className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${
                      filters.baseLevels.includes(level)
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-zinc-900/50 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Related Models */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasRelatedModels}
                  onChange={handleRelatedModelsToggle}
                  className="w-3 h-3 text-blue-500 bg-zinc-900 border-zinc-700 rounded"
                />
                <span className="text-xs text-zinc-300">Only models with related models</span>
              </label>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <p className="text-xs font-mono text-zinc-500 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-1">
                {filters.searchTerm && (
                  <span className="bg-zinc-800 text-zinc-300 text-[8px] px-2 py-1 rounded">
                    Search: "{filters.searchTerm}"
                  </span>
                )}
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-zinc-800 text-zinc-300 text-[8px] px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {filters.baseLevels.map(level => (
                  <span
                    key={level}
                    className="bg-zinc-800 text-zinc-300 text-[8px] px-2 py-1 rounded"
                  >
                    Level {level}
                  </span>
                ))}
                {filters.hasRelatedModels && (
                  <span className="bg-zinc-800 text-zinc-300 text-[8px] px-2 py-1 rounded">
                    Has Related Models
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
