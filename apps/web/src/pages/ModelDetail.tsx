import { Link, Navigate, useParams } from 'react-router-dom';
import { useModels } from '../hooks/useModels';
import { StatusStrip } from '../components/StatusStrip';
import { toast } from '../components/Toast';

export const ModelDetail: React.FC = () => {
  const { id } = useParams();
  const { models, isLoading } = useModels();

  if (isLoading) {
    return (
      <div className="p-12 text-xs font-mono text-zinc-500 animate-pulse tracking-[0.3em]">
        LOADING BLUEPRINT…
      </div>
    );
  }

  const model = models.find(entry => entry.id === id);

  if (!model) {
    return <Navigate to="/" replace />;
  }

  const handleCopy = () => {
    void navigator.clipboard
      .writeText(model.system_prompt)
      .then(() => {
        toast.emit(`System prompt for ${model.name} extracted.`);
      })
      .catch(() => {
        toast.emit('Clipboard unavailable. Please retry.');
      });
  };

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <StatusStrip totalModels={models.length} activeFilter={model.id} />

      <div className="mx-auto space-y-10 px-8 pt-8">
        <Link
          to="/"
          className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 transition-colors hover:text-white"
        >
          ← Return to Library
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-black/60 via-obsidian-900/70 to-black/30 p-10 shadow-glow-soft">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle,_rgba(59,130,246,0.25),_transparent_60%)] blur-3xl opacity-60" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-[0.4em] text-zinc-500">
              <span className="rounded-full border border-white/20 px-4 py-1 text-white">
                {model.transformation_name}
              </span>
              <span>ID: {model.id}</span>
              <span>Mode: {model.transformation_code}</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
                {model.name}
              </h1>
              <p className="text-xl font-light leading-relaxed text-zinc-300 max-w-3xl">
                {model.definition}
              </p>
            </div>
            <div className="grid gap-4 font-mono text-sm text-zinc-400 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500">Base Level</p>
                <p className="text-2xl text-white">{model.base_level}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500">Difficulty</p>
                <p className="text-2xl capitalize text-white">
                  {model.difficulty ?? 'intermediate'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500">Updated</p>
                <p className="text-2xl text-white">
                  {model.updatedAt ? new Date(model.updatedAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-3 border border-zinc-700 bg-zinc-900/60 px-6 py-3 font-mono text-xs uppercase tracking-[0.4em] text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-800"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Initialize Protocol Sequence
            </button>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-white/5 bg-black/40 p-8">
              <h3 className="mb-4 text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-500">
                System Instruction
              </h3>
              <div className="rounded-xl border border-white/10 bg-black/50 p-6">
                <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-200">
                  {model.system_prompt}
                </code>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-8">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-500">
                When to Deploy
              </h3>
              <p className="leading-relaxed text-zinc-300">{model.whenToUse}</p>
              {model.example && (
                <div className="rounded-xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-zinc-200">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500">
                    Field Example
                  </p>
                  {model.example}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-black/40 p-6">
              <h4 className="mb-4 text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-500">
                Applicability Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {model.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.3em] text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-6">
              <h4 className="text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-500">
                Telemetry
              </h4>
              <dl className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <dt>Transformation</dt>
                  <dd className="font-mono text-white">{model.transformation_name}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <dt>Base Complexity</dt>
                  <dd className="font-mono text-white">{model.base_level} pts</dd>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <dt>Code</dt>
                  <dd className="font-mono text-white">{model.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Source</dt>
                  <dd className="font-mono text-white">Base120 Core</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
