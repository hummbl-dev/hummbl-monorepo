import Link from "next/link";
import { notFound } from "next/navigation";
import { getModelByCode, TRANSFORMATIONS } from "@hummbl/core";
import { ArrowLeft, BookOpen, Lightbulb, Compass, ArrowRight } from "lucide-react";

export default function ModelDetailPage({
  params,
}: {
  params: { code: string };
}) {
  const model = getModelByCode(params.code.toUpperCase());

  if (!model) {
    notFound();
  }

  const transformation = TRANSFORMATIONS[model.transformation];

  // Minimalist monochrome priority colors
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-white text-black border-white";
      case 2: return "bg-black text-neutral-300 border-neutral-600";
      default: return "bg-black text-neutral-500 border-neutral-800";
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="bg-black border-b border-white">
        <div className="container mx-auto px-4 py-12">
          <Link
            href="/models"
            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Library
          </Link>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-6 animate-in">
              <span className={`px-3 py-1 rounded text-sm font-bold border ${getPriorityColor(model.priority)}`}>
                {model.code}
              </span>
              <span className="text-neutral-700">|</span>
              <Link
                href={`/transformations/${model.transformation}`}
                className="flex items-center gap-2 px-3 py-1 rounded bg-black border border-neutral-800 text-sm font-bold text-neutral-400 hover:border-white hover:text-white transition-all"
              >
                {transformation.name} <ArrowRight size={14} />
              </Link>
              <span className="text-neutral-700">|</span>
              <span className="text-sm text-neutral-500">Priority {model.priority}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
              {model.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Definition Card */}
            <div className="p-8 bg-black border border-white animate-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-neutral-400 uppercase tracking-wider">
                <BookOpen size={18} className="text-emerald-500" />
                Definition
              </h2>
              <p className="text-xl text-white leading-relaxed font-medium">
                {model.definition}
              </p>
            </div>

            {/* Example Card */}
            {model.example && (
              <div className="p-8 bg-black border border-neutral-800 animate-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-neutral-400 uppercase tracking-wider">
                  <Lightbulb size={18} className="text-white" />
                  Example
                </h2>
                <div className="prose prose-invert max-w-none text-neutral-300">
                  {model.example}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-in" style={{ animationDelay: '0.4s' }}>
            {/* When to Use */}
            <div className="p-6 bg-black border border-emerald-900/50">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-500 uppercase text-xs tracking-wider">
                <Compass size={16} className="text-emerald-600" />
                When to Apply
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {model.whenToUse}
              </p>
            </div>

            {/* Transformation Context */}
            <div className="p-6 border border-neutral-800 bg-black">
              <h3 className="font-bold mb-3 text-xs text-neutral-600 uppercase tracking-wider">
                Transformation
              </h3>
              <Link
                href={`/transformations/${model.transformation}`}
                className="block group"
              >
                <div className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors text-white">
                  {transformation.name}
                </div>
                <p className="text-sm text-neutral-400 mb-4">
                  {transformation.description}
                </p>
                <div className="text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View all models <ArrowRight size={16} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
