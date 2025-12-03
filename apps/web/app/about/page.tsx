import Link from 'next/link';
import { ArrowRight, Brain, Target, Zap, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="py-20 bg-black border-b border-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black border border-white mb-8 animate-in">
            <Sparkles size={14} className="text-emerald-500" />
            <span className="text-sm font-bold text-white">The Philosophy Behind HUMMBL</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-in text-white">
            The Base120 Framework
          </h1>

          <p className="text-xl text-neutral-400 leading-relaxed animate-in max-w-2xl mx-auto" style={{ animationDelay: '0.1s' }}>
            A comprehensive system for better thinking through 120 mental models organized into 6 transformational categories.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* What is Base120 */}
        <section className="mb-20 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded bg-black text-emerald-500 flex items-center justify-center border border-white">
              <Brain size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">What is Base120?</h2>
          </div>
          <div className="prose prose-invert max-w-none text-lg text-neutral-400 leading-relaxed">
            <p className="mb-6">
              Base120 is a curated framework of mental models—cognitive tools that help you think more effectively,
              solve problems creatively, and make better decisions. Rather than learning hundreds of disconnected concepts,
              Base120 organizes 120 essential models into 6 fundamental transformations.
            </p>
            <p>
              Each transformation represents a different way to approach problems: changing your perspective,
              inverting assumptions, composing solutions, decomposing complexity, iterating recursively,
              or understanding meta-systems.
            </p>
          </div>
        </section>

        {/* The 6 Transformations */}
        <section className="mb-20 animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded bg-black text-emerald-500 flex items-center justify-center border border-white">
              <Zap size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">The 6 Transformations</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { code: 'P', name: 'Perspective', desc: 'Frame and name what is. Anchor or shift your point of view.' },
              { code: 'IN', name: 'Inversion', desc: 'Reverse assumptions. Examine opposites, edges, and negations.' },
              { code: 'CO', name: 'Composition', desc: 'Combine parts into coherent wholes that create synergy.' },
              { code: 'DE', name: 'Decomposition', desc: 'Break complex systems into manageable constituent parts.' },
              { code: 'RE', name: 'Recursion', desc: 'Apply operations iteratively, with outputs becoming inputs.' },
              { code: 'SY', name: 'Meta-Systems', desc: 'Understand systems of systems and emergent dynamics.' }
            ].map((item) => (
              <div key={item.code} className="p-6 bg-black border border-neutral-800 hover:border-white transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-emerald-500">{item.code}</span>
                  <h3 className="font-bold text-lg text-white">{item.name}</h3>
                </div>
                <p className="text-sm text-neutral-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-20 animate-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded bg-black text-white flex items-center justify-center border border-white">
              <Target size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">How to Use Base120</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: 1, title: 'Start with Priority 1 Models', desc: 'Begin with the most foundational models (Priority 1) across all transformations. These are the essential building blocks.' },
              { step: 2, title: 'Apply to Real Problems', desc: 'Don\'t just read—actively apply each model to current challenges you\'re facing. Real practice builds intuition.' },
              { step: 3, title: 'Combine Models', desc: 'The real power comes from combining multiple models. Use Perspective to frame, Decomposition to analyze, and Composition to synthesize solutions.' },
              { step: 4, title: 'Progress by Priority', desc: 'After mastering Priority 1 models, gradually explore Priority 2 and higher. You don\'t need all 120 immediately.' }
            ].map((item) => (
              <div key={item.step} className="flex gap-6 p-6 bg-black border border-neutral-800">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-emerald-600 text-black flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="p-10 bg-black text-white text-center animate-in border border-white" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-3xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto text-lg">
            Explore the complete library of 120 mental models, organized by transformation type
            and prioritized for effective learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/models"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
            >
              Browse Models <ArrowRight size={20} />
            </Link>
            <Link
              href="/transformations"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-neutral-600 hover:bg-neutral-800 transition-colors"
            >
              View Transformations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
