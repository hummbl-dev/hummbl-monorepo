import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { TRANSFORMATIONS } from '@hummbl/core';

export async function generateStaticParams() {
  return Object.keys(TRANSFORMATIONS).map(code => ({
    code,
  }));
}

export default function TransformationPage({ params }: { params: { code: string } }) {
  const transformation = TRANSFORMATIONS[params.code.toUpperCase()];

  if (!transformation) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <Link
        href="/models"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft size={16} />
        Back to all models
      </Link>

      {/* Transformation Header */}
      <div className="mb-12">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
          {transformation.code}
        </div>
        <h1 className="text-4xl font-bold mb-3">{transformation.name}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{transformation.description}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {transformation.models.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Models</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {transformation.models.filter(m => m.priority === 1).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Priority 1</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {transformation.models.filter(m => m.priority === 2).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Priority 2</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {transformation.models.filter(m => m.priority >= 3).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Priority 3+</div>
        </div>
      </div>

      {/* Models List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Models in this Transformation</h2>
        <div className="space-y-3">
          {transformation.models
            .sort((a, b) => a.priority - b.priority || a.code.localeCompare(b.code))
            .map(model => (
              <Link
                key={model.code}
                href={`/models/${model.code}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-mono font-medium">
                        {model.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          model.priority === 1
                            ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                            : model.priority === 2
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        Priority {model.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{model.definition}</p>
                  </div>
                  <ChevronRight
                    className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0"
                    size={20}
                  />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
