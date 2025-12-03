import Link from "next/link";
import { ArrowRight, Brain, Layers, Zap, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-black min-h-screen">
      {/* Hero Section with Minimalist Dark Theme */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden border-b border-white">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container relative mx-auto px-4 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black border border-white text-emerald-500 text-sm font-bold mb-8 animate-in">
            <Sparkles size={14} />
            <span>120 Mental Models · 6 Transformations</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in text-white">
            Master the <span className="text-emerald-500">Base120</span> Framework
          </h1>

          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-10 animate-in leading-relaxed" style={{ animationDelay: '0.1s' }}>
            A comprehensive system of mental models to elevate your thinking, sharpen decision-making, and unlock creative problem-solving.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/models"
              className="px-8 py-4 rounded-full bg-emerald-600 text-black font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Explore Models
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-full bg-black border border-white text-white font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-neutral-800 pt-10">
            <div className="animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-white">120</div>
              <div className="text-sm text-neutral-500 mt-1">Mental Models</div>
            </div>
            <div className="animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-bold text-white">6</div>
              <div className="text-sm text-neutral-500 mt-1">Transformations</div>
            </div>
            <div className="animate-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-4xl font-bold text-white">∞</div>
              <div className="text-sm text-neutral-500 mt-1">Applications</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 px-4 bg-black border-b border-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Transform Your Thinking
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Six fundamental ways to approach any problem, backed by timeless cognitive tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-none bg-black border border-white hover:border-emerald-500 transition-colors animate-in group">
              <div className="w-12 h-12 rounded bg-black border border-white text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-900/20 transition-colors">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">6 Transformations</h3>
              <p className="text-neutral-400 leading-relaxed">
                Structured categories like Perspective, Inversion, and Composition to systematically organize your thinking tools.
              </p>
            </div>

            <div className="p-8 rounded-none bg-black border border-white hover:border-emerald-500 transition-colors animate-in group" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded bg-black border border-white text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-900/20 transition-colors">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">120 Mental Models</h3>
              <p className="text-neutral-400 leading-relaxed">
                A rich library of cognitive tools from First Principles to Systems Thinking, prioritized for effective learning.
              </p>
            </div>

            <div className="p-8 rounded-none bg-black border border-white hover:border-emerald-500 transition-colors animate-in group" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded bg-black border border-white text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-900/20 transition-colors">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Practical Application</h3>
              <p className="text-neutral-400 leading-relaxed">
                Clear definitions, real-world examples, and guidance on when to apply each model in your decision-making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-4 bg-black">
        <div className="container mx-auto max-w-4xl">
          <div className="relative p-12 bg-black text-center overflow-hidden border border-white">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Upgrade Your Thinking?
              </h2>
              <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
                Start with Priority 1 models and progressively build your mental toolkit.
              </p>
              <Link
                href="/transformations"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
              >
                Browse Transformations
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
