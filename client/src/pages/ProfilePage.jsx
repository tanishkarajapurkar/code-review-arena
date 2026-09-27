import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReviewCard } from '../components/ReviewCard';
import {
  User,
  Shield,
  Star,
  CheckCircle,
  Code2,
  Award,
  Zap,
  BookOpen,
  Cpu,
  ArrowLeft,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EditProfileModal } from '../components/EditProfileModal';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cleanMsg, setCleanMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getUserProfile(username);
        setProfile(data);

        // Fetch reviews authored by this user
        if (data?._id) {
          const revs = await api.getReviews({ author: data._id });
          setUserReviews(revs || []);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Loading developer profile...</p>
      </div>
    );
  }

  const expertiseMetrics = [
    { label: 'Security', value: profile.expertise?.security || 75, icon: '🔐', color: 'bg-red-500' },
    { label: 'Performance', value: profile.expertise?.performance || 80, icon: '⚡', color: 'bg-amber-500' },
    { label: 'Code Quality', value: profile.expertise?.code_quality || 85, icon: '🧹', color: 'bg-purple-500' },
    { label: 'Readability', value: profile.expertise?.readability || 80, icon: '📖', color: 'bg-sky-500' },
    { label: 'React', value: profile.expertise?.react || 85, icon: '⚛️', color: 'bg-cyan-500' },
    { label: 'Algorithms', value: profile.expertise?.algorithms || 70, icon: '🧠', color: 'bg-emerald-500' },
  ];

  const handleCleanReviewers = async () => {
    if (!window.confirm("Clean placeholder demo reviewers so you can register and deploy with real users?")) return;
    try {
      await api.clearDemoReviewers();
      setCleanMsg('Demo reviewers cleared. Ready for real users!');
      setTimeout(() => setCleanMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const isOwnProfile = currentUser?.username === profile.username || currentUser?._id === profile._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Arena</span>
        </Link>

        {cleanMsg && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 font-medium">
            {cleanMsg}
          </span>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 min-w-0">
            <div className="relative group">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-xl"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-medium text-white transition-opacity"
                  title="Change Profile Photo"
                >
                  <Edit3 className="w-5 h-5 text-indigo-400" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  @{profile.username}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono uppercase font-bold ${
                    profile.role === 'reviewer'
                      ? 'bg-purple-500/20 text-purple-300'
                      : profile.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {profile.role}
                </span>
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{profile.bio}</p>

              {/* Language badges */}
              <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 mr-1">Languages:</span>
                {profile.languages?.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col items-center gap-2.5 shrink-0 w-full sm:w-auto">
            {isOwnProfile && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile & Photo</span>
              </button>
            )}

            <button
              onClick={handleCleanReviewers}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Clean placeholder reviewers so only real registered users participate"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clean Demo Reviewers</span>
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Reviewer Metrics & Expertise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 1 col: Key Stats */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Reviewer Credentials</span>
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Reviews Completed</span>
              <span className="text-base font-bold font-mono text-white">
                {profile.stats?.reviewsCompleted || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Helpful Reviews</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {profile.stats?.helpfulReviews || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Average Quality Rating</span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{profile.stats?.averageRating || 4.9}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Availability</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Accepting Reviews
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 cols: Review Expertise Progress Bars */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Review Expertise Breakdown</span>
            </h2>
            <span className="text-[11px] text-slate-500">Based on verified reviews</span>
          </div>

          <div className="space-y-4 pt-2">
            {expertiseMetrics.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="font-semibold text-slate-200">{item.label}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">{item.value}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Authored Submissions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span>Submissions by {profile.name} ({userReviews.length})</span>
        </h2>

        {userReviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400">
            No public review submissions authored yet.
          </div>
        ) : (
          <div className="space-y-3">
            {userReviews.map((rev) => (
              <ReviewCard key={rev._id} review={rev} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile & Photo Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={(updated) => {
          setProfile(updated);
        }}
      />
    </div>
  );
};
