import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EditProfileModal } from './EditProfileModal';
import {
  Code2,
  Bell,
  CheckCircle,
  PlusCircle,
  Users,
  Trophy,
  ChevronDown,
  ExternalLink,
  LogOut,
  LogIn,
  UserPlus,
  User,
  Edit3,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [latestToast, setLatestToast] = useState(null);
  const previousUnreadCount = useRef(0);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const data = await api.getNotifications();
      const currentList = data.notifications || [];
      const currentUnread = data.unreadCount || 0;

      // Detect newly arrived notifications to trigger live toast
      if (currentUnread > previousUnreadCount.current && currentList.length > 0) {
        const newest = currentList[0];
        setLatestToast(newest);
        setTimeout(() => setLatestToast(null), 6000);
      }
      previousUnreadCount.current = currentUnread;

      setNotifications(currentList);
      setUnreadCount(currentUnread);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2500); // 2.5s live polling

    const handleImmediateRefresh = () => {
      fetchNotifications();
    };
    window.addEventListener('cra_notification_refresh', handleImmediateRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cra_notification_refresh', handleImmediateRefresh);
    };
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await api.markNotificationRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setShowNotifications(false);
      if (notif.reviewId?._id || notif.reviewId) {
        navigate(`/reviews/${notif.reviewId?._id || notif.reviewId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-lg text-white font-mono">
                  CodeReview<span className="text-indigo-400">Arena</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Peer Code Review Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Explore Reviews
            </Link>
            <Link
              to="/match"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Reviewers</span>
            </Link>
            <Link
              to="/leaderboard"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </Link>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Submit review button */}
              <Link
                to="/create-review"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Code</span>
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in duration-100 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-800/70 transition-colors ${
                              !n.isRead ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <img
                                src={n.sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                                alt=""
                                className="w-6 h-6 rounded-full shrink-0 border border-slate-700"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-200 text-xs leading-snug">{n.message}</p>
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg border border-indigo-500/40 object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-semibold text-white block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-indigo-400 capitalize font-mono">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-2 border-b border-slate-800 text-xs">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">@{user.username}</p>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsEditProfileOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Edit Profile & Photo</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Simultaneous Toast Notification Alert */}
      {latestToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border-2 border-indigo-500/80 rounded-2xl p-4 shadow-2xl shadow-indigo-950/50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Real-Time Event</span>
                </span>
                <button
                  onClick={() => setLatestToast(null)}
                  className="text-slate-400 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-snug line-clamp-2">
                {latestToast.message}
              </p>
              <button
                onClick={() => {
                  const t = latestToast;
                  setLatestToast(null);
                  handleNotificationClick(t);
                }}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View Review Now</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      )}
    </header>
  );
};
