import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useModels } from '../hooks/useModels';
import { ModelCard } from '../components/ModelCard';
import { StatusStrip } from '../components/StatusStrip';

export const Explorer: React.FC = () => {
  const { models, isLoading, error } = useModels();
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="p-12 text-xs font-mono text-zinc-500 animate-pulse tracking-[0.3em]">
        INITIALIZING BASE120…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-xs font-mono text-red-500">
        SYSTEM FAILURE: CONNECTION REFUSED — {error.toUpperCase()}
      </div>
    );
  }

  const filtered =
    models.filter(model => {
      const query = search.toLowerCase();
      return (
        model.name.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query) ||
        model.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }) ?? [];

  const starterModels = !search ? models.filter(model => model.base_level === 6).slice(0, 3) : [];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      <StatusStrip totalModels={filtered.length} activeFilter={search} />

      <div className="relative group">
        <input
          type="text"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Input query, ID, or tag..."
          className="w-full bg-zinc-900/50 border border-zinc-800 px-6 py-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-900 transition-all font-light rounded-sm"
          autoFocus
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">
            CMD + K
          </span>
        </div>
      </div>

      {!search && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500">
              Starter Protocols (Base-6)
            </h2>
            <span className="text-[10px] font-mono text-zinc-600">Recommended Entry</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {starterModels.map(model => (
              <Link key={model.id} to={`/model/${model.id}`} className="block h-full">
                <ModelCard model={model} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500">
            Full Inventory
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(model => (
            <Link key={model.id} to={`/model/${model.id}`} className="block h-full">
              <ModelCard model={model} />
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full rounded-sm border border-dashed border-zinc-800 py-20 text-center">
              <p className="text-sm font-mono text-zinc-500">NO MATCHING PATTERNS FOUND</p>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-2 text-xs text-zinc-400 underline underline-offset-4 hover:text-white"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
