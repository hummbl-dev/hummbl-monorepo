import { useState, useEffect } from 'react';
import type { Base120Model } from '../hooks/useModels';

interface FavoritesSystemProps {
  models: Base120Model[];
  onFavoritesChange: (favorites: string[]) => void;
}

const FAVORITES_KEY = 'hummbl-favorites';

export const FavoritesSystem: React.FC<FavoritesSystemProps> = ({ models, onFavoritesChange }) => {
  // Initialize state from localStorage directly
  const getInitialFavorites = (): string[] => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_KEY);
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (error) {
      console.error('Failed to parse favorites from localStorage:', error);
      localStorage.removeItem(FAVORITES_KEY);
      return [];
    }
  };

  const [favorites, setFavorites] = useState<string[]>(getInitialFavorites);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    onFavoritesChange(favorites);
  }, [favorites, onFavoritesChange]);

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    onFavoritesChange(newFavorites);
  };

  const toggleFavorite = (modelId: string) => {
    const newFavorites = favorites.includes(modelId)
      ? favorites.filter(id => id !== modelId)
      : [...favorites, modelId];
    saveFavorites(newFavorites);
  };

  const clearAllFavorites = () => {
    saveFavorites([]);
  };

  const favoriteModels = models.filter(m => favorites.includes(m.id));

  const categories = {
    All: favoriteModels,
    Perspective: favoriteModels.filter(m => m.transformation_code === 'P'),
    Inversion: favoriteModels.filter(m => m.transformation_code === 'IN'),
    Composition: favoriteModels.filter(m => m.transformation_code === 'CO'),
    Decomposition: favoriteModels.filter(m => m.transformation_code === 'DE'),
    Recursion: favoriteModels.filter(m => m.transformation_code === 'RE'),
    Systems: favoriteModels.filter(m => m.transformation_code === 'SY'),
  };

  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={() => setShowFavorites(!showFavorites)}
        className="bg-zinc-950 border border-zinc-800 rounded-sm p-3 shadow-2xl hover:border-zinc-600 transition-colors"
        aria-label="Toggle favorites panel"
        title="Favorites"
      >
        <svg
          className="w-5 h-5 text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.682a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.682c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.682a1 1 0 0 0-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .95-.69l1.519-4.682z"
          />
        </svg>
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-mono rounded-full w-4 h-4 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {showFavorites && (
        <div className="absolute top-full mt-2 right-0 bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl w-80 max-h-[60vh] overflow-y-auto">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-100">Favorites ({favorites.length})</h3>
              {favorites.length > 0 && (
                <button
                  onClick={clearAllFavorites}
                  className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                  aria-label="Clear all favorites"
                  title="Clear all"
                >
                  Clear All
                </button>
              )}
            </div>

            {favorites.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {Object.keys(categories).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {category} ({categories[category as keyof typeof categories].length})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4">
            {favorites.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">
                No favorites yet. Click the star icon on models to add them here.
              </p>
            ) : (
              <div className="space-y-3">
                {categories[selectedCategory as keyof typeof categories].map(model => (
                  <div key={model.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-zinc-500">{model.id}</span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-[0.35em] px-2 py-0.5 rounded border ${
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
                      <h4 className="text-sm font-medium text-zinc-100">{model.name}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2">{model.definition}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(model.id)}
                      className="ml-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                      aria-label={`Remove ${model.name} from favorites`}
                      title="Remove from favorites"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.682a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.682c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.682a1 1 0 0 0-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .95-.69l1.519-4.682z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
