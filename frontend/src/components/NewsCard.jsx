import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Calendar, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function NewsCard({ article, onBookmarkToggle = null, isBookmarkedDefault = false }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(isBookmarkedDefault);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const statusRes = await api.getLikeStatus(article.id);
          if (active) setLiked(statusRes.liked);
        }
        const countRes = await api.getLikeCount(article.id);
        if (active) setLikeCount(countRes.count);
      } catch (err) {
        console.error("Error fetching card status:", err);
      }
    };
    fetchStatus();
    return () => {
      active = false;
    };
  }, [article.id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const res = await api.toggleLike(article.id);
      setLiked(res.status === 'liked');
      setLikeCount(res.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const res = await api.toggleBookmark(article.id);
      const isAdded = res.status === 'added';
      setBookmarked(isAdded);
      if (onBookmarkToggle) {
        onBookmarkToggle(article.id, isAdded);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden h-full">
      {/* Category tag & buttons */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-sky-950/40 dark:text-sky-400">
              {article.category?.categoryName || 'General'}
            </span>
            <span className="text-xs text-indigo-600 dark:text-sky-400 font-bold">
              {article.source?.sourceName}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-4">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(article.publishedDate)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                liked 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : 'text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              disabled={loading}
              className={`p-1.5 rounded-full transition-colors ${
                bookmarked
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20'
                  : 'text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <Link
            to={`/article/${article.id}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
          >
            Read
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
