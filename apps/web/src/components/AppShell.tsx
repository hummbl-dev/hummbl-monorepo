import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

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


export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-obsidian-950 via-zinc-950 to-black text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.08),_transparent_55%)]"
        aria-hidden="true"
      />
      
      {/* Mobile Header */}
      <header className="relative z-50 border-b border-white/5 backdrop-blur-sm bg-obsidian-950/80">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-obsidian-400 rounded-lg"
              aria-label="HUMMBL Base120 Home"
            >
              <div className="relative">
                <span
                  className="w-16 h-16 border border-obsidian-700/80 rounded-full flex items-center justify-center text-2xl font-bold font-mono lg:w-12 lg:h-12 lg:text-lg"
                  aria-hidden="true"
                >
                  H
                </span>
                <span className="absolute inset-0 blur-xl bg-obsidian-500/30" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[14px] tracking-[0.35em] text-zinc-400 font-mono uppercase lg:text-[11px]">
                  HUMMBL
                </p>
                <p className="text-2xl font-light lg:text-xl">Base120</p>
              </div>
            </NavLink>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-4 bg-obsidian-900/80 border border-obsidian-700/80 rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-obsidian-400"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden absolute top-full left-0 right-0 bg-obsidian-950/95 border-b border-white/5 backdrop-blur-lg z-40">
            <div className="px-4 py-6 space-y-4">
              {NAV_SECTIONS.map(section => (
                <div key={section.title} className="space-y-4">
                  <p
                    className="text-[14px] font-mono text-zinc-500 uppercase tracking-[0.4em] lg:text-[10px]"
                  >
                    {section.title}
                  </p>
                  <ul className="space-y-3" role="list">
                    {section.items.map(item => (
                      <li key={item.code}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) => [
                            'block rounded-md border px-6 py-4 transition-all duration-300',
                            'focus:outline-none focus:ring-2 focus:ring-obsidian-400 focus:ring-offset-2 focus:ring-offset-black',
                            isActive
                              ? 'border-obsidian-500/70 bg-obsidian-900/80'
                              : 'border-obsidian-800/80 hover:border-obsidian-600/80',
                          ].join(' ')}
                          aria-describedby={`nav-desc-${item.code}`}
                          onClick={closeMobileMenu}
                        >
                          <div>
                            <span className="flex items-center justify-between font-semibold tracking-wide text-xl">
                              {item.label}
                              <span
                                className="text-[14px] text-zinc-400 font-mono lg:text-[10px]"
                                aria-hidden="true"
                              >
                                {item.code}
                              </span>
                            </span>
                            <p
                              id={`nav-desc-${item.code}`}
                              className="text-lg text-zinc-500 lg:text-sm"
                            >
                              {item.description}
                            </p>
                          </div>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 min-h-screen overflow-y-auto px-6 py-8 lg:px-8 lg:py-8"
        role="main"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-2xl lg:text-lg">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
