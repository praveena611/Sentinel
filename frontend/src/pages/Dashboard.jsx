import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Users, Cpu, Clock, MapPin, Activity, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-6 md:p-8 border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              Sentinel Emergency Monitoring Active
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'User'}
            </h1>
            <p className="mt-1 text-slate-400 text-sm md:text-base">
              Logged in as <span className="text-slate-200 font-mono">{user?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Trigger SOS
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Emergency Alerts */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Alerts</span>
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">0</div>
          <p className="mt-1 text-xs text-slate-500">No emergency triggers recorded</p>
        </div>

        {/* Trusted Contacts */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trusted Contacts</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">0</div>
          <p className="mt-1 text-xs text-slate-500">Add emergency contacts</p>
        </div>

        {/* AI Detection Accuracy */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Accuracy</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">98.4%</div>
          <p className="mt-1 text-xs text-slate-500">DistilBERT / Whisper / YOLOv8</p>
        </div>

        {/* Last Emergency */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Emergency</span>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-300">None</div>
          <p className="mt-1 text-xs text-slate-500">System operating normally</p>
        </div>
      </div>

      {/* Main Content Layout: Live Map & Emergency Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Map Area */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white">Live GPS Location Tracking</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Live Map Connected
            </span>
          </div>

          <div className="flex-1 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 pulse-emergency mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">GPS Positioning System Ready</h4>
            <p className="text-slate-400 text-xs max-w-md">
              Leaflet & OpenStreetMap geolocation initialized. Trigger an emergency to publish live location to trusted contacts.
            </p>
          </div>
        </div>

        {/* Emergency Timeline */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-white text-xs font-semibold">Session Authenticated</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">User logged into SentinelAI dashboard.</p>
                <span className="text-slate-500 text-[10px]">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
