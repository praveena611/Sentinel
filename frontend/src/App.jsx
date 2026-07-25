import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Activity, Cpu, Bell, MapPin } from 'lucide-react';

function HomeOverview() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 md:p-10 mb-8 border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Sprint 1 Active — Platform Operational
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Sentinel<span className="text-red-500">AI</span>
            </h1>
            <p className="mt-2 text-slate-400 text-lg max-w-2xl">
              Intelligent Multimodal Emergency Response System — Real-Time Detection, Geolocation & Trusted Contact Dispatch.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all border border-slate-700 shadow-lg"
            >
              API Docs (/docs)
            </a>
          </div>
        </div>
      </div>

      {/* Grid of System Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card glass-card-hover p-6 rounded-xl">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Multimodal AI Detection</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Integrates DistilBERT text classification, OpenAI Whisper speech-to-text, and YOLOv8 object recognition for rapid threat assessment.
          </p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-xl">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Live Geolocation</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Captures precise user GPS coordinates via Browser Geolocation API rendered dynamically on Leaflet / OpenStreetMap.
          </p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-xl">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Instant Dispatch</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Executes high-priority dispatch notifications to trusted contacts via dedicated <code className="text-red-400">ntfy.sh</code> notification pipelines.
          </p>
        </div>
      </div>

      {/* System Status Table */}
      <div className="glass-card p-6 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            System Architecture Status
          </h3>
          <span className="text-xs text-slate-500 font-mono">v1.0.0</span>
        </div>

        <div className="divide-y divide-slate-800">
          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">FastAPI Backend</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/20">Configured (Port 8000)</span>
          </div>
          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">React + Vite Frontend</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/20">Configured (Port 5173)</span>
          </div>
          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">SQLite Database Engine</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/20">Initialized</span>
          </div>
          <div className="py-3 flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">Tailwind CSS Design System</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/20">Dark Theme Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#090d16] flex flex-col justify-between">
        {/* Navigation Bar Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sentinel<span className="text-red-500">AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">System Ready</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeOverview />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 py-6 px-6 glass-card">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 SentinelAI — Intelligent Multimodal Emergency Response Platform.</p>
            <p className="font-mono">Clean Architecture • Enterprise Ready</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
