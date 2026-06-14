import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Trash2, Edit2, Plus, Sparkles } from 'lucide-react';

export default function ManageSources() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  
  // Form states
  const [sourceName, setSourceName] = useState('');
  const [website, setWebsite] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getSources();
      setSources(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load sources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkAdmin()) {
      loadData();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!sourceName.trim() || !website.trim()) {
      setError("Source name and website are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.updateSource(editingId, sourceName.trim(), website.trim());
        alert("Source updated successfully!");
      } else {
        await api.createSource(sourceName.trim(), website.trim());
        alert("Source created successfully!");
      }
      setSourceName('');
      setWebsite('');
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (source) => {
    setError('');
    setEditingId(source.id);
    setSourceName(source.sourceName);
    setWebsite(source.website || '');
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news source? All articles published by this source will be deleted too.")) return;
    try {
      await api.deleteSource(id);
      alert("Source deleted successfully!");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete source.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-sky-400">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin Panel
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Editor Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            {editingId ? 'Edit Source' : 'Create New Source'}
          </h2>

          {error && <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 text-sm rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Name</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. TechCrunch, BBC News..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex gap-2 justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setSourceName(''); setWebsite(''); }}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-600 dark:hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                {editingId ? 'Update Source' : 'Create Source'}
              </button>
            </div>
          </form>
        </div>

        {/* Sources List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registered Sources</h2>
          
          {loading ? (
            <div className="text-center py-6 text-slate-500">Loading sources...</div>
          ) : sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map(src => (
                <div key={src.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-slate-200 block">{src.sourceName}</span>
                    <a href={src.website} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 dark:text-sky-400 hover:underline">{src.website}</a>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(src)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(src.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">No sources found.</div>
          )}
        </div>

      </div>
    </div>
  );
}
