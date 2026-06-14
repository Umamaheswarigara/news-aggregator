import React, { useState } from 'react';
import { api } from '../services/api';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import { Sparkles, Newspaper, ShieldAlert, Loader2 } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [isSemantic, setIsSemantic] = useState(true); // Default to AI Search on Search page
  const [results, setResults] = useState([]);
  
  // Similarity score mappings (to show AI confidence levels!)
  const [scoresMap, setScoresMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query || query.trim() === '') return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      if (isSemantic) {
        // AI semantic search (Node.js)
        const semRes = await api.semanticSearch(query);
        if (semRes.results && semRes.results.length > 0) {
          const ids = semRes.results.map(r => r.articleId);
          
          // Store scores map
          const scores = {};
          semRes.results.forEach(r => {
            scores[r.articleId] = Math.round(r.score * 100);
          });
          setScoresMap(scores);

          // Get article metadata from PostgreSQL
          const batchArticles = await api.getArticlesByIds(ids);
          // Re-sort to match the similarity order
          const sorted = ids.map(id => batchArticles.find(a => a.id === id)).filter(Boolean);
          setResults(sorted);
        } else {
          setResults([]);
        }
      } else {
        // Keyword Search (Spring Boot)
        const pageData = await api.getArticles(0, 20, null, null, query);
        setResults(pageData.content || []);
        setScoresMap({});
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch search results. Verify database endpoints.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold flex items-center justify-center gap-2 text-slate-900 dark:text-white">
          <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
          AI Semantic Search
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Instead of matching exact words, search by concepts. Try typing <span className="italic">"trends in robotics and machine learning"</span> or <span className="italic">"healthy eating updates"</span>.
        </p>
      </div>

      {/* Search Input and Toggle */}
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        isSemantic={isSemantic}
        setIsSemantic={setIsSemantic}
      />

      {/* Results Section */}
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-sky-400" />
            <span className="text-sm font-semibold">Running AI search query...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              Matched Articles ({results.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((article) => (
                <div key={article.id} className="relative">
                  {/* Overlay matching percentage for AI Search */}
                  {isSemantic && scoresMap[article.id] !== undefined && (
                    <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-indigo-600 text-white rounded-lg text-xxs font-extrabold shadow shadow-indigo-600/30 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{scoresMap[article.id]}% Match</span>
                    </div>
                  )}
                  <NewsCard article={article} />
                </div>
              ))}
            </div>
          </div>
        ) : searched ? (
          <div className="text-center py-24 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Newspaper className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <h3 className="font-bold text-slate-750">No Matches Found</h3>
            <p className="text-sm mt-1">Try widening your search terms or checking database seed entries.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
