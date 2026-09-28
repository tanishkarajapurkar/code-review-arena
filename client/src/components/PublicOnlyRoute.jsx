import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Loader2 } from 'lucide-react';

export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center gap-4 text-slate-300">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-indigo-500/20 blur-xl animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    // Already authenticated, send to main arena dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};
