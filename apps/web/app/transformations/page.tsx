import Link from 'next/link';
import { TRANSFORMATIONS } from '@hummbl/core';
import { ArrowRight, Layers } from 'lucide-react';

export default function TransformationsPage() {
  return (
    <div className="min-h-screen py-12 bg-black">
      {/* Header */}
      <div className="mb-16 py-12 text-center border-b border-white">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black border border-white text-white text-sm font-bold mb-6 animate-in">
            <Layers size={14} />
            <span>Core Framework Structure</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-in text-white">
            The 6 Transformations
          </h1>

          <p
            className="text-xl text-neutral-400 max-w-2xl mx-auto animate-in"
            style={{ animationDelay: '0.1s' }}
          >
            Six fundamental ways to transform your thinking and approach problems. Every mental
            model belongs to one of these core categories.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Transformations Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {Object.values(TRANSFORMATIONS).map((transformation, index) => (
            <Link
              key={transformation.code}
              href={`/transformations/${transformation.code}`}
              className="group p-8 bg-black border border-white hover:border-emerald-500 transition-all animate-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded bg-black text-white flex items-center justify-center font-bold text-xl border border-white group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors">
                  {transformation.code}
                </div>
                <ArrowRight
                  className="text-neutral-600 group-hover:text-emerald-500 transition-colors"
                  size={20}
                />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">
                {transformation.name}
              </h2>

              <p className="text-neutral-400 mb-6 leading-relaxed">{transformation.description}</p>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-black text-neutral-400 text-sm font-bold border border-neutral-800">
                  {transformation.models.length} Models
                </span>
                <span className="px-3 py-1 rounded bg-black text-emerald-500 text-sm font-bold border border-emerald-900/50">
                  {transformation.models.filter(m => m.priority === 1).length} Essential
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-20 p-12 bg-black text-white text-center animate-in border border-white"
          style={{ animationDelay: '0.6s' }}
        >
          <h3 className="text-3xl font-bold mb-4">Ready to dive deeper?</h3>
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto text-lg">
            Explore the complete library of 120 mental models across all transformations.
          </p>
          <Link
            href="/models"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
          >
            Browse All Models <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
