import React from 'react';
import { Newspaper } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg text-white">
              <Newspaper className="h-4 w-4" />
            </div>
            <span className="font-bold text-md text-slate-800 dark:text-slate-200">
              NewsFlow
            </span>
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} NewsFlow Aggregator. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
