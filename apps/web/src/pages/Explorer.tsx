import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useModels } from '../hooks/useModels';
import { ModelCard } from '../components/ModelCard';
import { StatusStrip } from '../components/StatusStrip';
import { TransformationOverview } from '../components/TransformationOverview';
import { LearningPaths } from '../components/LearningPaths';
import { ProgressTracker } from '../components/ProgressTracker';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { ModelComparison } from '../components/ModelComparison';
import { FavoritesSystem } from '../components/FavoritesSystem';
import { ToastProvider } from '../components/Toast';

type TransformationFilter = 'all' | 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export const Explorer: React.FC = () => {
  const { models, isLoading, error } = useModels();
  const [search, setSearch] = useState('');
  const [transformationFilter, setTransformationFilter] = useState<TransformationFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [activeTab, setActiveTab] = useState<'explorer' | 'paths' | 'progress'>('explorer');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [completedModels, setCompletedModels] = useState<string[]>([]);
  const [selectedPathModels, setSelectedPathModels] = useState<string[]>([]);

  // Memoize callbacks to prevent infinite re-renders
  const handleModelComplete = useCallback((modelId: string) => {
    setCompletedModels(prev => [...prev, modelId]);
  }, []);

  const handleModelUncomplete = useCallback((modelId: string) => {
    setCompletedModels(prev => prev.filter(id => id !== modelId));
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-xs font-mono text-zinc-500 animate-pulse tracking-[0.3em]">
        INITIALIZING BASE120…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-xs font-mono text-red-500">
        SYSTEM FAILURE: CONNECTION REFUSED — {error.toUpperCase()}
      </div>
    );
  }

  const filtered =
    models.filter(model => {
      const query = search.toLowerCase();

      // Search filter
      const matchesSearch =
        model.name.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query) ||
        model.tags.some(tag => tag.toLowerCase().includes(query)) ||
        model.definition.toLowerCase().includes(query);

      // Transformation filter
      const matchesTransformation =
        transformationFilter === 'all' || model.transformation_code === transformationFilter;

      // Difficulty filter
      const matchesDifficulty = difficultyFilter === 'all' || model.difficulty === difficultyFilter;

      // Learning path filter
      const matchesPath = selectedPathModels.length === 0 || selectedPathModels.includes(model.id);

      return matchesSearch && matchesTransformation && matchesDifficulty && matchesPath;
    }) ?? [];

  const hasActiveFilters =
    search ||
    transformationFilter !== 'all' ||
    difficultyFilter !== 'all' ||
    selectedPathModels.length > 0;
  const starterModels = !hasActiveFilters
    ? models.filter(model => model.base_level === 6).slice(0, 3)
    : [];

  const clearFilters = () => {
    setSearch('');
    setTransformationFilter('all');
    setDifficultyFilter('all');
    setSelectedPathModels([]);
  };

  const handleTransformationSelect = (code: string) => {
    setTransformationFilter(code as TransformationFilter);
    // Scroll to models section
    setTimeout(() => {
      const element = document.getElementById('models-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePathSelect = (modelIds: string[]) => {
    setActiveTab('explorer');
    setSelectedPathModels(modelIds);
    setTransformationFilter('all');
    setDifficultyFilter('all');
    setSearch('');
    setTimeout(() => {
      const element = document.getElementById('models-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      <ToastProvider />
      <StatusStrip totalModels={filtered.length} activeFilter={search} />

      {/* Global Components */}
      <FavoritesSystem models={models} onFavoritesChange={() => {}} />

      {selectedForComparison.length > 0 && (
        <ModelComparison
          models={models}
          selectedModels={selectedForComparison}
          onModelRemove={(modelId: string) =>
            setSelectedForComparison(prev => prev.filter(id => id !== modelId))
          }
          onClearAll={() => setSelectedForComparison([])}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: 'explorer', label: 'Explorer' },
          { id: 'paths', label: 'Learning Paths' },
          { id: 'progress', label: 'Progress' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'explorer' | 'paths' | 'progress')}
            className={`px-6 py-3 text-sm font-mono uppercase tracking-[0.35em] border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-zinc-400 text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'explorer' && (
        <div className="space-y-12">
          {/* Search and Filters */}
          <div className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search models, descriptions, or tags..."
                className="w-full bg-zinc-900/50 border border-zinc-800 px-6 py-3 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-900 transition-all font-light rounded-sm"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">
                  CMD + K
                </span>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center justify-between">
              <AdvancedFilters models={models} onFiltersChange={() => {}} />
            </div>
          </div>

          {/* Transformation Overview */}
          {!hasActiveFilters && (
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500 mb-2">
                  Framework Overview
                </h2>
                <p className="text-[10px] font-mono text-zinc-600">
                  Click any transformation to explore its models
                </p>
              </div>
              <TransformationOverview
                models={models}
                onTransformationSelect={handleTransformationSelect}
              />
            </section>
          )}

          {/* Filter Controls */}
          <div className="space-y-6" id="models-section">
            {/* Transformation Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500">
                  Transformations
                </h3>
                {transformationFilter !== 'all' && (
                  <button
                    onClick={() => setTransformationFilter('all')}
                    className="text-[10px] font-mono text-zinc-400 underline underline-offset-4 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {[
                  { code: 'all', name: 'All', color: 'bg-zinc-600' },
                  { code: 'P', name: 'Perspective', color: 'bg-blue-600' },
                  { code: 'IN', name: 'Inversion', color: 'bg-red-600' },
                  { code: 'CO', name: 'Composition', color: 'bg-green-600' },
                  { code: 'DE', name: 'Decomposition', color: 'bg-purple-600' },
                  { code: 'RE', name: 'Recursion', color: 'bg-orange-600' },
                  { code: 'SY', name: 'Systems', color: 'bg-cyan-600' },
                ].map(({ code, name, color }) => (
                  <button
                    key={code}
                    onClick={() => setTransformationFilter(code as TransformationFilter)}
                    className={`px-3 py-2 text-[10px] font-mono uppercase tracking-[0.35em] rounded transition-all ${
                      transformationFilter === code
                        ? `${color} text-white border-${color.split('-')[1]}-400`
                        : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500">
                  Difficulty
                </h3>
                {difficultyFilter !== 'all' && (
                  <button
                    onClick={() => setDifficultyFilter('all')}
                    className="text-[10px] font-mono text-zinc-400 underline underline-offset-4 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { code: 'all', name: 'All', color: 'bg-zinc-600' },
                  { code: 'beginner', name: 'Beginner', color: 'bg-emerald-600' },
                  { code: 'intermediate', name: 'Intermediate', color: 'bg-amber-600' },
                  { code: 'advanced', name: 'Advanced', color: 'bg-rose-600' },
                ].map(({ code, name, color }) => (
                  <button
                    key={code}
                    onClick={() => setDifficultyFilter(code as DifficultyFilter)}
                    className={`px-3 py-2 text-[10px] font-mono uppercase tracking-[0.35em] rounded transition-all ${
                      difficultyFilter === code
                        ? `${color} text-white border-${color.split('-')[1]}-400`
                        : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800 rounded-sm p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">Active Filters:</span>
                  <div className="flex gap-2">
                    {search && (
                      <span className="text-[9px] font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                        Search: "{search}"
                      </span>
                    )}
                    {transformationFilter !== 'all' && (
                      <span className="text-[9px] font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                        {transformationFilter}
                      </span>
                    )}
                    {difficultyFilter !== 'all' && (
                      <span className="text-[9px] font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                        {difficultyFilter}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-mono text-zinc-400 underline underline-offset-4 hover:text-white"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {!hasActiveFilters && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500">
                  Starter Protocols (Base-6)
                </h2>
                <span className="text-[10px] font-mono text-zinc-600">Recommended Entry</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {starterModels.map(model => (
                  <Link key={model.id} to={`/model/${model.id}`} className="block h-full">
                    <ModelCard model={model} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500">
                {selectedPathModels.length > 0
                  ? 'Learning Path'
                  : hasActiveFilters
                    ? 'Filtered Results'
                    : 'Full Inventory'}
              </h2>
              {hasActiveFilters && (
                <span className="text-[10px] font-mono text-zinc-600">
                  {filtered.length} of {models.length}
                </span>
              )}
              {selectedPathModels.length > 0 && (
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {selectedPathModels.length} models
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map(model => (
                <Link key={model.id} to={`/model/${model.id}`} className="block h-full">
                  <ModelCard model={model} />
                </Link>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full rounded-sm border border-dashed border-zinc-800 py-20 text-center">
                  <p className="text-sm font-mono text-zinc-500 mb-4">NO MATCHING PATTERNS FOUND</p>
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-zinc-600">
                      Try adjusting your filters or search terms
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-zinc-400 underline underline-offset-4 hover:text-white"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'paths' && <LearningPaths models={models} onPathSelect={handlePathSelect} />}

      {activeTab === 'progress' && (
        <ProgressTracker
          models={models}
          completedModels={completedModels}
          onModelComplete={handleModelComplete}
          onModelUncomplete={handleModelUncomplete}
        />
      )}
    </div>
  );
};
