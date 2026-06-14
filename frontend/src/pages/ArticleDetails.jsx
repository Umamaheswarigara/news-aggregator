import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Calendar, Heart, Bookmark, Share2, Tag, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function ArticleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [mongoContent, setMongoContent] = useState(null);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ref to track start time for reading duration logs
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Record start time
    startTimeRef.current = Date.now();

    const fetchArticleData = async () => {
      try {
        setLoading(true);
        // Load metadata (Spring Boot)
        const meta = await api.getArticle(id);
        setArticle(meta);

        // Load content (Node.js)
        try {
          const content = await api.getContent(id);
          setMongoContent(content);
        } catch (e) {
          console.warn("MongoDB content missing for this article header. Creating a default mock content.");
          setMongoContent({
            fullContent: "This article has no detailed body text. As an administrator, you can add detailed content in the admin dashboard.",
            summary: "No summary available.",
            keywords: ["General"]
          });
        }

        // Load like/bookmark states
        const token = localStorage.getItem('token');
        if (token) {
          const likeRes = await api.getLikeStatus(id);
          setLiked(likeRes.liked);
          const bms = await api.getBookmarks();
          const isBmed = bms.some(b => b.article.id === parseInt(id));
          setBookmarked(isBmed);
        }

        const countRes = await api.getLikeCount(id);
        setLikeCount(countRes.count);
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Error loading article metadata.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();

    // Cleanup: log reading activity
    return () => {
      const token = localStorage.getItem('token');
      if (token && startTimeRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        // Only log if read for more than 2 seconds
        if (timeSpent >= 2) {
          console.log(`User read article ${id} for ${timeSpent} seconds.`);
          api.logReadingHistory(parseInt(id), timeSpent).catch(err => {
            console.error("Failed to log reading history:", err);
          });
        }
      }
    };
  }, [id]);

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.toggleLike(id);
      setLiked(res.status === 'liked');
      setLikeCount(res.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.toggleBookmark(id);
      setBookmarked(res.status === 'added');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Article link copied to clipboard!");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-medium text-slate-500">
        Loading article body...
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Article Not Found</h3>
        <p className="text-slate-500">{error || "The requested article could not be loaded."}</p>
        <Link to="/" className="text-indigo-600 dark:text-sky-400 font-bold hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to News Feed
      </Link>

      {/* Meta Headers */}
      <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-sky-950/40 dark:text-sky-400">
            {article.category?.categoryName}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Published by {article.source?.sourceName}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.publishedDate)}
            </span>
            <span className="flex items-center gap-1" title="Reading speed indicator">
              <Clock className="h-4 w-4" />
              <span>{Math.max(1, Math.round((mongoContent?.fullContent?.split(' ').length || 100) / 200))} min read</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-full border transition-all ${
                liked 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              title="Like"
            >
              <Heart className={`h-4.5 w-4.5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <span className="font-bold text-slate-700 dark:text-slate-300 pr-2">{likeCount}</span>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full border transition-all ${
                bookmarked 
                  ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`h-4.5 w-4.5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="Share Link"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI generated summary banner */}
      {mongoContent?.summary && (
        <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-sky-50/50 dark:from-indigo-950/10 dark:to-sky-950/10 border border-indigo-100/50 dark:border-indigo-900/10 rounded-2xl space-y-2">
          <h3 className="font-bold text-indigo-900 dark:text-sky-400 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            AI Generated Summary
          </h3>
          <p className="text-slate-700 dark:text-slate-355 text-sm leading-relaxed italic">
            "{mongoContent.summary}"
          </p>
        </div>
      )}

      {/* Article Body */}
      <div className="text-slate-800 dark:text-slate-200 text-md leading-relaxed space-y-6 whitespace-pre-wrap max-w-none">
        {mongoContent?.fullContent}
      </div>

      {/* Keywords Tags */}
      {mongoContent?.keywords && mongoContent.keywords.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" />
            <span>Keywords & Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mongoContent.keywords.map((word, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg"
              >
                #{word.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
