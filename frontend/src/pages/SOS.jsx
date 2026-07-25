import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Shield, MapPin, Bell, Radio, ExternalLink, 
  CheckCircle2, AlertCircle, Loader2, Navigation 
} from 'lucide-react';
import sosService from '../services/sosService';
import { useAuth } from '../context/AuthContext';

export default function SOS() {
  const { user } = useAuth();

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  const [triggering, setTriggering] = useState(false);
  const [eventResult, setEventResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch current GPS position on mount
  const acquireLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation({
        latitude: 12.9716, // Fallback default (Bangalore)
        longitude: 77.5946,
        accuracy: 100,
        loading: false,
        error: 'Geolocation is not supported by your browser. Using fallback coordinates.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback default coordinates if denied or unavailable
        setLocation({
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 500,
          loading: false,
          error: 'Location access denied or unavailable. Using estimated coordinates.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    acquireLocation();
  }, []);

  const handleTriggerSOS = async () => {
    if (triggering) return;
    setTriggering(true);
    setErrorMessage('');
    setEventResult(null);

    const lat = location.latitude || 12.9716;
    const lng = location.longitude || 77.5946;

    try {
      const response = await sosService.triggerSOS({
        latitude: lat,
        longitude: lng,
        emergency_type: 'Manual SOS',
      });
      setEventResult(response);
    } catch (err) {
      console.error('SOS trigger error:', err);
      const msg = err.response?.data?.detail || 'Failed to dispatch SOS alert. Please try again.';
      setErrorMessage(msg);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          Instant Emergency Dispatch
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Manual <span className="text-red-500">SOS</span> Trigger
        </h1>
        <p className="mt-2 text-slate-400 text-sm md:text-base">
          Pressing the SOS button instantly captures your live GPS coordinates, logs the emergency event, and broadcasts push alerts to your trusted contacts via <code className="text-red-400">ntfy.sh</code>.
        </p>
      </div>

      {/* Geolocation Status Bar */}
      <div className="glass-card rounded-2xl p-4 md:p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live GPS Location</span>
              {location.loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            </div>
            <p className="text-white font-mono text-sm font-semibold">
              {location.loading
                ? 'Acquiring GPS coordinates...'
                : `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {location.error && (
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              {location.error}
            </span>
          )}
          <button
            onClick={acquireLocation}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>Recalibrate GPS</span>
          </button>
        </div>
      </div>

      {/* Massive Pulsating SOS Trigger Button */}
      <div className="glass-card rounded-3xl p-10 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[360px]">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative mb-6 cursor-pointer"
          onClick={handleTriggerSOS}
        >
          {/* Outer Pulsating Ring */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center pulse-emergency">
            {/* Inner Red SOS Button */}
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-red-500 shadow-2xl shadow-red-600/50 border-4 border-red-400/50 flex flex-col items-center justify-center text-white select-none">
              {triggering ? (
                <Loader2 className="w-14 h-14 animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 mb-1 drop-shadow-md" />
                  <span className="text-2xl md:text-3xl font-black tracking-widest drop-shadow-md">SOS</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-1">
          {triggering ? 'Dispatching Emergency Alert...' : 'Tap Button to Trigger Emergency SOS'}
        </h3>
        <p className="text-slate-400 text-xs md:text-sm max-w-md">
          {triggering ? 'Publishing live GPS position to ntfy.sh and logging event...' : 'Clicking will instantly publish your location and alert trusted contacts.'}
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white mb-0.5">SOS Dispatch Failed</h4>
            <p>{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Success Dispatch Result Card */}
      <AnimatePresence>
        {eventResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/20 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Emergency Alert Dispatched Successfully</h3>
                  <p className="text-emerald-400 text-xs">Event ID #{eventResult.id} • Status: {eventResult.status}</p>
                </div>
              </div>

              <a
                href={eventResult.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>View Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Emergency Type</span>
                <span className="text-white font-bold text-sm">{eventResult.emergency_type}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Confidence Score</span>
                <span className="text-emerald-400 font-bold text-sm">{(eventResult.confidence_score * 100).toFixed(0)}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Notification Delivery Status</span>
                <span className={`font-bold text-sm ${eventResult.notification?.notification_status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {eventResult.notification?.notification_status || 'SUCCESS'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
