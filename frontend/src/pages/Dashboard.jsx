import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import NewsCard from '../components/NewsCard';
import { Flame, Star, BookOpen, Compass, Award, ArrowRight, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [latestArticles, setLatestArticles] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  
  const [stats, setStats] = useState({ totalArticlesRead: 0, totalDurationMinutes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!localStorage.getItem('token')) return;
      try {
        setLoading(true);
        // Load categories and sources
        const cats = await api.getCategories();
        const srcs = await api.getSources();
        setCategories(cats.slice(0, 5));
        setSources(srcs.slice(0, 5));

        // Load latest articles
        const latestData = await api.getArticles(0, 3);
        setLatestArticles(latestData.content || []);

        // Load reading stats
        try {
          const rStats = await api.getReadingStats();
          setStats(rStats);
        } catch (e) {
          console.error("Error loading stats:", e);
        }

        // Recommend articles (Based on Technology category ID, or first available category)
        if (cats.length > 0) {
          // Recommend articles from Category 1 (usually Technology)
          const recData = await api.getArticles(0, 3, cats[0].id);
          setRecommendedArticles(recData.content || []);

          // Trending articles from Category 2 (usually Sports or Business)
          const trendData = cats.length > 1 
            ? await api.getArticles(0, 3, cats[1].id) 
            : await api.getArticles(0, 3);
          setTrendingArticles(trendData.content || []);
        } else {
          setRecommendedArticles(latestData.content || []);
          setTrendingArticles(latestData.content || []);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-900 dark:to-indigo-950/40 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Personal Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-400 text-sm">
            Here is your daily summary based on your reading preferences.
          </p>
        </div>

        {/* Quick Stats card */}
        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur">
          <div className="text-center px-3 border-r border-white/10">
            <div className="font-extrabold text-lg text-sky-400">{stats.totalArticlesRead}</div>
            <div className="text-xxs uppercase font-bold text-slate-400">Read</div>
          </div>
          <div className="text-center px-3">
            <div className="font-extrabold text-lg text-indigo-400">{stats.totalDurationMinutes}m</div>
            <div className="text-xxs uppercase font-bold text-slate-400">Time</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-medium text-slate-500">Loading Dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Dashboard Feed (3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Recommended News section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  Recommended for You
                </h2>
                <Link to="/" className="text-xs font-bold text-indigo-600 dark:text-sky-400 flex items-center gap-1 hover:underline">
                  View Feed <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedArticles.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Trending News section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Flame className="h-5 w-5 text-rose-500 fill-rose-500" />
                  Trending Headlines
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingArticles.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Latest News section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  Latest Updates
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestArticles.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>

          </div>

          {/* Quick Filters Area (1 col) */}
          <div className="space-y-6">
            
            {/* Quick Categories filter shortcut */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                <Compass className="h-4.5 w-4.5 text-indigo-600" />
                Explore Categories
              </h3>
              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/`}
                    className="flex justify-between items-center px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors"
                  >
                    <span>{cat.categoryName}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Sources filter shortcut */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                <Award className="h-4.5 w-4.5 text-indigo-600" />
                Top Publishers
              </h3>
              <div className="flex flex-col gap-2">
                {sources.map(src => (
                  <Link
                    key={src.id}
                    to={`/`}
                    className="flex flex-col p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{src.sourceName}</span>
                    <span className="text-xxs text-slate-400 dark:text-slate-500 truncate">{src.website}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
