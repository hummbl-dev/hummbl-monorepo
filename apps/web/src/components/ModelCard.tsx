import type { Base120Model } from '../hooks/useModels';
import { toast } from './Toast';

export const ModelCard: React.FC<{ model: Base120Model }> = ({ model }) => {
  const handleSessionStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    void navigator.clipboard
      .writeText(model.system_prompt)
      .then(() => {
        toast.emit(`Protocol [${model.id}] copied to clipboard.`);
      })
      .catch(() => {
        toast.emit('Clipboard unavailable. Please retry.');
      });
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900/20 transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-900/40">
      <div className="p-5 flex-1">
        <div className="mb-4 flex items-start justify-between">
          <span className="font-mono text-[10px] text-zinc-500 transition-colors group-hover:text-zinc-300">
            {model.id}
          </span>
          <div className="border border-zinc-800 bg-zinc-950/50 px-1.5 py-0.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-400">
              {model.transformation_code}
            </span>
          </div>
        </div>

        <h3 className="mb-2 text-base font-medium tracking-tight text-zinc-100 transition-colors group-hover:text-white">
          {model.name}
        </h3>
        <p className="text-xs leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400 line-clamp-3">
          {model.definition}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/50 bg-zinc-950/30 p-3 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-zinc-600">
          Base-{model.base_level}
        </span>
        <button
          type="button"
          onClick={handleSessionStart}
          className="flex items-center gap-1 font-mono text-[10px] text-zinc-400 transition-colors hover:text-white"
        >
          OPEN SESSION
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14 5l7 7m0 0-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
