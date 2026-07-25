import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, AlertTriangle, Users, Cpu, Clock, MapPin, 
  Activity, Bell, ChevronRight, Plus, ExternalLink 
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import LiveMap from '../components/LiveMap';
import contactService from '../services/contactService';
import locationService from '../services/locationService';

export default function Dashboard() {
  const { user } = useAuth();

  const [contactCount, setContactCount] = useState(0);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [contactsData, locationsData] = await Promise.all([
          contactService.getContacts(),
          locationService.getRecentLocations(5),
        ]);
        setContactCount(contactsData.length);
        setRecentEvents(locationsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const lastEvent = recentEvents.length > 0 ? recentEvents[0] : null;

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
            <Link
              to="/sos"
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Trigger SOS</span>
            </Link>
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
          <div className="text-3xl font-extrabold text-white">{recentEvents.length}</div>
          <p className="mt-1 text-xs text-slate-500">
            {recentEvents.length === 0 ? 'No emergency triggers' : 'Emergency events recorded'}
          </p>
        </div>

        {/* Trusted Contacts */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trusted Contacts</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{contactCount}</div>
          <Link to="/contacts" className="mt-1 text-xs text-emerald-400 hover:underline flex items-center gap-1">
            <span>Manage contacts</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
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
          <div className="text-sm font-bold text-slate-200">
            {lastEvent ? lastEvent.emergency_type : 'None'}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {lastEvent ? new Date(lastEvent.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'System operating normally'}
          </p>
        </div>
      </div>

      {/* Main Content Layout: Live Interactive Leaflet Map & Recent Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white">Live Geolocation Tracking Map</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Leaflet • OpenStreetMap
            </span>
          </div>

          <LiveMap height="440px" />
        </div>

        {/* Emergency Timeline */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              </div>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs">No emergency events logged yet.</p>
                <p className="text-[11px] text-slate-600">Trigger an SOS to record emergency events.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5 font-bold text-xs">
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-semibold">{event.emergency_type}</h4>
                        <p className="text-slate-400 text-[11px] mt-0.5 font-mono">
                          {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                        </p>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <a
                      href={event.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Open Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              to="/sos"
              className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold text-xs border border-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency Dispatch Center</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
