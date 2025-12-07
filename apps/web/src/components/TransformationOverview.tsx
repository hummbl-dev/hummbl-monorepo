import { useState } from 'react';
import type { Base120Model } from '../hooks/useModels';
import { ProgressBar } from './ui/ProgressBar';
import './components.css';

interface TransformationOverviewProps {
  models: Base120Model[];
  onTransformationSelect: (code: string) => void;
}

const transformationInfo = {
  P: {
    name: 'Perspective',
    description: 'Frame, name, shift POV',
    color: 'border-blue-500 bg-blue-500/10',
    textColor: 'text-blue-400',
    icon: '👁️',
  },
  IN: {
    name: 'Inversion',
    description: 'Reverse assumptions, work backward',
    color: 'border-red-500 bg-red-500/10',
    textColor: 'text-red-400',
    icon: '🔄',
  },
  CO: {
    name: 'Composition',
    description: 'Build up, combine, integrate parts',
    color: 'border-green-500 bg-green-500/10',
    textColor: 'text-green-400',
    icon: '🔗',
  },
  DE: {
    name: 'Decomposition',
    description: 'Break down, modularize, separate',
    color: 'border-purple-500 bg-purple-500/10',
    textColor: 'text-purple-400',
    icon: '🧩',
  },
  RE: {
    name: 'Recursion',
    description: 'Self-reference, repetition, iteration',
    color: 'border-orange-500 bg-orange-500/10',
    textColor: 'text-orange-400',
    icon: '🔁',
  },
  SY: {
    name: 'Systems',
    description: 'Meta-systems, patterns, emergence',
    color: 'border-cyan-500 bg-cyan-500/10',
    textColor: 'text-cyan-400',
    icon: '🌐',
  },
};

export const TransformationOverview: React.FC<TransformationOverviewProps> = ({
  models,
  onTransformationSelect,
}) => {
  const [hoveredTransformation, setHoveredTransformation] = useState<string | null>(null);

  const getTransformationStats = (code: string) => {
    const transformationModels = models.filter(m => m.transformation_code === code);
    const beginnerCount = transformationModels.filter(m => m.difficulty === 'beginner').length;
    const intermediateCount = transformationModels.filter(
      m => m.difficulty === 'intermediate'
    ).length;
    const advancedCount = transformationModels.filter(m => m.difficulty === 'advanced').length;

    return {
      total: transformationModels.length,
      beginner: beginnerCount,
      intermediate: intermediateCount,
      advanced: advancedCount,
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-light text-zinc-100">HUMMBL Base120 Framework</h2>
        <p className="text-xs font-mono text-zinc-500 tracking-[0.3em]">
          6 TRANSFORMATIONS × 20 MODELS = 120 MENTAL MODELS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(transformationInfo).map(([code, info]) => {
          const stats = getTransformationStats(code);
          const isHovered = hoveredTransformation === code;

          return (
            <div
              key={code}
              className={`relative p-4 border rounded-sm transition-all duration-300 cursor-pointer transformation-card ${
                isHovered
                  ? `${info.color} border-opacity-100 transform scale-105`
                  : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-600'
              }`}
              onMouseEnter={() => setHoveredTransformation(code)}
              onMouseLeave={() => setHoveredTransformation(null)}
              onClick={() => onTransformationSelect(code)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={`text-sm font-medium ${info.textColor}`}>{info.name}</h3>
                  <p className="text-[10px] font-mono text-zinc-500">{code}</p>
                </div>
                <div
                  className={`text-[10px] font-mono px-2 py-1 rounded ${info.color} ${info.textColor}`}
                >
                  {stats.total} models
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{info.description}</p>

              {/* Difficulty Breakdown */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-zinc-500">Difficulty:</span>
                  <span className="text-zinc-400">
                    {stats.beginner}B / {stats.intermediate}I / {stats.advanced}A
                  </span>
                </div>

                {/* Visual difficulty bars */}
                <div className="flex gap-1 h-1">
                  {stats.beginner > 0 && (
                    <ProgressBar
                      width={(stats.beginner / stats.total) * 100}
                      className="bg-emerald-500 rounded-sm"
                    />
                  )}
                  {stats.intermediate > 0 && (
                    <ProgressBar
                      width={(stats.intermediate / stats.total) * 100}
                      className="bg-amber-500 rounded-sm"
                    />
                  )}
                  {stats.advanced > 0 && (
                    <ProgressBar
                      width={(stats.advanced / stats.total) * 100}
                      className="bg-rose-500 rounded-sm"
                    />
                  )}
                </div>
              </div>

              {/* Hover state - show sample models */}
              {isHovered && (
                <div className="absolute z-50 bg-zinc-950 border border-zinc-800 rounded-sm p-4 shadow-2xl min-w-[280px] max-w-[320px] hover-preview">
                  <div className="absolute -bottom-2 left-4 w-4 h-4 bg-zinc-950 border-r border-b border-zinc-800 transform rotate-45"></div>
                  <p className="text-[9px] font-mono text-zinc-500 mb-2">Sample Models:</p>
                  <div className="space-y-1">
                    {models
                      .filter(m => m.transformation_code === code)
                      .slice(0, 3)
                      .map(model => (
                        <div key={model.id} className="text-[10px] font-mono text-zinc-300">
                          {model.id}: {model.name}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-[9px] font-mono text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>
          <span>Beginner</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
          <span>Intermediate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-rose-500 rounded-sm"></div>
          <span>Advanced</span>
        </div>
      </div>
    </div>
  );
};
