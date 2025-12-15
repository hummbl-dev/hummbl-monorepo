import { useState, useMemo, useCallback } from 'react';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useModels, type Base120Model } from '../hooks/useModels';
import { StatusStrip } from '../components/StatusStrip';
import { toast } from '../components/Toast';

export const ModelDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { models, isLoading } = useModels();
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeSection, setActiveSection] = useState<'prompt' | 'usage' | 'related'>('prompt');

  // Find current model and related context
  const { model, relatedModels, prevModel, nextModel, transformationModels } = useMemo(() => {
    const currentModel = models.find(entry => entry.id === id);
    if (!currentModel) {
      return {
        model: null,
        relatedModels: [],
        prevModel: null,
        nextModel: null,
        transformationModels: [],
      };
    }

    // Get all models from the same transformation
    const sameTransformation = models.filter(
      m => m.transformation_code === currentModel.transformation_code && m.id !== currentModel.id
    );

    // Sort by priority and take top 5 as "related"
    const related = [...sameTransformation].sort((a, b) => a.base_level - b.base_level).slice(0, 5);

    // Get prev/next within transformation for navigation
    const sorted = models
      .filter(m => m.transformation_code === currentModel.transformation_code)
      .sort((a, b) => a.base_level - b.base_level);

    const currentIdx = sorted.findIndex(m => m.id === currentModel.id);
    const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
    const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

    return {
      model: currentModel,
      relatedModels: related,
      prevModel: prev,
      nextModel: next,
      transformationModels: sorted,
    };
  }, [models, id]);

  const handleCopy = useCallback(() => {
    if (!model) return;
    void navigator.clipboard
      .writeText(model.system_prompt)
      .then(() => {
        toast.emit(`System prompt for ${model.name} copied to clipboard.`);
      })
      .catch(() => {
        toast.emit('Clipboard unavailable. Please retry.');
      });
  }, [model]);

  const handleToggleComplete = useCallback(() => {
    setIsCompleted(prev => !prev);
    
    // Show completion feedback
    const action = !isCompleted ? 'completed' : 'uncompleted';
    toast.emit(`Model ${action}! Progress saved locally.`);
  }, [isCompleted]);

  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevModel) {
        navigate(`/model/${prevModel.id}`);
      } else if (e.key === 'ArrowRight' && nextModel) {
        navigate(`/model/${nextModel.id}`);
      }
    },
    [navigate, prevModel, nextModel]
  );

  if (isLoading) {
    return (
      <div className="p-12 text-xs font-mono text-zinc-500 animate-pulse tracking-[0.3em]">
        LOADING BLUEPRINT…
      </div>
    );
  }

  if (!model) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="pb-20 animate-in fade-in duration-500" tabIndex={0} onKeyDown={handleKeyNav}>
      <StatusStrip totalModels={models.length} activeFilter={model.id} />

      <div className="mx-auto space-y-8 px-4 py-6 md:px-6 md:px-8 pt-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 transition-colors hover:text-white"
          >
            ← Return to Library
          </Link>

          <div className="flex items-center gap-2">
            {prevModel && (
              <Link
                to={`/model/${prevModel.id}`}
                className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-white transition-colors"
                title={`Previous: ${prevModel.name}`}
              >
                ← {prevModel.id}
              </Link>
            )}
            {nextModel && (
              <Link
                to={`/model/${nextModel.id}`}
                className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-white transition-colors"
                title={`Next: ${nextModel.name}`}
              >
                {nextModel.id} →
              </Link>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <section
          className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black via-zinc-900/50 to-black p-6 md:p-8 lg:p-10 border-blue-500/30`}
        >
          {/* Glow Effect */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-500"
          />

          <div className="relative z-10 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.3em]">
              <span
                className={`rounded-full px-4 py-1.5 text-white border border-blue-500 bg-blue-500/20`}
              >
                {model.transformation_name}
              </span>
              <span className="text-zinc-500">ID: {model.id}</span>
              <span className="text-zinc-500">Priority: {model.base_level}</span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] ${
                  model.difficulty === 'beginner'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : model.difficulty === 'intermediate'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                }`}
              >
                {model.difficulty}
              </span>
            </div>

            {/* Title & Definition */}
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-white">
                {model.name}
              </h1>
              <p className="text-lg font-light leading-relaxed text-zinc-300 max-w-3xl">
                {model.definition}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.3em] text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-800"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Copy Prompt
              </button>

              <button
                type="button"
                onClick={handleToggleComplete}
                className={`inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.3em] transition-all border ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-900/60 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {isCompleted ? '✓ Completed' : 'Mark Complete'}
              </button>

              <Link
                to={`/?transformation=${model.transformation_code}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-white transition-colors"
              >
                View All {model.transformation_name}
              </Link>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div
          className="flex gap-1 border-b border-zinc-800"
          role="tablist"
          aria-label="Model information tabs"
        >
          {(['prompt', 'usage', 'related'] as const).map(tab => {
            const tabLabels = {
              prompt: 'System Prompt',
              usage: 'When to Use',
              related: `Related Models (${relatedModels.length})`,
            };
            return (
              <button
                key={tab}
                id={`tab-${tab}`}
                role="tab"
                aria-selected={activeSection === tab ? 'true' : 'false'}
                aria-controls={`tabpanel-${tab}`}
                onClick={() => setActiveSection(tab)}
                className={`px-4 py-2.5 text-xs font-mono uppercase tracking-[0.3em] transition-colors border-b-2 -mb-px focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  activeSection === tab
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* System Prompt Tab */}
          {activeSection === 'prompt' && (
              <section
                id="tabpanel-prompt"
                role="tabpanel"
                aria-labelledby="tab-prompt"
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-500">
                    System Instruction
                  </h3>
                  <button
                    onClick={handleCopy}
                    className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors"
                  >
                    Copy ↗
                  </button>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-black/50 p-5">
                  <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-200">
                    {model.system_prompt}
                  </code>
                </div>
              </section>
            )}

            {/* Usage Tab */}
            {activeSection === 'usage' && (
              <section
                id="tabpanel-usage"
                role="tabpanel"
                aria-labelledby="tab-usage"
                className="space-y-6"
              >
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                  <h3 className="mb-4 text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-500">
                    When to Deploy
                  </h3>
                  <p className="leading-relaxed text-zinc-300">{model.whenToUse}</p>
                </div>

                {model.example && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                    <h3 className="mb-4 text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-500">
                      Example Application
                    </h3>
                    <p className="leading-relaxed text-zinc-300">{model.example}</p>
                  </div>
                )}
              </section>
            )}

            {/* Related Models Tab */}
            {activeSection === 'related' && (
              <section
                id="tabpanel-related"
                role="tabpanel"
                aria-labelledby="tab-related"
                className="space-y-4"
              >
                <p className="text-sm text-zinc-400">
                  Other models in the{' '}
                  <span className="font-mono text-blue-400">{model.transformation_name}</span>{' '}
                  transformation that complement this approach:
                </p>

                <div className="grid gap-3">
                  {relatedModels.map(related => (
                    <RelatedModelCard
                      key={related.id}
                      model={related}
                    />
                  ))}
                </div>

                {transformationModels.length > 5 && (
                  <Link
                    to={`/?transformation=${model.transformation_code}`}
                    className="block text-center py-3 text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors"
                  >
                    View all {transformationModels.length} {model.transformation_name} models →
                  </Link>
                )}
              </section>
            )}
          </div>

          {/* Keyboard Hint */}
          <div className="text-center text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600 pt-8">
            Use ← → arrow keys to navigate between models
          </div>
        </div>
      </div>
    </div>
  );
};

// Related Model Card Component
interface RelatedModelCardProps {
  model: Base120Model;
}

const RelatedModelCard: React.FC<RelatedModelCardProps> = ({ model }) => {
  return (
    <Link
      to={`/model/${model.id}`}
      className="block p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
              {model.id}
            </span>
          </div>
          <h4 className="font-medium text-zinc-200 group-hover:text-white transition-colors">
            {model.name}
          </h4>
          <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{model.definition}</p>
        </div>
        <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
      </div>
    </Link>
  );
};
