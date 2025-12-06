interface StatusStripProps {
  totalModels: number;
  activeFilter?: string;
}

export const StatusStrip: React.FC<StatusStripProps> = ({ totalModels, activeFilter }) => {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-black/80 px-1 py-3 backdrop-blur-md transition-all">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500">
            System Online
          </span>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500">Cache:</span>
          <span className="text-[10px] font-mono text-zinc-300">Tier-1 (Mem)</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {activeFilter && (
          <div className="flex items-center gap-2 animate-in fade-in duration-300">
            <span className="text-[10px] font-mono text-zinc-500">Filtering:</span>
            <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 text-[10px] font-mono text-zinc-200">
              {activeFilter.toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-[10px] font-mono text-zinc-600">
          IDX: {totalModels.toString().padStart(3, '0')}
        </span>
      </div>
    </div>
  );
};
