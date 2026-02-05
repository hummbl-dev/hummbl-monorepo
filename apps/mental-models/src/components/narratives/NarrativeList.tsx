// Narrative list component

import { useState } from 'react';
import { useNarratives } from '../../hooks/useNarratives';
import { useNarrativeFilters, type FilterOptions } from '../../hooks/useNarrativeFilters';
import { NarrativeCard } from './NarrativeCard';
import { NarrativeCardSkeleton } from './NarrativeCardSkeleton';
import { NarrativeHero } from './NarrativeHero';
import { NarrativeDetailModal } from './NarrativeDetailModal';
import { NarrativeFilters } from './NarrativeFilters';
import type { Narrative } from '../../../cascade/types/narrative';
import './NarrativeList.css';

export function NarrativeList() {
  const { narratives, loading, error, refetch } = useNarratives();
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    category: null,
    evidenceGrade: null,
    complexityLevel: null,
    sortBy: 'default',
    sortDirection: 'desc',
  });

  // Apply filters
  const { filteredNarratives, resultCount, totalCount } = useNarrativeFilters(narratives, filters);

  // Extract unique categories
  const categories = Array.from(new Set(narratives.map((n) => n.category))).sort();

  const handleCardClick = (narrative: Narrative) => {
    setSelectedNarrative(narrative);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Wait for animation to complete before clearing selected narrative
    setTimeout(() => setSelectedNarrative(null), 200);
  };

  if (loading) {
    return (
      <>
        <NarrativeHero narrativeCount={0} />
        <div className="narrative-list-container">
          <div className="narrative-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <NarrativeCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="narrative-error">
        <div className="error-icon" aria-hidden="true">
          ⚠️
        </div>
        <h2 className="error-title">Unable to Load Narratives</h2>
        <p className="error-message">
          {error.message || 'An unexpected error occurred while loading the narratives.'}
        </p>
        <button className="error-retry-button" onClick={refetch}>
          Try Again
        </button>
      </div>
    );
  }

  if (narratives.length === 0) {
    return (
      <>
        <NarrativeHero narrativeCount={0} />
        <div className="narrative-empty">
          <div className="empty-state-icon" aria-hidden="true">
            📚
          </div>
          <h2 className="empty-state-title">No Narratives Found</h2>
          <p className="empty-state-description">
            There are currently no narratives available. Please check back later.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <NarrativeHero narrativeCount={narratives.length} />

      {/* Narrative List */}
      <div className="narrative-list-container">
        {/* Filters */}
        <NarrativeFilters
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={resultCount}
          totalCount={totalCount}
          categories={categories}
          narratives={filteredNarratives}
        />

        {/* Narrative Grid */}
        {filteredNarratives.length > 0 ? (
          <div className="narrative-grid">
            {filteredNarratives.map((narrative) => (
              <NarrativeCard
                key={narrative.narrative_id}
                narrative={narrative}
                onClick={() => handleCardClick(narrative)}
              />
            ))}
          </div>
        ) : (
          <div className="narrative-empty">
            <div className="empty-state-icon" aria-hidden="true">
              🔍
            </div>
            <h2 className="empty-state-title">No Narratives Found</h2>
            <p className="empty-state-description">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <NarrativeDetailModal
        narrative={selectedNarrative}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
