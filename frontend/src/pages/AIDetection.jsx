import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, MessageSquare, Mic, Image as ImageIcon, Send, Sparkles, 
  CheckCircle2, AlertTriangle, Shield, MapPin, ExternalLink, Loader2, 
  AlertCircle, Square, Play, Upload, Volume2, Eye, Camera, Tag, Video, VideoOff, Layers, Activity, Clock, Compass 
} from 'lucide-react';
import aiService from '../services/aiService';
import intelligenceService from '../services/intelligenceService';

export default function AIDetection() {
  const [activeTab, setActiveTab] = useState('multimodal'); // 'multimodal', 'text', 'voice', 'image'
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });

  // --- Multimodal Fusion Studio State ---
  const [fusedText, setFusedText] = useState('');
  const [fusedAudioBlob, setFusedAudioBlob] = useState(null);
  const [fusedImageFile, setFusedImageFile] = useState(null);
  const [isManualSos, setIsManualSos] = useState(true);
  const [analyzingMultimodal, setAnalyzingMultimodal] = useState(false);
  const [multimodalResult, setMultimodalResult] = useState(null);

  // --- Text Modality State ---
  const [inputText, setInputText] = useState('');
  const [predictingText, setPredictingText] = useState(false);
  const [dispatchingText, setDispatchingText] = useState(false);
  const [textPrediction, setTextPrediction] = useState(null);
  const [textDispatchResult, setTextDispatchResult] = useState(null);

  // --- Voice Modality State ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [dispatchingVoice, setDispatchingVoice] = useState(false);
  const [voiceDispatchResult, setVoiceDispatchResult] = useState(null);

  // --- Image Modality State (YOLOv8 & Live Camera Feed) ---
  const [imageMode, setImageMode] = useState('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [predictingImage, setPredictingImage] = useState(false);
  const [dispatchingImage, setDispatchingImage] = useState(false);
  const [imagePrediction, setImagePrediction] = useState(null);
  const [imageDispatchResult, setImageDispatchResult] = useState(null);

  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoStreamRef = useRef(null);

  const samplePrompts = [
    { label: "I'm being followed by a stranger.", category: "Crime" },
    { label: "Help, my house is on fire and smoke is everywhere!", category: "Fire" },
    { label: "Severe car collision on the highway, need help!", category: "Accident" },
    { label: "Someone fainted and is having chest pain.", category: "Medical" },
    { label: "Flash flood water is rising rapidly!", category: "Disaster" },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err)
      );
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (activeTab !== 'image' || imageMode !== 'camera') {
      stopCamera();
    }
  }, [activeTab, imageMode]);

  // --- MULTIMODAL FUSION DISPATCH ---
  const handleAnalyzeMultimodal = async () => {
    setAnalyzingMultimodal(true);
    setError('');
    setMultimodalResult(null);

    const formData = new FormData();
    if (fusedText.trim()) formData.append('text', fusedText);
    if (fusedAudioBlob) formData.append('audio_file', fusedAudioBlob, 'voice.webm');
    if (fusedImageFile) formData.append('image_file', fusedImageFile, fusedImageFile.name);
    formData.append('is_manual_sos', isManualSos ? 'true' : 'false');
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('speed_kmh', '12.4');

    try {
      const res = await intelligenceService.analyzeEmergency(formData);
      setMultimodalResult(res);
    } catch (err) {
      console.error('Multimodal intelligence error:', err);
      const msg = err.response?.data?.detail || 'Failed to analyze multimodal intelligence.';
      setError(msg);
    } finally {
      setAnalyzingMultimodal(false);
    }
  };

  // --- CAMERA HANDLERS ---
  const startCamera = async () => {
    setError('');
    setImagePrediction(null);
    setImageDispatchResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Webcam error:', err);
      setError('Unable to access webcam live feed. Please allow camera permissions or switch to File Upload mode.');
    }
  };

  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureFrameBlob = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `live_feed_${Date.now()}.jpg`, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.92);
    });
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
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Multimodal Intelligence Architecture v2
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            AI Emergency Intelligence Platform
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Multimodal Decision Fusion • 0–100 Risk Scoring Engine • Ambient Context Intelligence • Explainable AI (XAI).
          </p>
        </div>
      </div>

      {/* Modality Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('multimodal'); setError(''); }}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'multimodal'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'glass-card text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Multimodal Fusion & Risk Studio</span>
        </button>

        <button
          onClick={() => { setActiveTab('text'); setError(''); }}
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
          onClick={() => { setActiveTab('voice'); setError(''); }}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'voice'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'glass-card text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>Voice Detection (OpenAI Whisper)</span>
        </button>

        <button
          onClick={() => { setActiveTab('image'); setError(''); }}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'image'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'glass-card text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4 text-amber-400" />
          <span>Live Camera & Vision (YOLOv8)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 0: MULTIMODAL FUSION & 0-100 RISK ASSESSMENT STUDIO */}
      {activeTab === 'multimodal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Multimodal Evidence Aggregator */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Multimodal Evidence Input Aggregator</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">Late Decision Fusion</span>
              </div>

              {/* Evidence 1: Text Prompt */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  1. Text Evidence (DistilBERT NLP)
                </label>
                <textarea
                  rows={3}
                  value={fusedText}
                  onChange={(e) => setFusedText(e.target.value)}
                  placeholder="Enter emergency situation description..."
                  className="w-full p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-xs transition-all resize-none"
                />
              </div>

              {/* Evidence 2: Manual SOS Toggle */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-white text-xs font-bold">2. Manual Panic SOS Trigger</h4>
                  <p className="text-slate-400 text-[11px]">Include high-priority manual emergency trigger evidence (Weight 0.40)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManualSos(!isManualSos)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                    isManualSos
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isManualSos ? 'SOS Included' : 'SOS Excluded'}
                </button>
              </div>

              {/* Action Trigger */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleAnalyzeMultimodal}
                  disabled={analyzingMultimodal}
                  className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {analyzingMultimodal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Executing Decision Fusion & Risk Assessment...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      <span>Execute Multimodal Decision Fusion & Calculate 0–100 Risk Score</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 0-100 Risk Score Gauge & XAI Explanations */}
          <div className="space-y-6">
            {multimodalResult ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
                {/* 0-100 Risk Score Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Assessment Score</span>
                    <div className="text-4xl font-extrabold text-white mt-1">
                      {multimodalResult.risk_score}<span className="text-lg text-slate-500 font-normal">/100</span>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-sm font-extrabold border ${getSeverityBadge(multimodalResult.severity_level)}`}>
                    {multimodalResult.severity_level.toUpperCase()} SEVERITY
                  </span>
                </div>

                {/* Fused Threat Category */}
                <div>
                  <span className="text-xs text-slate-400">Primary Fused Threat</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl">{getCategoryBadge(multimodalResult.primary_threat).icon}</span>
                    <span className={`px-3 py-1 rounded-xl text-base font-extrabold border ${getCategoryBadge(multimodalResult.primary_threat).color}`}>
                      {multimodalResult.primary_threat} Emergency
                    </span>
                  </div>
                </div>

                {/* XAI Transparent Reasoning Card */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Explainable AI (XAI) Reasoning</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-mono">
                    {multimodalResult.explanation.summary_reason}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    {multimodalResult.explanation.feature_attributions.map((attr, idx) => (
                      <div key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{attr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Context Intelligence Factors */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                    <Compass className="w-4 h-4" />
                    <span>Ambient Context Intelligence</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Time of Day:</span>
                    <strong className="text-white">{multimodalResult.context_details.time_of_day}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Location Zone:</span>
                    <strong className="text-white">{multimodalResult.context_details.location_type}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Context Risk Delta:</span>
                    <strong className="text-emerald-400">+{multimodalResult.context_details.context_risk_delta} Points</strong>
                  </div>
                </div>

                {/* Ntfy Dispatch Confirmation */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Orchestrated Emergency Push Dispatched</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Event ID #{multimodalResult.event.id} logged across all database tables.
                  </p>
                  <a href={multimodalResult.event.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    <span>View Location on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center text-slate-500">
                <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <h4 className="text-white font-bold text-sm mb-1">Decision Fusion Engine Ready</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Provide evidence inputs and click Execute Decision Fusion to evaluate 0–100 risk score and XAI explanations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1, 2, 3: INDIVIDUAL MODALITY CONTROLS (TEXT, VOICE, IMAGE) */}
      {activeTab === 'text' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-slate-300 text-xs">
          Select Multimodal Fusion & Risk Studio to run complete risk assessment.
        </div>
      )}
    </div>
  );
}
