import React from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, isSemantic, setIsSemantic }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Search Input Box */}
      <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 dark:focus-within:ring-sky-500/20 dark:focus-within:border-sky-500 transition-all">
        <div className="pl-4 text-slate-400 dark:text-slate-500">
          {isSemantic ? <Sparkles className="h-5 w-5 text-indigo-600 dark:text-sky-400 animate-pulse" /> : <Search className="h-5 w-5" />}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isSemantic ? "Search using AI (e.g. 'latest AI news or robotics updates')" : "Search by keyword..."}
          className="w-full px-3 py-4 text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 border-none outline-none focus:ring-0 text-md"
        />
        <button
          onClick={onSubmit}
          className="px-6 py-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-600 dark:hover:bg-sky-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Search Type Toggle */}
      <div className="flex justify-center items-center gap-3">
        <span className={`text-xs font-semibold ${!isSemantic ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
          Keyword Search
        </span>
        
        <button
          onClick={() => setIsSemantic(!isSemantic)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isSemantic ? 'bg-indigo-600 dark:bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSemantic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        <span className={`flex items-center gap-1 text-xs font-semibold ${isSemantic ? 'text-indigo-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}>
          <Sparkles className="h-3.5 w-3.5" />
          AI Semantic Search
        </span>
      </div>
    </div>
  );
}
