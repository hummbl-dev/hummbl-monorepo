import { PositionedElement } from '@hummbl/ui';
import React from 'react';
import type { Base120Model } from '../hooks/useModels';
import './components.css';

interface ModelPreviewProps {
  model: Base120Model;
  position: { x: number; y: number };
  visible: boolean;
}

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return colors[difficulty] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
};

export const ModelPreview: React.FC<ModelPreviewProps> = ({ model, position, visible }) => {
  if (!visible) return null;

  return (
    <PositionedElement
      x={position.x}
      y={position.y}
      className="fixed z-50 w-80 bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl p-4 pointer-events-none model-preview"
    >
      {/* Arrow pointing to card */}
      <div className="absolute -bottom-2 left-6 w-4 h-4 bg-zinc-950 border-r border-b border-zinc-800 transform rotate-45"></div>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-zinc-500">{model.id}</span>
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.35em] px-2 py-0.5 rounded border ${getDifficultyColor(model.difficulty)}`}
            >
              {model.difficulty}
            </span>
            <div className="border border-zinc-800 bg-zinc-950/50 px-1.5 py-0.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-400">
                {model.transformation_code}
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-zinc-100">{model.name}</h3>
        </div>
      </div>

      {/* Description */}
      <div className="mb-3">
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{model.definition}</p>
      </div>

      {/* Tags */}
      <div className="mb-3">
        <p className="text-[9px] font-mono text-zinc-500 mb-1">TAGS:</p>
        <div className="flex flex-wrap gap-1">
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

      {/* Related Models */}
      {model.relatedModels && model.relatedModels.length > 0 && (
        <div className="mb-3">
          <p className="text-[9px] font-mono text-zinc-500 mb-1">RELATED MODELS:</p>
          <div className="flex flex-wrap gap-1">
            {model.relatedModels
              .split(',')
              .slice(0, 3)
              .map((relatedModel: string, index: number) => (
                <span
                  key={index}
                  className="text-[8px] font-mono bg-zinc-800/30 text-zinc-400 px-1.5 py-0.5 rounded"
                >
                  {relatedModel.trim()}
                </span>
              ))}
            {model.relatedModels.split(',').length > 3 && (
              <span className="text-[8px] font-mono text-zinc-500">
                +{model.relatedModels.split(',').length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-zinc-600">
          Base-{model.base_level}
        </span>
        <span className="text-[9px] font-mono text-zinc-500">{model.transformation_name}</span>
      </div>
    </PositionedElement>
  );
};
