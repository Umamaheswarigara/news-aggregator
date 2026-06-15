import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ArticleDetails from './pages/ArticleDetails';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Admin from './pages/Admin';
import ManageArticles from './pages/ManageArticles';
import ManageCategories from './pages/ManageCategories';
import ManageSources from './pages/ManageSources';
import ManageUsers from './pages/ManageUsers';

import './App.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.body;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <main className="flex-1 w-full max-w-7xl mx-auto py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/article/:id" element={<ArticleDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/articles" element={<ManageArticles />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/sources" element={<ManageSources />} />
            <Route path="/admin/users" element={<ManageUsers />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
