import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 cyber-grid">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-card rounded-2xl p-8 border border-gray-800 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-sm text-gray-400 mt-1">
              Sign in to run security audits on your vibe-coded apps
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
