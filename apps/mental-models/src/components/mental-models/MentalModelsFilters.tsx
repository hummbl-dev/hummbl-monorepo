import { useState, useEffect } from 'react';
import './MentalModelsFilters.css';

export interface FilterOptions {
  searchTerm: string;
  category: string | null;
  transformation: string | null;
  sortBy: 'name-asc' | 'name-desc' | 'difficulty-asc' | 'difficulty-desc';
}

interface MentalModelsFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  resultCount: number;
  totalCount: number;
  categories: string[];
  transformations: string[];
}

export function MentalModelsFilters({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
  categories,
  transformations,
}: MentalModelsFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        onFiltersChange({ ...filters, searchTerm: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleClearSearch = () => {
    setSearchInput('');
    onFiltersChange({ ...filters, searchTerm: '' });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      category: e.target.value || null,
    });
  };

  const handleTransformationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      transformation: e.target.value || null,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as FilterOptions['sortBy'],
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({
      searchTerm: '',
      category: null,
      transformation: null,
      sortBy: 'name-asc',
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.category ||
    filters.transformation ||
    filters.sortBy !== 'name-asc';

  return (
    <div className="mm-filters">
      <div className="mm-filters-row">
        {/* Search Bar */}
        <div className="mm-search-box">
          <input
            type="search"
            className="mm-search-input"
            placeholder="Search mental models..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search mental models"
          />
          {searchInput && (
            <button
              className="mm-search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mm-filter-group">
          <label htmlFor="category-filter" className="mm-filter-label">
            Category
          </label>
          <select
            id="category-filter"
            className="mm-filter-select"
            value={filters.category || ''}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Transformation Filter */}
        <div className="mm-filter-group">
          <label htmlFor="transformation-filter" className="mm-filter-label">
            Transformation
          </label>
          <select
            id="transformation-filter"
            className="mm-filter-select"
            value={filters.transformation || ''}
            onChange={handleTransformationChange}
          >
            <option value="">All Types</option>
            {transformations.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="mm-filter-group">
          <label htmlFor="sort-filter" className="mm-filter-label">
            Sort By
          </label>
          <select
            id="sort-filter"
            className="mm-filter-select"
            value={filters.sortBy}
            onChange={handleSortChange}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="difficulty-asc">Difficulty (Low-High)</option>
            <option value="difficulty-desc">Difficulty (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="mm-filters-footer">
        <div className="mm-result-count">
          Showing <strong>{resultCount}</strong> of <strong>{totalCount}</strong> mental models
        </div>
        {hasActiveFilters && (
          <button className="mm-clear-filters" onClick={handleClearFilters}>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
