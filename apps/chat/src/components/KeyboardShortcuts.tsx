import { useEffect, useState } from 'react';

interface KeyboardShortcutsProps {
  onSearchFocus: () => void;
  onClearFilters: () => void;
  onToggleOverview: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onSearchFocus,
  onClearFilters,
  onToggleOverview,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearchFocus();
      }

      // Escape to clear filters
      if (event.key === 'Escape') {
        onClearFilters();
      }

      // ? to show help
      if (event.key === '?' && !event.shiftKey) {
        event.preventDefault();
        setShowHelp(!showHelp);
      }

      // H to toggle overview
      if (event.key === 'h' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          onToggleOverview();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchFocus, onClearFilters, onToggleOverview, showHelp]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-100">Keyboard Shortcuts</h3>
          <button
            onClick={() => setShowHelp(false)}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close keyboard shortcuts help"
            title="Close help"
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Search</span>
            <kbd className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Clear Filters</span>
            <kbd className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
              ESC
            </kbd>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Toggle Overview</span>
            <kbd className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
              H
            </kbd>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Show Help</span>
            <kbd className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
              ?
            </kbd>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-[10px] font-mono text-zinc-500 text-center">
            Press ? to close this help
          </p>
        </div>
      </div>
    </div>
  );
};
