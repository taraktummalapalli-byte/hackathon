import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, SearchCode, History, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-cyan-400 bg-clip-text text-transparent">
                CodeGuard<span className="text-cyan-400 font-mono">.AI</span>
              </span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-mono">Security Auditor</span>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-gray-800">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/new-scan"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/new-scan')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <SearchCode className="w-4 h-4" />
                New Audit
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/history')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <History className="w-4 h-4" />
                History
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono text-gray-300 max-w-[160px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md shadow-cyan-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
