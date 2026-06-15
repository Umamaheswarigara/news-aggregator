import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, User, Search, ShieldAlert, ShieldCheck, Calendar, Shield } from 'lucide-react';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
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

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve user accounts. Admin access required.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkAdmin()) {
      loadUsers();
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Filter users by name or email in search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-sky-400">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin Panel
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            Registered User Accounts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor registration metrics, account info, and system roles.
          </p>
        </div>

        {/* Search filter input */}
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 w-full sm:w-64 transition-all">
          <Search className="h-4 w-4 text-slate-400 ml-3.5 absolute" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-3 py-2.5 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Table details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-rose-600 dark:text-rose-400 font-medium">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-rose-500" />
            {error}
          </div>
        ) : loading ? (
          <div className="text-center py-20 font-medium text-slate-500">Loading user accounts...</div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xxs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Security Role</th>
                  <th className="px-6 py-4">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-400 dark:text-slate-600">#{user.id}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="h-8 w-8 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold uppercase shrink-0">
                        {user.name.slice(0,2)}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="px-6 py-4 font-normal text-slate-500 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4 font-normal text-slate-500 dark:text-slate-400">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20">
                          <ShieldCheck className="h-3 w-3" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40">
                          <User className="h-3 w-3" />
                          USER
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            No accounts found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
