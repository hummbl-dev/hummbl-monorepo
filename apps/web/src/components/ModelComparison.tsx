import { useState } from 'react';
import type { Base120Model } from '../hooks/useModels';
import { toast } from './Toast';

interface ModelComparisonProps {
  models: Base120Model[];
  selectedModels: string[];
  onModelRemove: (modelId: string) => void;
  onClearAll: () => void;
}

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

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  models,
  selectedModels,
  onModelRemove,
  onClearAll,
}) => {
  const [showComparison, setShowComparison] = useState(false);

  const comparisonModels = models.filter(m => selectedModels.includes(m.id));

  const handleCopyComparison = () => {
    const comparisonText = comparisonModels
      .map(
        model =>
          `${model.id}: ${model.name}\nTransformation: ${model.transformation_name}\nDifficulty: ${model.difficulty}\nDescription: ${model.definition}\nTags: ${model.tags.join(', ')}\n`
      )
      .join('\n---\n');

    void navigator.clipboard.writeText(comparisonText).then(() => {
      toast.emit('Comparison copied to clipboard.');
    });
  };

  if (selectedModels.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-4 shadow-2xl max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-100">
            Model Comparison ({selectedModels.length})
          </h3>
          <button
            onClick={onClearAll}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Clear comparison"
            title="Clear comparison"
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

        <div className="space-y-2 mb-3">
          {comparisonModels.map(model => (
            <div key={model.id} className="flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-400">{model.id}</span>
              <span className="text-zinc-300 truncate max-w-[150px]">{model.name}</span>
              <button
                onClick={() => onModelRemove(model.id)}
                className="text-zinc-500 hover:text-red-400 transition-colors"
                aria-label={`Remove ${model.name} from comparison`}
                title="Remove from comparison"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono py-2 px-3 rounded transition-colors"
          >
            {showComparison ? 'Hide' : 'Show'} Details
          </button>
          <button
            onClick={handleCopyComparison}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono py-2 px-3 rounded transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {showComparison && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowComparison(false)}
        >
          <div
            className="bg-zinc-950 border border-zinc-800 rounded-sm p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-zinc-100">Model Comparison</h2>
              <button
                onClick={() => setShowComparison(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close comparison details"
                title="Close"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonModels.map(model => (
                <div
                  key={model.id}
                  className={`border rounded-sm p-4 ${getTransformationColor(model.transformation_code)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-100">{model.name}</h3>
                      <p className="text-xs font-mono text-zinc-500">{model.id}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-[0.35em] px-2 py-0.5 rounded border ${getDifficultyColor(model.difficulty)}`}
                    >
                      {model.difficulty}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-mono text-zinc-500">Transformation:</span>
                      <span className="text-zinc-300 ml-2">{model.transformation_name}</span>
                    </div>
                    <div>
                      <span className="font-mono text-zinc-500">Base Level:</span>
                      <span className="text-zinc-300 ml-2">{model.base_level}</span>
                    </div>
                    <div>
                      <span className="font-mono text-zinc-500">Description:</span>
                      <p className="text-zinc-300 mt-1 leading-relaxed">{model.definition}</p>
                    </div>
                    <div>
                      <span className="font-mono text-zinc-500">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {model.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-[8px] font-mono bg-zinc-800/50 text-zinc-400 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
