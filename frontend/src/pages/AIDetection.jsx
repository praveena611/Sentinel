import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, MessageSquare, Mic, Image as ImageIcon, Send, Sparkles, 
  CheckCircle2, AlertTriangle, Shield, MapPin, ExternalLink, Loader2, AlertCircle 
} from 'lucide-react';
import aiService from '../services/aiService';

export default function AIDetection() {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'voice', 'image'
  const [inputText, setInputText] = useState('');
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });

  const [predicting, setPredicting] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [error, setError] = useState('');

  // Sample prompt chips for user testing
  const samplePrompts = [
    { label: "I'm being followed by a stranger.", category: "Crime" },
    { label: "Help, my house is on fire and smoke is everywhere!", category: "Fire" },
    { label: "Severe car collision on the highway, need help!", category: "Accident" },
    { label: "Someone fainted and is having chest pain.", category: "Medical" },
    { label: "Flash flood water is rising rapidly!", category: "Disaster" },
  ];

  // Geolocation acquisition
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err)
      );
    }
  }, []);

  const handlePredictOnly = async () => {
    if (!inputText.trim()) {
      setError('Please type or select an emergency prompt first.');
      return;
    }

    setPredicting(true);
    setError('');
    setPrediction(null);

    try {
      const res = await aiService.predictText({ text: inputText });
      setPrediction(res);
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to classify emergency text.');
    } finally {
      setPredicting(false);
    }
  };

  const handleAnalyzeAndDispatch = async () => {
    if (!inputText.trim()) {
      setError('Please type or select an emergency prompt first.');
      return;
    }

    setDispatching(true);
    setError('');
    setDispatchResult(null);

    try {
      const res = await aiService.analyzeAndDispatchText({
        text: inputText,
        latitude: location.lat,
        longitude: location.lng,
      });
      setDispatchResult(res);
      setPrediction(res.prediction);
    } catch (err) {
      console.error('Dispatch error:', err);
      const msg = err.response?.data?.detail || 'Failed to dispatch AI text emergency.';
      setError(msg);
    } finally {
      setDispatching(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Medical':
        return { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: '🚑' };
      case 'Crime':
        return { color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: '🚓' };
      case 'Fire':
        return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: '🚒' };
      case 'Accident':
        return { color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: '🚗' };
      case 'Disaster':
        return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: '🌪' };
      default:
        return { color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: '🚨' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            DistilBERT NLP Engine Active
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            AI Emergency Detection
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Classify emergency text, voice, and image modalities into Medical, Crime, Fire, Accident, and Disaster categories.
          </p>
        </div>
      </div>

      {/* Modality Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'text'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'glass-card text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Text Detection (DistilBERT)</span>
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'voice'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'glass-card text-slate-400 hover:text-white opacity-60'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voice Detection (Whisper)</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Sprint 7</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'image'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'glass-card text-slate-400 hover:text-white opacity-60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Detection (YOLOv8)</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Sprint 8</span>
        </button>
      </div>

      {/* Main Detection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form & Sample Prompts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Describe Emergency Situation
              </label>
              <span className="text-xs text-slate-500 font-mono">NLP Text Classifier</span>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your emergency message... e.g. I am being followed, send help!"
              className="w-full p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all resize-none"
            />

            {/* Sample Prompts */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Click Sample Emergency Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(chip.label)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-all hover:border-slate-700"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePredictOnly}
                disabled={predicting || dispatching}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2 border border-slate-700 disabled:opacity-50"
              >
                {predicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
                <span>Classify Intent Only</span>
              </button>

              <button
                type="button"
                onClick={handleAnalyzeAndDispatch}
                disabled={predicting || dispatching}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {dispatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Analyze & Dispatch Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Result Panel */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {prediction ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Classification Result</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">
                  {prediction.model}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400">Predicted Category</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl">{getCategoryBadge(prediction.prediction).icon}</span>
                  <span className={`px-3 py-1 rounded-xl text-lg font-extrabold border ${getCategoryBadge(prediction.prediction).color}`}>
                    {prediction.prediction} Emergency
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Confidence Score</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.confidence * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                  />
                </div>
              </div>

              {dispatchResult && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Real-Time Push Notification Dispatched</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Event ID #{dispatchResult.event.id} published to ntfy.sh trusted channels.
                  </p>
                  <a
                    href={dispatchResult.event.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>View Location on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center text-slate-500">
              <Cpu className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h4 className="text-white font-bold text-sm mb-1">AI Inference Ready</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Type an emergency message or select a sample prompt to evaluate intent classification and trigger automatic alerts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
