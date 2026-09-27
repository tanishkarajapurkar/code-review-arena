import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowLeft, Send, Sparkles, AlertCircle, LogIn } from 'lucide-react';

export const CreateReviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('javascript, beginner');
  const [code, setCode] = useState(`function calculateTotal(items) {
    let total = 0;

    for(let i = 0; i < items.length; i++) {
        total += items[i].price;
    }

    return total;
}`);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const languageTemplates = {
    javascript: `function calculateTotal(items) {
    let total = 0;

    for(let i = 0; i < items.length; i++) {
        total += items[i].price;
    }

    return total;
}`,
    java: `package com.example;

public class Algorithm {
    public int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
    python: `def process_user_data(users, filters):
    result = []
    for user in users:
        is_valid = True
        for key, value in filters.items():
            if user.get(key) != value:
                is_valid = False
                break
        if is_valid:
            result.append(user)
    return result`,
    react: `import { useState, useEffect } from 'react';

export function DataWidget({ endpoint }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(endpoint)
            .then(res => res.json())
            .then(d => setData(d));
    }, [endpoint]);

    return <div>{JSON.stringify(data)}</div>;
}`,
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (languageTemplates[newLang]) {
      setCode(languageTemplates[newLang]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit code for review. Please sign in or register first.');
      return;
    }
    if (!title.trim() || !code.trim() || !description.trim()) {
      setError('Please fill in title, description, and source code.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.createReview({
        title,
        language,
        difficulty,
        description,
        tags,
        code,
      });

      navigate(`/reviews/${res.review._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit review request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Back</span>
        </button>
      </div>

      {!user && (
        <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-300">
            <LogIn className="w-5 h-5 shrink-0" />
            <span>You are currently not logged in. Sign in or create a real user account to submit code.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium">
              Sign In
            </Link>
            <Link to="/register" className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Register Account
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Create Review Request</h1>
            <p className="text-xs text-slate-400">
              Submit your code snippet to the arena for structured line-level feedback
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Review Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Improve shopping cart calculation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Language & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="react">React / JSX</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Review Objectives & Problem Statement <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain what this code does, what feedback you are seeking (performance, readability, edge cases), and any constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. javascript, arrays, beginner, performance"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Monaco Source Code Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Initial Code Submission (Version 1) <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono uppercase">
                {language}
              </span>
            </div>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="320px"
                language={language === 'react' ? 'javascript' : language}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', monospace",
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting to Arena...' : 'Submit Review Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
