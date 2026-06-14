import React from 'react';
import { Tag, Globe, ListFilter, Sliders } from 'lucide-react';

export default function Sidebar({
  categories = [],
  sources = [],
  activeCategory = null,
  activeSource = null,
  onCategorySelect,
  onSourceSelect,
  onClearFilters
}) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      {/* Filters Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <ListFilter className="h-4.5 w-4.5 text-indigo-600 dark:text-sky-400" />
          <span>Filters</span>
        </div>
        {(activeCategory || activeSource) && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-semibold text-sm text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
          <Tag className="h-3.5 w-3.5" />
          <span>Categories</span>
        </div>
        <div className="flex flex-wrap lg:flex-col gap-1.5">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-fit lg:w-full text-left px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
                activeCategory === category.id
                  ? 'bg-indigo-600 text-white shadow-sm dark:bg-sky-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2 font-semibold text-sm text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
          <Globe className="h-3.5 w-3.5" />
          <span>Sources</span>
        </div>
        <div className="flex flex-wrap lg:flex-col gap-1.5">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onSourceSelect(source.id)}
              className={`w-fit lg:w-full text-left px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
                activeSource === source.id
                  ? 'bg-indigo-600 text-white shadow-sm dark:bg-sky-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {source.sourceName}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
