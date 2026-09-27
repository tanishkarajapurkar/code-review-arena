import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, ArrowLeft, Check } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please provide email/username and password');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login({ usernameOrEmail, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Arena</span>
      </Link>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Log In</h1>
            <p className="text-xs text-slate-400">Access your Code Review Arena account</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              placeholder="e.g. tanishka or tanishka@reviewarena.dev"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
