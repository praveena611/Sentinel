import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User as UserIcon, LogIn, UserPlus, Users, LayoutDashboard, AlertTriangle } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmergencyContacts from './pages/EmergencyContacts';
import SOS from './pages/SOS';

function NavigationBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Sentinel<span className="text-red-500">AI</span>
            </span>
          </Link>

          {/* Navigation Links for Authenticated Users */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive('/dashboard')
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/contacts"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive('/contacts')
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Contacts</span>
              </Link>
              <Link
                to="/sos"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive('/sos')
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Trigger SOS</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span>{user?.full_name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-all flex items-center gap-2"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-slate-700 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HomeOverview() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 md:p-12 mb-8 border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Shield className="w-3.5 h-3.5" />
            Enterprise Emergency Response System
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            Sentinel<span className="text-red-500">AI</span>
          </h1>

          <p className="text-slate-400 text-base md:text-xl max-w-2xl mb-8 leading-relaxed">
            Intelligent Multimodal Emergency Response System — Real-Time Text, Voice, Vision & Geolocation Alerting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all flex items-center gap-2"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/sos"
                  className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base shadow-xl shadow-red-600/30 transition-all flex items-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Trigger Emergency SOS
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base shadow-xl shadow-red-600/30 transition-all flex items-center gap-2"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all flex items-center gap-2"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#090d16] flex flex-col justify-between">
          <NavigationBar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomeOverview />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <EmergencyContacts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sos"
                element={
                  <ProtectedRoute>
                    <SOS />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <footer className="border-t border-slate-800/80 py-6 px-6 glass-card">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <p>© 2026 SentinelAI — Intelligent Multimodal Emergency Response Platform.</p>
              <p className="font-mono">Clean Architecture • ntfy.sh Emergency Pipeline</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}
