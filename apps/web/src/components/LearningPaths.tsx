import { ProgressBar } from '@hummbl/ui';
import React, { useState } from 'react';
import type { Base120Model } from '../hooks/useModels';
import './components.css';

interface LearningPathsProps {
  models: Base120Model[];
  onPathSelect: (modelIds: string[]) => void;
}

const learningPaths = {
  base6: {
    name: 'Base6 (Foundational)',
    description:
      'Tier 1: Tool User (Beginner). Master 6 core mental models for 60-70% of everyday problems. Focus on single-model application with structured guidance.',
    models: ['P1', 'IN1', 'CO1', 'DE1', 'RE1', 'SY1'],
    estimatedTime: '20-40 hours over 3-6 months',
    difficulty: 'beginner',
    rationale:
      'One foundational model from each transformation (P, IN, CO, DE, RE, SY) establishing complete toolkit coverage. Target: Tier 1 problems (Simple, 0-9 points).',
  },
  base12: {
    name: 'Base12 (Emerging Practitioner)',
    description:
      'Tier 2: Integrator (Intermediate). Expand to 12 models covering 75-85% of professional scenarios. Learn to combine 2-3 models for complicated problems.',
    models: ['P1', 'P2', 'P3', 'IN1', 'IN2', 'CO1', 'CO2', 'DE1', 'DE2', 'RE1', 'RE2', 'SY1'],
    estimatedTime: '60-120 hours over 6-12 months',
    difficulty: 'intermediate',
    rationale:
      'Base6 foundation + 6 additional models for systems thinking, strategic planning, collaboration, and innovation. Target: Tier 2-3 problems (Complicated to Complex, 10-19 points).',
  },
  base24: {
    name: 'Base24 (Professional Standard)',
    description:
      'Tier 3: Architect (Advanced). Professional-level problem-solving with 24 models. Master multi-model approaches for complex problems and mentor others.',
    models: [
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
      'IN1',
      'IN2',
      'IN3',
      'IN4',
      'CO1',
      'CO2',
      'CO3',
      'CO4',
      'DE1',
      'DE2',
      'DE3',
      'DE4',
      'RE1',
      'RE2',
      'RE3',
      'RE4',
      'SY1',
      'SY2',
    ],
    estimatedTime: '200-300 hours over 12-18 months',
    difficulty: 'advanced',
    rationale:
      'Comprehensive professional toolkit with deeper coverage across all transformations. Target: Tier 3 problems (Complex, 15-19 points) and basic Tier 4 exposure.',
  },
  base42: {
    name: 'Base42 (Expert Level)',
    description:
      'Tier 4: Creator (Master). Expert-level capabilities with 42 models. Advanced synthesis, domain specialization, and handling wicked problems.',
    models: [
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
      'P8',
      'P9',
      'P10',
      'IN1',
      'IN2',
      'IN3',
      'IN4',
      'IN5',
      'IN6',
      'IN7',
      'CO1',
      'CO2',
      'CO3',
      'CO4',
      'CO5',
      'CO6',
      'CO7',
      'DE1',
      'DE2',
      'DE3',
      'DE4',
      'DE5',
      'DE6',
      'DE7',
      'RE1',
      'RE2',
      'RE3',
      'RE4',
      'RE5',
      'RE6',
      'RE7',
      'SY1',
      'SY2',
      'SY3',
      'SY4',
      'SY5',
      'SY6',
    ],
    estimatedTime: '400-500 hours over 18-24 months',
    difficulty: 'advanced',
    rationale:
      'Expert-level mastery with advanced synthesis capabilities. Target: Tier 4 problems (Wicked, 20-24 points) and Tier 5 introduction.',
  },
  base120: {
    name: 'BASE120 (Complete Framework)',
    description:
      'Complete framework mastery with all 120 mental models. Ultimate problem-solving capability for super-wicked problems and domain leadership.',
    models: [
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
      'P8',
      'P9',
      'P10',
      'P11',
      'P12',
      'P13',
      'P14',
      'P15',
      'P16',
      'P17',
      'P18',
      'P19',
      'P20',
      'IN1',
      'IN2',
      'IN3',
      'IN4',
      'IN5',
      'IN6',
      'IN7',
      'IN8',
      'IN9',
      'IN10',
      'IN11',
      'IN12',
      'IN13',
      'IN14',
      'IN15',
      'IN16',
      'IN17',
      'IN18',
      'IN19',
      'IN20',
      'CO1',
      'CO2',
      'CO3',
      'CO4',
      'CO5',
      'CO6',
      'CO7',
      'CO8',
      'CO9',
      'CO10',
      'CO11',
      'CO12',
      'CO13',
      'CO14',
      'CO15',
      'CO16',
      'CO17',
      'CO18',
      'CO19',
      'CO20',
      'DE1',
      'DE2',
      'DE3',
      'DE4',
      'DE5',
      'DE6',
      'DE7',
      'DE8',
      'DE9',
      'DE10',
      'DE11',
      'DE12',
      'DE13',
      'DE14',
      'DE15',
      'DE16',
      'DE17',
      'DE18',
      'DE19',
      'DE20',
      'RE1',
      'RE2',
      'RE3',
      'RE4',
      'RE5',
      'RE6',
      'RE7',
      'RE8',
      'RE9',
      'RE10',
      'RE11',
      'RE12',
      'RE13',
      'RE14',
      'RE15',
      'RE16',
      'RE17',
      'RE18',
      'RE19',
      'RE20',
      'SY1',
      'SY2',
      'SY3',
      'SY4',
      'SY5',
      'SY6',
      'SY7',
      'SY8',
      'SY9',
      'SY10',
      'SY11',
      'SY12',
      'SY13',
      'SY14',
      'SY15',
      'SY16',
      'SY17',
      'SY18',
      'SY19',
      'SY20',
    ],
    estimatedTime: '800-1000+ hours over 3-5 years',
    difficulty: 'advanced',
    rationale:
      'Complete HUMMBL Base120 framework for ultimate problem-solving capability. Target: All problem tiers including Tier 5 (Super-Wicked, 25-30 points).',
  },
};

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    mixed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return colors[difficulty] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
};

