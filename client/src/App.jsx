import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewDetailsPage } from './pages/ReviewDetailsPage';
import { CreateReviewPage } from './pages/CreateReviewPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ReviewerMatchPage } from './pages/ReviewerMatchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Code2, Heart, Shield, Terminal } from 'lucide-react';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reviews/:id" element={<ReviewDetailsPage />} />
              <Route path="/create-review" element={<CreateReviewPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/match" element={<ReviewerMatchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>

          {/* Footer */}
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

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Built with React + Monaco + Node.js + MongoDB</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
