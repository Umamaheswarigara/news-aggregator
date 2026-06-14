import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Newspaper, Tag, Globe, Settings, ArrowRight, Shield, Database } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [articleCount, setArticleCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [sourceCount, setSourceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const articlesRes = await api.getArticles(0, 1);
        setArticleCount(articlesRes.totalElements || 0);

        const categoriesRes = await api.getCategories();
        setCategoryCount(categoriesRes.length || 0);

        const sourcesRes = await api.getSources();
        setSourceCount(sourcesRes.length || 0);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl text-white flex items-center justify-between shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="h-4 w-4" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">System Administration</h1>
          <p className="text-slate-400 text-sm">
            Review stats, edit news feeds, write vector search contents, and manage resources.
          </p>
        </div>
        <Database className="h-14 w-14 text-indigo-500/30 hidden sm:block" />
      </div>

      {loading ? (
        <div className="text-center py-20 font-medium text-slate-500">Loading system metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Articles Stats Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-sky-400 rounded-xl">
                <Newspaper className="h-6 w-6" />
              </div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{articleCount}</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Articles</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Headers and MongoDB body texts.</p>
            </div>
            <Link
              to="/admin/articles"
              className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-sky-400 hover:underline pt-2"
            >
              <span>Manage Articles</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Categories Stats Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <Tag className="h-6 w-6" />
              </div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{categoryCount}</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Categories</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Topic divisions of the aggregator feed.</p>
            </div>
            <Link
              to="/admin/categories"
              className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-sky-400 hover:underline pt-2"
            >
              <span>Manage Categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Sources Stats Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Globe className="h-6 w-6" />
              </div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{sourceCount}</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Sources</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Publishers and news agencies.</p>
            </div>
            <Link
              to="/admin/sources"
              className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-sky-400 hover:underline pt-2"
            >
              <span>Manage Sources</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
