import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import { Newspaper, HelpCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSource, setActiveSource] = useState(null);
  
  // Search state
  const [searchVal, setSearchVal] = useState('');
  const [isSemantic, setIsSemantic] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch meta filters
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const cats = await api.getCategories();
        const srcs = await api.getSources();
        setCategories(cats);
        setSources(srcs);
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch articles based on page, filters, or search
  const fetchArticles = async (currentPage = 0) => {
    setLoading(true);
    setError('');
    try {
      // If there is an active search, handle it
      if (searchVal && searchVal.trim() !== '') {
        setIsSearching(true);
        if (isSemantic) {
          // AI Semantic Search
          const semRes = await api.semanticSearch(searchVal);
          if (semRes.results && semRes.results.length > 0) {
            const ids = semRes.results.map(r => r.articleId);
            const batchArticles = await api.getArticlesByIds(ids);
            
            // Reorder articles based on similarity score order (which is IDs order)
            const sortedBatch = ids.map(id => batchArticles.find(a => a.id === id)).filter(Boolean);
            setArticles(sortedBatch);
            setTotalPages(1);
          } else {
            setArticles([]);
            setTotalPages(1);
          }
        } else {
          // Normal Keyword SQL Search
          const data = await api.getArticles(currentPage, 9, null, null, searchVal);
          setArticles(data.content || []);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        // Standard Listing with filters
        setIsSearching(false);
        const data = await api.getArticles(currentPage, 9, activeCategory, activeSource);
        setArticles(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles. Please check if backend services are running.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on submit
  const handleSearch = () => {
    setPage(0);
    fetchArticles(0);
  };

  useEffect(() => {
    fetchArticles(page);
  }, [page, activeCategory, activeSource]);

  // Handle clearing filters and searches
  const handleClearFilters = () => {
    setActiveCategory(null);
    setActiveSource(null);
    setSearchVal('');
    setIsSearching(false);
    setPage(0);
  };

  const handleCategorySelect = (id) => {
    setSearchVal(''); // Clear search when filter selected
    setActiveSource(null); // Clear source filter
    setActiveCategory(id);
    setPage(0);
  };

  const handleSourceSelect = (id) => {
    setSearchVal(''); // Clear search when filter selected
    setActiveCategory(null); // Clear category filter
    setActiveSource(id);
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner / Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Stay Informed, <span className="bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">Stay Ahead</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-md">
          Explore headlines from premium sources around the globe, powered by PostgreSQL relational structures and MongoDB Semantic Vector Search.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchVal}
        onChange={setSearchVal}
        onSubmit={handleSearch}
        isSemantic={isSemantic}
        setIsSemantic={setIsSemantic}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filter */}
        <Sidebar
          categories={categories}
          sources={sources}
          activeCategory={activeCategory}
          activeSource={activeSource}
          onCategorySelect={handleCategorySelect}
          onSourceSelect={handleSourceSelect}
          onClearFilters={handleClearFilters}
        />

        {/* Article Grid area */}
        <div className="flex-1 w-full space-y-6">
          {error && (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center">
              <p className="font-bold mb-1">Database Connection Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-sky-400" />
              <span className="text-sm font-semibold">Fetching articles...</span>
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div key={article.id}>
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>

              {/* Pagination (only show if not in custom search mode where pagination is collapsed) */}
              {!isSearching && totalPages > 1 && (
                <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-800">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <Newspaper className="h-12 w-12 mb-3" />
              <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">No Articles Found</h3>
              <p className="text-sm max-w-xs text-center mt-1">
                {isSearching ? "No articles matched your AI/keyword search term. Try another query." : "There are currently no articles in this category or source."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
