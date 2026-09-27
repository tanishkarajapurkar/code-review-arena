import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Upload, Check, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';

const PRESET_AVATARS = [
  {
    name: 'Cyber Bot A',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=tanishka-dev',
  },
  {
    name: 'Cyber Bot B',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex-coder',
  },
  {
    name: 'Dev Professional 1',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dev Professional 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dev Professional 3',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pixel Dev',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=arena-dev',
  },
];

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [languagesStr, setLanguagesStr] = useState(user?.languages?.join(', ') || 'JavaScript, Python');
  const [role, setRole] = useState(user?.role || 'reviewer');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    setAvatar(customUrl.trim());
    setCustomUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const langs = languagesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedUser = await api.updateProfile({
        name,
        bio,
        avatar,
        languages: langs,
        role,
      });

      setSuccessMsg('Profile updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
      setTimeout(() => {
        onClose();
        window.location.reload(); // refresh to propagate avatar everywhere
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Profile & Photo</h2>
              <p className="text-xs text-slate-400">Update your avatar, bio, and developer credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Profile Photo
            </label>

            {/* Current Selected Avatar Preview */}
            <div className="flex items-center gap-4 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <img
                src={avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=preview'}
                alt="Avatar preview"
                className="w-16 h-16 rounded-2xl border-2 border-indigo-500 object-cover shadow-lg"
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-xs font-semibold text-white block">Current Avatar</span>
                <p className="text-[11px] text-slate-400">
                  Select a preset below, paste an image URL, or upload from your device.
                </p>

                {/* Local file upload button */}
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Presets Grid */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Or choose from quick presets:
              </span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(p.url)}
                    className={`relative rounded-xl overflow-hidden border p-0.5 transition-all ${
                      avatar === p.url
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    title={p.name}
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-full h-11 rounded-lg object-cover bg-slate-800"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Or paste custom image URL (https://...)"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                disabled={!customUrl.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium transition-colors"
              >
                Set URL
              </button>
            </div>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Platform Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="reviewer">Reviewer</option>
                <option value="author">Author</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bio & Developer Headline
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer • React & TypeScript specialist"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Languages & Skills (comma-separated)
            </label>
            <input
              type="text"
              value={languagesStr}
              onChange={(e) => setLanguagesStr(e.target.value)}
              placeholder="JavaScript, Python, React, Java, TypeScript"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
