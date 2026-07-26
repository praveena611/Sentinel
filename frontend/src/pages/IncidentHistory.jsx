import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, Filter, AlertTriangle, Shield, MapPin, 
  ExternalLink, Trash2, Calendar, Clock, Sparkles, ChevronRight, X, Loader2, CheckCircle2, Compass 
} from 'lucide-react';
import historyService from '../services/historyService';

export default function IncidentHistory() {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All'); // 'All', 'Critical', 'High', 'Medium', 'Low'

  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        severity: selectedSeverity !== 'All' ? selectedSeverity : undefined,
      };
      const res = await historyService.getIncidents(params);
      setIncidents(res.incidents);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch incident log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, selectedSeverity, searchQuery]);

  const handleOpenDetail = async (id) => {
    try {
      setDetailLoading(true);
      const detail = await historyService.getIncidentById(id);
      setSelectedIncident(detail);
    } catch (err) {
      console.error('Failed to fetch incident detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await historyService.deleteIncident(deleteId);
      setDeleteId(null);
      if (selectedIncident?.id === deleteId) setSelectedIncident(null);
      fetchIncidents();
    } catch (err) {
      console.error('Failed to delete incident:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            Audit Log & Incident Tracking
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Searchable Incident History
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Query past emergency events, filter by risk severity, inspect Explainable AI (XAI) reasoning, and manage audit records.
          </p>
        </div>

        <div className="glass-card px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          Total Incidents Logged: <strong className="text-white">{total}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search incidents by emergency type..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => { setSelectedSeverity(sev); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                selectedSeverity === sev
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Incident Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="text-xs">Loading incident audit log...</span>
        </div>
      ) : incidents.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 border border-slate-800 space-y-3">
          <History className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <h3 className="text-white font-bold text-base">No Incident Records Found</h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400">
            No emergency events match your current filter parameters. Trigger an SOS or AI detection to record incidents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 glass-card-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getSeverityBadge(incident.severity_level)}`}>
                    {incident.severity_level?.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">#{incident.id}</span>
                </div>

                <h3 className="text-white font-extrabold text-sm line-clamp-1 mb-1">
                  {incident.emergency_type}
                </h3>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mb-3">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(incident.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Risk Score</span>
                  <span className="text-white font-extrabold font-mono">{incident.risk_score?.toFixed(1)}/100</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenDetail(incident.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-1 border border-slate-700"
                >
                  <span>Inspect XAI</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={incident.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Open Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDeleteId(incident.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Incident"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {total > limit && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-mono">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* DETAILED INCIDENT INSPECTION MODAL */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl rounded-2xl p-6 md:p-8 border border-slate-800 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-bold text-white">Incident Audit Record #{selectedIncident.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Risk Score & Severity Header */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Risk Assessment Score</span>
                  <div className="text-3xl font-extrabold text-white mt-0.5">
                    {selectedIncident.risk_score?.toFixed(1)}<span className="text-sm text-slate-500 font-normal">/100</span>
                  </div>
                </div>

                <span className={`px-4 py-1.5 rounded-xl text-xs font-extrabold border ${getSeverityBadge(selectedIncident.severity_level)}`}>
                  {selectedIncident.severity_level?.toUpperCase()} SEVERITY
                </span>
              </div>

              {/* XAI Reasoning Summary */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Explainable AI (XAI) Reasoning</span>
                </div>
                <p className="text-slate-200 text-xs font-mono leading-relaxed">
                  {selectedIncident.explanation_summary || 'Automatic emergency pipeline trigger.'}
                </p>
              </div>

              {/* Context Intelligence Factors */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                  <Compass className="w-4 h-4" />
                  <span>Ambient Context Metadata</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>Time of Day: <strong className="text-white">{selectedIncident.time_of_day}</strong></div>
                  <div>Location Zone: <strong className="text-white">{selectedIncident.location_type}</strong></div>
                  <div>Weather: <strong className="text-white">{selectedIncident.weather_condition}</strong></div>
                  <div>Context Delta: <strong className="text-emerald-400">+{selectedIncident.context_risk_delta} pts</strong></div>
                </div>
              </div>

              {/* GPS Coordinates & Google Maps Link */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</span>
                </div>
                <a
                  href={selectedIncident.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-sm w-full rounded-2xl p-6 border border-slate-800 space-y-4 text-center"
            >
              <Trash2 className="w-10 h-10 mx-auto text-red-500 mb-2" />
              <h3 className="text-white font-bold text-base">Delete Incident Record?</h3>
              <p className="text-slate-400 text-xs">This action will permanently delete incident record #{deleteId}.</p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
