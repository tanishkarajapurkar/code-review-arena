import React from 'react';
import { Code2, ShieldCheck } from 'lucide-react';

export const AuthNavbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Sole Logo on Auth Screens - No Navigation Links or Dashboard Options */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-lg text-white font-mono">
                CodeReview<span className="text-indigo-400">Arena</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Peer Code Review & Quality Platform</p>
          </div>
        </div>

        {/* Minimal Security Indicator on Auth Header */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Developer Authentication Portal</span>
        </div>
      </div>
    </header>
  );
};
