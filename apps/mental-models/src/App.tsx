import { useState, useEffect, useMemo } from 'react';
import { NarrativeList } from './components/narratives/NarrativeList';
import { MentalModelsList } from './components/mental-models/MentalModelsList';
import { MentalModelsFilters } from './components/mental-models/MentalModelsFilters';
import ModelDetailModal from './components/mental-models/ModelDetailModal';
import { Hero } from './components/Hero/Hero';
import { ChatWidget } from './components/chat/ChatWidget';
import { AuthProvider } from './contexts/AuthContext';
import BetaSignup from './pages/BetaSignup';
import type { ViewType } from '@cascade/types/view';
import type { MentalModel } from '@cascade/types/mental-model';
import { fetchMentalModels, clearMentalModelsCache } from './services/mentalModelsService';
import { useMentalModelFilters } from './hooks/useMentalModelFilters';
import type { ChatContext } from '@cascade/types/chatContext';
import './App.css';

// Types for persisted state
interface MentalModelsState {
  searchTerm: string;
  selectedTransformations: string[];
  sortBy: string;
  showExamples: boolean;
}

// Default state
const DEFAULT_MENTAL_MODELS_STATE: MentalModelsState = {
  searchTerm: '',
  selectedTransformations: [],
  sortBy: 'name-asc',
  showExamples: true,
};

// LocalStorage keys
const LOCAL_STORAGE_KEYS = {
  VIEW: 'hummbl:view',
  MENTAL_MODELS_STATE: 'hummbl:mental-models-state',
};

function App() {
  // State for the current view
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    // Initialize from localStorage or default to 'narratives'
    const savedView = localStorage.getItem(LOCAL_STORAGE_KEYS.VIEW) as ViewType;
    return savedView || 'narratives';
  });

  // State for mental models data
  const [mentalModels, setMentalModels] = useState<MentalModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<MentalModel | null>(null);

  // Mental models filtering
  const {
    filters,
    setFilters,
    filteredModels,
    categories,
    transformations,
    resultCount,
    totalCount,
  } = useMentalModelFilters(mentalModels);

  // State for mental models UI state
  const [mentalModelsState] = useState<MentalModelsState>(() => {
    // Initialize from localStorage or use defaults
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEYS.MENTAL_MODELS_STATE);
    return savedState ? JSON.parse(savedState) : DEFAULT_MENTAL_MODELS_STATE;
  });

  // Load mental models data
  useEffect(() => {
    const loadMentalModels = async () => {
      if (currentView !== 'models') return;

      setIsLoading(true);
      setError(null);

      try {
        const models = await fetchMentalModels();
        setMentalModels(models);
      } catch (err) {
        console.error('Failed to load mental models:', err);
        setError('Failed to load mental models. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMentalModels();
  }, [currentView]);

  // Save view to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW, currentView);
  }, [currentView]);

  // Save mental models state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MENTAL_MODELS_STATE, JSON.stringify(mentalModelsState));
  }, [mentalModelsState]);

  // Handle model selection
  const handleModelSelect = (model: MentalModel) => {
    setSelectedModel(model);
  };

  // Handle mental models state updates (inline where used)

  return (
    <AuthProvider>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1 className="logo">HUMMBL</h1>
          </div>
        </header>

        {/* Hero Section */}
        <Hero onViewChange={setCurrentView} currentView={currentView} />

        <main className="main-content">
          {currentView === 'narratives' ? (
            <NarrativeList />
          ) : currentView === 'beta' ? (
            <BetaSignup />
          ) : (
            <div className="mental-models-wrapper">
              <div
                style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}
              >
                <button
                  onClick={async () => {
                    clearMentalModelsCache();
                    setIsLoading(true);
                    try {
                      const models = await fetchMentalModels();
                      setMentalModels(models);
                      setError(null);
                    } catch (err) {
                      console.error('Failed to refresh mental models:', err);
                      setError('Failed to load mental models. Please try again later.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="button refresh-button"
                  aria-label="Refresh data"
                  title="Refresh data"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                </button>
              </div>

              {isLoading ? (
                <div className="loading">Loading mental models...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : (
                <>
                  <MentalModelsFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    resultCount={resultCount}
                    totalCount={totalCount}
                    categories={categories}
                    transformations={transformations}
                  />
                  <MentalModelsList
                    models={filteredModels}
                    onSelect={handleModelSelect}
                    onRetry={async () => {
                      clearMentalModelsCache();
                      setIsLoading(true);
                      try {
                        const models = await fetchMentalModels();
                        setMentalModels(models);
                        setError(null);
                      } catch (err) {
                        console.error('Retry failed:', err);
                        setError('Failed to load mental models. Please try again later.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  />
                </>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>HUMMBL Cognitive Framework v1.0</p>
          <p>Production Certified - 2025-10-17</p>
        </footer>

        {/* Model Detail Modal */}
        {selectedModel && (
          <ModelDetailModal model={selectedModel} onClose={() => setSelectedModel(null)} />
        )}

        {/* Chat Widget */}
        <ChatWidget
          mentalModels={mentalModels}
          narratives={[]}
          apiKey={import.meta.env.VITE_OPENAI_API_KEY}
          context={useMemo((): ChatContext | null => {
            // If a model modal is open
            if (selectedModel) {
              return {
                type: 'mental-model',
                viewMode: 'modal-open',
                currentItem: selectedModel,
                metadata: {
                  totalModels: mentalModels.length,
                },
              };
            }

            // If browsing mental models
            if (currentView === 'models') {
              return {
                type: 'mental-model',
                viewMode: 'browsing',
                metadata: {
                  totalModels: mentalModels.length,
                  activeFilters: [],
                },
              };
            }

            // If browsing narratives
            if (currentView === 'narratives') {
              return {
                type: 'narrative',
                viewMode: 'browsing',
                metadata: {
                  totalNarratives: 0, // TODO: Add narratives count when available
                },
              };
            }

            // If on beta signup page
            if (currentView === 'beta') {
              return {
                type: 'beta',
                viewMode: 'signup',
                metadata: {
                  betaStatus: 'open',
                },
              };
            }

            return null;
          }, [selectedModel, currentView, mentalModels.length])}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
