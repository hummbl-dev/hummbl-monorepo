import { useState } from 'react';
import type { Base120Model } from '../hooks/useModels';
import { toast } from './Toast';
import { ModelPreview } from './ModelPreview';

const getTransformationColor = (code: string): string => {
  const colors: Record<string, string> = {
    P: 'border-blue-500/50 bg-blue-500/10',
    IN: 'border-red-500/50 bg-red-500/10',
    CO: 'border-green-500/50 bg-green-500/10',
    DE: 'border-purple-500/50 bg-purple-500/10',
    RE: 'border-orange-500/50 bg-orange-500/10',
    SY: 'border-cyan-500/50 bg-cyan-500/10',
  };
  return colors[code] || 'border-zinc-500/50 bg-zinc-500/10';
};

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return colors[difficulty] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
};

export const ModelCard: React.FC<{ model: Base120Model }> = ({ model }) => {
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);

  const handleSessionStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    void navigator.clipboard
      .writeText(model.system_prompt)
      .then(() => {
        toast.emit(`Protocol [${model.id}] copied to clipboard.`);
      })
      .catch(() => {
        toast.emit('Clipboard unavailable. Please retry.');
      });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <>
      <article
        className={`group relative flex h-full flex-col overflow-hidden rounded-sm border transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-900/40 focus-within:ring-2 focus-within:ring-blue-500/50 ${getTransformationColor(model.transformation_code)}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        aria-labelledby={`model-title-${model.id}`}
        aria-describedby={`model-desc-${model.id}`}
      >
        <div className="p-5 flex-1">
          <div className="mb-4 flex items-start justify-between">
            <span
              className="font-mono text-[10px] text-zinc-500 transition-colors group-hover:text-zinc-300"
              aria-label={`Model ID: ${model.id}`}
            >
              {model.id}
            </span>
            <div className="flex items-center gap-2" aria-label="Model metadata">
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.35em] px-2 py-0.5 rounded border ${getDifficultyColor(model.difficulty)}`}
                aria-label={`Difficulty: ${model.difficulty}`}
              >
                {model.difficulty}
              </span>
              <div className="border border-zinc-800 bg-zinc-950/50 px-1.5 py-0.5">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-400"
                  aria-label={`Transformation: ${model.transformation_code}`}
                >
                  {model.transformation_code}
                </span>
              </div>
            </div>
          </div>

          <h3
            id={`model-title-${model.id}`}
            className="mb-2 text-lg font-medium tracking-tight text-zinc-100 transition-colors group-hover:text-white"
          >
            {model.name}
          </h3>
          <p
            id={`model-desc-${model.id}`}
            className="text-xs leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400 line-clamp-3"
          >
            {model.definition}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1" aria-label="Tags">
            {model.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-[8px] font-mono bg-zinc-800/50 text-zinc-400 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 3 && (
              <span
                className="text-[8px] font-mono text-zinc-500"
                aria-label={`and ${model.tags.length - 3} more tags`}
              >
                +{model.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/50 bg-zinc-950/30 p-3 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.35em] text-zinc-600"
            aria-label={`Base level ${model.base_level}`}
          >
            Base-{model.base_level}
          </span>
          <button
            type="button"
            onClick={handleSessionStart}
            className="flex items-center gap-1 font-mono text-[10px] text-zinc-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            aria-label={`Copy system prompt for ${model.name} to clipboard`}
          >
            OPEN SESSION
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14 5l7 7m0 0-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </article>

      <ModelPreview model={model} position={previewPosition} visible={showPreview} />
    </>
  );
};
