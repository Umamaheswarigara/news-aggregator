import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Trash2, Edit2, Plus, Sparkles } from 'lucide-react';

export default function ManageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [categoryName, setCategoryName] = useState('');
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
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
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
    
    if (!categoryName.trim()) {
      setError("Category name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.updateCategory(editingId, categoryName.trim());
        alert("Category updated successfully!");
      } else {
        await api.createCategory(categoryName.trim());
        alert("Category created successfully!");
      }
      setCategoryName('');
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (category) => {
    setError('');
    setEditingId(category.id);
    setCategoryName(category.categoryName);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? All articles associated with this category will be deleted too.")) return;
    try {
      await api.deleteCategory(id);
      alert("Category deleted successfully!");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category. Check cascade constraints.");
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
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h2>

          {error && <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 text-sm rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Technology, Finance, Health..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex gap-2 justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setCategoryName(''); }}
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
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available Categories</h2>
          
          {loading ? (
            <div className="text-center py-6 text-slate-500">Loading categories...</div>
          ) : categories.length > 0 ? (
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                  <span className="font-bold text-slate-900 dark:text-slate-200">{cat.categoryName}</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cat.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">No categories found.</div>
          )}
        </div>

      </div>
    </div>
  );
}
