import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthNavbar } from './components/AuthNavbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewDetailsPage } from './pages/ReviewDetailsPage';
import { CreateReviewPage } from './pages/CreateReviewPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ReviewerMatchPage } from './pages/ReviewerMatchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Code2 } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Header: Auth screens show ONLY the Logo; Authenticated Arena shows full navigation & controls */}
      {isAuthRoute ? <AuthNavbar /> : <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes (Redirect to / if already logged in) */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Routes: Unauthenticated visits redirect straight to /login */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/:id"
            element={
              <ProtectedRoute>
                <ReviewDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-review"
            element={
              <ProtectedRoute>
                <CreateReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match"
            element={
              <ProtectedRoute>
                <ReviewerMatchPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {isAuthRoute ? (
        // Minimalist footer on Login & Register
        <footer className="border-t border-slate-800/60 bg-slate-950/60 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 font-mono">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-300">Code Review Arena</span>
              <span>•</span>
              <span>Engineering Quality & Peer Review Platform</span>
            </div>
            <div className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} Code Review Arena. All rights reserved.
            </div>
          </div>
        </footer>
      ) : (
        // Full footer on Dashboard and Internal Arena Pages
        <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Code Review Arena</span>
              <span>•</span>
              <span className="text-slate-500">Peer Code Quality & Review Workflow</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-white transition-colors">Explore</Link>
              <Link to="/match" className="hover:text-white transition-colors">Reviewers</Link>
              <Link to="/leaderboard" className="hover:text-white transition-colors">Honor Roll</Link>
              <Link to="/create-review" className="hover:text-white transition-colors">Submit Code</Link>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <span>React • Monaco • Node.js • MongoDB</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
