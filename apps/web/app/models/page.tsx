import Link from 'next/link';
import { getAllModels, TRANSFORMATIONS, type TransformationType } from '@hummbl/core';
import { Search } from 'lucide-react';

export default function ModelsPage({
  searchParams,
}: {
  searchParams: { transformation?: string };
}) {
  const transformationFilter = searchParams.transformation as TransformationType | undefined;

  // Get all models from core package
  const allModels = getAllModels();

  // Filter models if transformation is selected
  const models = transformationFilter
    ? allModels.filter(m => m.transformation === transformationFilter)
    : allModels;

  // Minimalist monochrome priority classes
  const getPriorityClasses = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-white text-black border border-white'; // High contrast for P1
      case 2:
        return 'bg-black text-neutral-300 border border-neutral-600';
      case 3:
        return 'bg-black text-neutral-500 border border-neutral-800';
      default:
        return 'bg-black text-neutral-500 border border-neutral-800';
    }
  };

  return (
    <div className="min-h-screen py-12 bg-black">
      {/* Header */}
      <div className="mb-12 py-12 text-center border-b border-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Mental Models Library
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Explore {models.length}{' '}
            {transformationFilter ? TRANSFORMATIONS[transformationFilter].name : ''} mental models
            {transformationFilter ? '' : ' across 6 transformations'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Transformation Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Link
            href="/models"
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
              !transformationFilter
                ? 'bg-white text-black border-white'
                : 'bg-black text-neutral-400 border-neutral-800 hover:border-white hover:text-white'
            }`}
          >
            All Models
          </Link>
          {Object.values(TRANSFORMATIONS).map(t => (
            <Link
              key={t.code}
              href={`/models?transformation=${t.code}`}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                transformationFilter === t.code
                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500'
                  : 'bg-black text-neutral-400 border-neutral-800 hover:border-white hover:text-white'
              }`}
            >
              <span className="opacity-70 mr-2 font-mono">{t.code}</span>
              {t.name}
            </Link>
          ))}
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {models.map((model, index) => (
            <Link
              key={model.code}
              href={`/models/${model.code}`}
              className="group block animate-in"
              style={{ animationDelay: `${(index % 9) * 0.05}s` }}
            >
              <div className="h-full p-6 bg-black border border-neutral-800 hover:border-white transition-colors">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`px-2.5 py-1 rounded text-xs font-bold ${getPriorityClasses(model.priority)}`}
                  >
                    {model.code}
                  </div>
                  <span className="px-2.5 py-1 rounded bg-black text-neutral-400 text-xs font-bold border border-neutral-800">
                    {TRANSFORMATIONS[model.transformation].code}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">
                  {model.name}
                </h3>

                {/* Definition */}
                <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-4">
                  {model.definition}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 border-t border-neutral-900 pt-4 mt-auto">
                  <span>Priority {model.priority}</span>
                  {model.priority === 1 && (
                    <span className="text-emerald-500 font-bold ml-auto">Essential</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {models.length === 0 && (
          <div className="text-center py-20">
            <Search className="mx-auto mb-4 text-neutral-700" size={48} />
            <p className="text-neutral-500 text-lg">No models found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
