import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { User, Mail, Bookmark, History, Clock, BookOpen, ChevronRight, Award } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalArticlesRead: 0, totalDurationMinutes: 0, totalVisits: 0 });
  const [hydratedHistory, setHydratedHistory] = useState([]);

  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' or 'history'
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

  const fetchProfileData = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      setLoading(true);
      // Load bookmarks
      const bms = await api.getBookmarks();
      setBookmarks(bms);

      // Load stats
      const rStats = await api.getReadingStats();
      setStats(rStats);

      // Load history
      const hist = await api.getReadingHistory();
      setHistory(hist);

      if (hist && hist.length > 0) {
        // Hydrate history logs with PostgreSQL article details
        const ids = hist.map(h => h.articleId);
        // Find unique ids to fetch from Spring Boot
        const uniqueIds = [...new Set(ids)];
        if (uniqueIds.length > 0) {
          const articlesDetails = await api.getArticlesByIds(uniqueIds);
          // Map MongoDB reading logs to their corresponding Spring Boot article data
          const mapped = hist.map(log => {
            const art = articlesDetails.find(a => a.id === log.articleId);
            return {
              ...log,
              article: art
            };
          }).filter(l => l.article != null); // filter out if not found
          setHydratedHistory(mapped);
        }
      }
    } catch (err) {
      console.error("Error loading profile details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleBookmarkRemove = (articleId) => {
    // Toggling bookmark in sub-card will trigger this to clean local list immediately
    setBookmarks(bookmarks.filter(b => b.article.id !== articleId));
  };

  const getInitials = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center shadow-sm">
        <div className="h-20 w-20 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-full flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
          {getInitials(user.name)}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
            {user.name}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20">
              {user.role}
            </span>
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
        </div>

        {/* Stats Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center space-y-1">
            <BookOpen className="h-5 w-5 mx-auto text-indigo-600 dark:text-sky-400" />
            <div className="font-extrabold text-lg text-slate-950 dark:text-slate-50">{stats.totalArticlesRead}</div>
            <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Articles Read</div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center space-y-1">
            <Clock className="h-5 w-5 mx-auto text-sky-500" />
            <div className="font-extrabold text-lg text-slate-950 dark:text-slate-50">{stats.totalDurationMinutes}m</div>
            <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Reading Time</div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center space-y-1">
            <Award className="h-5 w-5 mx-auto text-amber-500" />
            <div className="font-extrabold text-lg text-slate-950 dark:text-slate-50">{bookmarks.length}</div>
            <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Bookmarks</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-1.5 px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'border-indigo-600 text-indigo-600 dark:border-sky-500 dark:text-sky-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 dark:border-sky-500 dark:text-sky-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <History className="h-4 w-4" />
          Reading History ({hydratedHistory.length})
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 font-medium text-slate-500">Loading profile records...</div>
        ) : activeTab === 'bookmarks' ? (
          bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="relative group p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xxs font-bold bg-indigo-50 dark:bg-sky-950/40 text-indigo-700 dark:text-sky-400">
                        {bm.article.category?.categoryName}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors">
                        <Link to={`/article/${bm.article.id}`}>{bm.article.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Published by {bm.article.source?.sourceName}
                      </p>
                    </div>
                    
                    {/* Quick remove bookmark */}
                    <button
                      onClick={async () => {
                        try {
                          await api.toggleBookmark(bm.article.id);
                          handleBookmarkRemove(bm.article.id);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-full transition-colors cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Bookmark className="h-4.5 w-4.5 fill-indigo-600 text-indigo-600 dark:fill-sky-400 dark:text-sky-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <Bookmark className="h-10 w-10 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No Bookmarks Saved</h3>
              <p className="text-sm mt-1">Articles you bookmark will appear here.</p>
            </div>
          )
        ) : hydratedHistory.length > 0 ? (
          <div className="space-y-4">
            {hydratedHistory.map((log) => (
              <div
                key={log._id}
                className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-sky-400 transition-colors">
                    <Link to={`/article/${log.article?.id}`}>{log.article?.title}</Link>
                  </h3>
                  <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <span>{log.article?.source?.sourceName}</span>
                    <span>Read on: {new Date(log.readTime).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-bold shrink-0 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <Clock className="h-4 w-4 text-sky-500" />
                  <span>{log.readingDuration}s</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <History className="h-10 w-10 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Reading Activity</h3>
            <p className="text-sm mt-1">Your reading logs will appear here after you finish reading articles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
