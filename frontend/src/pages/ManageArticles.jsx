import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Trash2, Edit2, Plus, Sparkles, Loader2 } from 'lucide-react';

export default function ManageArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [fullContent, setFullContent] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const checkAdmin = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return false;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'ADMIN') {
      navigate('/');
      return false;
    }
    return true;
  };

  const loadData = async (currentPage = 0) => {
    try {
      setLoading(true);
      const data = await api.getArticles(currentPage, 10);
      setArticles(data.content || []);
      setTotalPages(data.totalPages || 1);

      const cats = await api.getCategories();
      const srcs = await api.getSources();
      setCategories(cats);
      setSources(srcs);
    } catch (err) {
      console.error(err);
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkAdmin()) {
      loadData(page);
    }
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title || !categoryId || !sourceId || !fullContent) {
      setError("Please fill out all fields.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update PostgreSQL metadata
        await api.updateArticle(editingId, title, parseInt(sourceId), parseInt(categoryId));
        // Update MongoDB body content
        await api.updateContent(editingId, title, fullContent);
        
        alert("Article updated successfully!");
      } else {
        // Create new article metadata in PostgreSQL
        const article = await api.createArticle(title, parseInt(sourceId), parseInt(categoryId));
        
        // Create detailed body content & embeddings in MongoDB
        await api.createContent(article.id, title, fullContent);

        alert("Article created successfully!");
      }
      
      // Reset form
      handleCancelEdit();
      loadData(page);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Operation failed. Check server logs.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = async (article) => {
    setError('');
    setEditingId(article.id);
    setTitle(article.title);
    setCategoryId(article.category?.id || '');
    setSourceId(article.source?.id || '');
    
    // Load full content from MongoDB to populate form
    try {
      setSaving(true);
      const content = await api.getContent(article.id);
      setFullContent(content.fullContent || '');
    } catch (e) {
      console.warn("Could not find MongoDB body text for editing.");
      setFullContent('');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article? This will remove its headers from PostgreSQL and detailed body/embeddings from MongoDB.")) return;
    try {
      // Delete from PostgreSQL
      await api.deleteArticle(id);
      // Delete from MongoDB
      try {
        await api.deleteContent(id);
      } catch (err) {
        console.warn("MongoDB delete content warning (was probably already deleted):", err);
      }
      alert("Article deleted successfully!");
      loadData(page);
    } catch (err) {
      console.error(err);
      alert("Failed to delete article.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setCategoryId('');
    setSourceId('');
    setFullContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-sky-400">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin Panel
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Article Editor Form (left/top) */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            {editingId ? 'Edit Article' : 'Create New Article'}
          </h2>

          {error && <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 text-sm rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Select tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Source</option>
                  {sources.map(s => <option key={s.id} value={s.id}>{s.sourceName}</option>)}
                </select>
              </div>
            </div>

            {/* Rich Content (MongoDB) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Content (Markdown / Text)</label>
              <textarea
                rows={10}
                value={fullContent}
                onChange={(e) => setFullContent(e.target.value)}
                placeholder="Write full article body text here. Saving this will automatically trigger local AI embedding generation..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-55"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-600 dark:hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4.5 w-4.5" />
                    {editingId ? 'Update Article' : 'Publish Article'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Article Listings (right/bottom) */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Published Articles</h2>
          
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading articles...</div>
          ) : articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map(a => (
                <div key={a.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                  <div className="space-y-0.5 max-w-[70%]">
                    <h4 className="font-bold text-slate-900 dark:text-slate-200 truncate">{a.title}</h4>
                    <p className="text-xs text-slate-450 dark:text-slate-500">
                      Category: {a.category?.categoryName} | Source: {a.source?.sourceName}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(a)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Edit content"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(a.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Delete article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Simple Page Selection */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg disabled:opacity-50 text-xs font-semibold"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
                  <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg disabled:opacity-50 text-xs font-semibold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">No articles published yet.</div>
          )}
        </div>

      </div>
    </div>
  );
}
