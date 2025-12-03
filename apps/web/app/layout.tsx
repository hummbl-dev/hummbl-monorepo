import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HUMMBL - Base120 Mental Models',
  description: 'A comprehensive framework of 120 mental models for better thinking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="fixed top-0 w-full z-50 bg-black border-b border-white">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight flex items-center gap-2 group"
            >
              <span className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-black text-sm font-bold group-hover:bg-white transition-colors">
                H
              </span>
              <span className="text-white group-hover:text-emerald-500 transition-colors">
                HUMMBL
              </span>
            </Link>
            <nav className="flex gap-8 text-sm font-medium">
              <Link href="/models" className="text-neutral-400 hover:text-white transition-colors">
                Models
              </Link>
              <Link
                href="/transformations"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Transformations
              </Link>
              <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                About
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 pt-16 bg-black">{children}</main>

        <footer className="border-t border-white py-12 mt-12 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2">
                <Link href="/" className="text-xl font-bold tracking-tight mb-4 block text-white">
                  HUMMBL
                </Link>
                <p className="text-neutral-400 max-w-sm text-sm leading-relaxed">
                  Empowering better thinking through the Base120 framework. Master 120 mental models
                  across 6 fundamental transformations.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-white">Explore</h4>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>
                    <Link href="/models" className="hover:text-emerald-500 transition-colors">
                      All Models
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/transformations"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Transformations
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-emerald-500 transition-colors">
                      About Base120
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-white">Legal</h4>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>
                    <Link href="#" className="hover:text-emerald-500 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-emerald-500 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
              <p>© {new Date().getFullYear()} HUMMBL. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
