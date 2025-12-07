import { useState, useEffect } from 'react';
import type { Base120Model } from '../hooks/useModels';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import './components.css';

interface ProgressTrackerProps {
  models: Base120Model[];
  completedModels: string[];
  onModelComplete: (modelId: string) => void;
  onModelUncomplete: (modelId: string) => void;
}

const PROGRESS_KEY = 'hummbl-progress';

interface ProgressData {
  completedModels: string[];
  lastUpdated: string;
  streakDays: number;
  totalSessions: number;
}

const getTransformationStats = (models: Base120Model[], completedIds: string[]) => {
  const stats: Record<string, { total: number; completed: number }> = {};

  models.forEach(model => {
    if (!stats[model.transformation_code]) {
      stats[model.transformation_code] = { total: 0, completed: 0 };
    }
    stats[model.transformation_code].total++;
    if (completedIds.includes(model.id)) {
      stats[model.transformation_code].completed++;
    }
  });

  return stats;
};

const getDifficultyStats = (models: Base120Model[], completedIds: string[]) => {
  const stats: Record<string, { total: number; completed: number }> = {
    beginner: { total: 0, completed: 0 },
    intermediate: { total: 0, completed: 0 },
    advanced: { total: 0, completed: 0 },
  };

  models.forEach(model => {
    stats[model.difficulty].total++;
    if (completedIds.includes(model.id)) {
      stats[model.difficulty].completed++;
    }
  });

  return stats;
};

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  models,
  completedModels,
  onModelComplete,
  onModelUncomplete,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { user, token } = useAuth();
  const { getProgress, addProgress, removeProgress } = useProgress();

  // Load progress from API for authenticated users
  useEffect(() => {
    if (user && token) {
      getProgress().then(apiProgress => {
        // Sync API progress with local state if different
        const currentSet = new Set(completedModels);
        const apiSet = new Set(apiProgress);

        // Add models from API that aren't in local state
        apiProgress.forEach(modelId => {
          if (!currentSet.has(modelId)) {
            onModelComplete(modelId);
          }
        });

        // Remove models from local state that aren't in API
        completedModels.forEach(modelId => {
          if (!apiSet.has(modelId)) {
            onModelUncomplete(modelId);
          }
        });
      });
    }
  }, [user, token, completedModels, getProgress, onModelComplete, onModelUncomplete]);

  // Use authenticated progress if user is logged in, otherwise use localStorage
  const getProgressData = (): ProgressData => {
    if (user && token) {
      // For authenticated users, progress will be managed via API calls
      return {
        completedModels,
        lastUpdated: new Date().toISOString(),
        streakDays: 0,
        totalSessions: 0,
      };
    }

    // Fallback to localStorage for non-authenticated users
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      return savedProgress
        ? JSON.parse(savedProgress)
        : {
            completedModels,
            lastUpdated: new Date().toISOString(),
            streakDays: 0,
            totalSessions: 0,
          };
    } catch (error) {
      console.error('Failed to parse progress data:', error);
      return {
        completedModels,
        lastUpdated: new Date().toISOString(),
        streakDays: 0,
        totalSessions: 0,
      };
    }
  };

  const [progressData, setProgressData] = useState<ProgressData>(getProgressData);

  const saveProgress = async (newCompleted: string[]) => {
    const newData: ProgressData = {
      completedModels: newCompleted,
      lastUpdated: new Date().toISOString(),
      streakDays: progressData.streakDays + (newCompleted.length > completedModels.length ? 1 : 0),
      totalSessions: progressData.totalSessions + 1,
    };

    if (user && token) {
      // Save progress to API for authenticated users
      const currentSet = new Set(completedModels);
      const newSet = new Set(newCompleted);

      // Add new models to API
      for (const modelId of newCompleted) {
        if (!currentSet.has(modelId)) {
          await addProgress(modelId);
        }
      }

      // Remove models from API
      for (const modelId of completedModels) {
        if (!newSet.has(modelId)) {
          await removeProgress(modelId);
        }
      }
    } else {
      // Save to localStorage for non-authenticated users
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(newData));
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }

    setProgressData(newData);
  };

  const toggleModelCompletion = (modelId: string) => {
    const isCompleted = completedModels.includes(modelId);
    const newCompleted = isCompleted
      ? completedModels.filter(id => id !== modelId)
      : [...completedModels, modelId];

    saveProgress(newCompleted);

    if (isCompleted) {
      onModelUncomplete(modelId);
    } else {
      onModelComplete(modelId);
    }
  };

  const completionRate = (completedModels.length / models.length) * 100;
  const transformationStats = getTransformationStats(models, completedModels);
  const difficultyStats = getDifficultyStats(models, completedModels);

  const getCompletionColor = (rate: number): string => {
    if (rate >= 80) return 'text-emerald-400';
    if (rate >= 50) return 'text-amber-400';
    if (rate >= 25) return 'text-orange-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-light text-zinc-100">Progress Tracker</h2>
        <p className="text-xs font-mono text-zinc-500 tracking-[0.3em]">YOUR LEARNING JOURNEY</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-sm p-6">
        <div className="text-center mb-4">
          <div className={`text-3xl font-light ${getCompletionColor(completionRate)}`}>
            {completionRate.toFixed(1)}%
          </div>
          <p className="text-sm text-zinc-400 mt-1">Complete</p>
          <p className="text-xs font-mono text-zinc-500 mt-2">
            {completedModels.length} of {models.length} models mastered
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500 progress-bar-fill"
            style={{ '--progress-width': `${completionRate}%` } as React.CSSProperties}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-light text-zinc-100">{progressData.streakDays}</div>
            <p className="text-xs text-zinc-500">Day Streak</p>
          </div>
          <div>
            <div className="text-lg font-light text-zinc-100">{progressData.totalSessions}</div>
            <p className="text-xs text-zinc-500">Sessions</p>
          </div>
          <div>
            <div className="text-lg font-light text-zinc-100">
              {Object.values(transformationStats).filter(s => s.completed === s.total).length}/6
            </div>
            <p className="text-xs text-zinc-500">Transformations</p>
          </div>
          <div>
            <div className="text-lg font-light text-zinc-100">
              {Object.values(difficultyStats).filter(s => s.completed === s.total).length}/3
            </div>
            <p className="text-xs text-zinc-500">Difficulties</p>
          </div>
        </div>
      </div>

      {/* Transformation Progress */}
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-sm p-4">
        <h3 className="text-sm font-medium text-zinc-100 mb-3">Transformation Progress</h3>
        <div className="space-y-3">
          {Object.entries(transformationStats).map(([code, stats]) => {
            const percentage = (stats.completed / stats.total) * 100;
            const transformationNames: Record<string, string> = {
              P: 'Perspective',
              IN: 'Inversion',
              CO: 'Composition',
              DE: 'Decomposition',
              RE: 'Recursion',
              SY: 'Systems',
            };

            return (
              <div key={code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-zinc-400">
                    {code} - {transformationNames[code]}
                  </span>
                  <span className="font-mono text-zinc-500">
                    {stats.completed}/{stats.total}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300 transformation-progress"
                    style={{ '--transformation-progress': `${percentage}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty Progress */}
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-sm p-4">
        <h3 className="text-sm font-medium text-zinc-100 mb-3">Difficulty Progress</h3>
        <div className="space-y-3">
          {Object.entries(difficultyStats).map(([difficulty, stats]) => {
            const percentage = (stats.completed / stats.total) * 100;
            const colors: Record<string, string> = {
              beginner: 'bg-emerald-500',
              intermediate: 'bg-amber-500',
              advanced: 'bg-rose-500',
            };

            return (
              <div key={difficulty} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-zinc-400 capitalize">{difficulty}</span>
                  <span className="font-mono text-zinc-500">
                    {stats.completed}/{stats.total}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1">
                  <div
                    className={`${colors[difficulty]} h-1 rounded-full transition-all duration-300 difficulty-progress`}
                    style={{ '--difficulty-progress': `${percentage}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggle Details Button */}
      <div className="text-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono py-2 px-4 rounded transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Model Details
        </button>
      </div>

      {/* Detailed Model List */}
      {showDetails && (
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-sm p-4">
          <h3 className="text-sm font-medium text-zinc-100 mb-3">Model Completion Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {models.map(model => {
              const isCompleted = completedModels.includes(model.id);
              return (
                <div
                  key={model.id}
                  className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
                    isCompleted
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'
                  }`}
                  onClick={() => toggleModelCompletion(model.id)}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isCompleted ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600'
                    }`}
                  >
                    {isCompleted && (
                      <svg
                        className="w-2 h-2 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
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
                    <h4 className="text-xs font-medium text-zinc-100">{model.name}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