export const LearningPaths: React.FC<LearningPathsProps> = ({ models, onPathSelect }) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handlePathSelect = (pathKey: string) => {
    const path = learningPaths[pathKey as keyof typeof learningPaths];
    setSelectedPath(pathKey);
    onPathSelect(path.models);
  };

  const getPathModels = (modelIds: string[]) => {
    return models.filter(m => modelIds.includes(m.id));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-light text-zinc-100">Learning Paths</h2>
        <p className="text-xs font-mono text-zinc-500 tracking-[0.3em]">
          STRUCTURED LEARNING JOURNEYS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(learningPaths).map(([key, path]) => {
          const pathModels = getPathModels(path.models);
          const isHovered = hoveredPath === key;
          const isSelected = selectedPath === key;

          return (
            <div
              key={key}
              className={`relative p-4 border rounded-sm transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : isHovered
                    ? 'border-zinc-600 bg-zinc-900/40'
                    : 'border-zinc-800 bg-zinc-900/20'
              }`}
              onMouseEnter={() => setHoveredPath(key)}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => handlePathSelect(key)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-zinc-100 mb-1">{path.name}</h3>
                  <p className="text-xs text-zinc-400 mb-2">{path.description}</p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                    <span>{pathModels.length} models</span>
                    <span>•</span>
                    <span>{path.estimatedTime}</span>
                  </div>
                  {path.rationale && (
                    <div className="mt-2 p-2 bg-zinc-800/30 rounded text-[9px] font-mono text-zinc-500 border border-zinc-800/50">
                      <span className="text-zinc-400">Why:</span> {path.rationale}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.35em] px-2 py-0.5 rounded border ${getDifficultyColor(path.difficulty)}`}
                >
                  {path.difficulty}
                </span>
              </div>

              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Progress</span>
                  <span>0/{pathModels.length}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1">
                  <ProgressBar
                    width={0}
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Model preview on hover */}
              {isHovered && (
                <div className="absolute z-50 bg-zinc-950 border border-zinc-800 rounded-sm p-3 shadow-2xl min-w-[200px] top-full mt-2 left-0">
                  <p className="text-[9px] font-mono text-zinc-500 mb-2">Models in this path:</p>
                  <div className="space-y-1">
                    {pathModels.slice(0, 3).map(model => (
                      <div key={model.id} className="text-[10px] font-mono text-zinc-300">
                        {model.id}: {model.name}
                      </div>
                    ))}
                    {pathModels.length > 3 && (
                      <div className="text-[9px] font-mono text-zinc-500">
                        +{pathModels.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPath && (
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-100">
              {learningPaths[selectedPath as keyof typeof learningPaths].name} Models
            </h3>
            <button
              onClick={() => {
                setSelectedPath(null);
                onPathSelect([]);
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Clear Selection
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {getPathModels(learningPaths[selectedPath as keyof typeof learningPaths].models).map(
              model => (
                <div
                  key={model.id}
                  className="bg-zinc-950/50 border border-zinc-800 rounded-sm p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] text-zinc-500">{model.id}</span>
                    <span
                      className={`text-[8px] font-bold uppercase tracking-[0.35em] px-1.5 py-0.5 rounded border ${
                        model.difficulty === 'beginner'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : model.difficulty === 'intermediate'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {model.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-zinc-100 mb-1">{model.name}</h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-2">{model.definition}</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
