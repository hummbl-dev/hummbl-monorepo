import { NavLink, Outlet } from 'react-router-dom';
import { LoginButton } from './LoginButton.tsx';

interface NavItem {
  label: string;
  to: string;
  code: string;
  description: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'System',
    items: [
      {
        label: 'Library',
        to: '/',
        code: 'S-01',
        description: 'Index of Base120 models & prompts',
      },
    ],
  },
  {
    title: 'Intel',
    items: [
      {
        label: 'Transformations',
        to: '/',
        code: 'INT-04',
        description: 'Six-mode transformation lattice',
      },
      {
        label: 'Briefing',
        to: '/',
        code: 'INT-07',
        description: 'Obsidian Monolith status window',
      },
    ],
  },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group block rounded-md border px-4 py-3 transition-all duration-300 backdrop-blur-sm',
    isActive
      ? 'border-obsidian-500/70 bg-obsidian-900/80 shadow-glow-soft'
      : 'border-obsidian-800/80 hover:border-obsidian-600/80',
  ].join(' ');

export const AppShell: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-obsidian-950 via-zinc-950 to-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.08),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen">
        <aside className="w-80 border-r border-white/5 px-8 py-10 space-y-10 flex flex-col">
          <div className="space-y-8">
            <NavLink to="/" className="flex items-center gap-4">
              <div className="relative">
                <span className="w-14 h-14 border border-obsidian-700/80 rounded-full flex items-center justify-center text-lg font-bold font-mono">
                  H
                </span>
                <span className="absolute inset-0 blur-xl bg-obsidian-500/30" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.35em] text-zinc-400 font-mono uppercase">
                  HUMMBL
                </p>
                <p className="text-2xl font-light">Base120</p>
              </div>
            </NavLink>

            <nav className="space-y-8">
              {NAV_SECTIONS.map(section => (
                <div key={section.title} className="space-y-3">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
                    {section.title}
                  </p>
                  <div className="space-y-3">
                    {section.items.map(item => (
                      <NavLink key={item.code} to={item.to} className={navClass}>
                        <div>
                          <span className="flex items-center justify-between font-semibold tracking-wide">
                            {item.label}
                            <span className="text-[10px] text-zinc-400 font-mono">{item.code}</span>
                          </span>
                          <p className="text-sm text-zinc-500 group-hover:text-zinc-300">
                            {item.description}
                          </p>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="text-[11px] text-zinc-500 space-y-1 font-mono border-t border-white/5 pt-4">
            <div className="mb-4">
              <LoginButton />
            </div>
            <p>Cloudflare Workers · React 18 · Vite</p>
            <p>Obsidian Monolith v0.{new Date().getMonth() + 1}</p>
            <p>© {new Date().getFullYear()} HUMMBL Systems</p>
          </div>
        </aside>

        <section className="scroll-micro flex-1 min-h-screen overflow-y-auto px-12 py-12">
          <Outlet />
        </section>
      </div>
    </div>
  );
};
