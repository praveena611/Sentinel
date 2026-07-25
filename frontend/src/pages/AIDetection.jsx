import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, MessageSquare, Mic, Image as ImageIcon, Send, Sparkles, 
  CheckCircle2, AlertTriangle, Shield, MapPin, ExternalLink, Loader2, 
  AlertCircle, Square, Play, Upload, Volume2 
} from 'lucide-react';
import aiService from '../services/aiService';

export default function AIDetection() {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'voice', 'image'
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });

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

  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

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

  // Recording Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // --- VOICE RECORDING HANDLERS ---
  const startRecording = async () => {
    setError('');
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription(null);
    setVoiceDispatchResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Auto release microphone stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Microphone access denied or unavailable. You can upload an audio file instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setTranscription(null);
      setVoiceDispatchResult(null);
      setError('');
    }
  };

  const handleTranscribeVoiceOnly = async () => {
    if (!audioBlob) {
      setError('Please record or upload an audio file first.');
      return;
    }

    setTranscribing(true);
    setError('');
    setTranscription(null);

    const formData = new FormData();
    formData.append('audio_file', audioBlob, audioBlob.name || 'recording.webm');

    try {
      const res = await aiService.transcribeVoice(formData);
      setTranscription(res);
    } catch (err) {
      console.error('Transcribe error:', err);
      setError('Failed to transcribe audio file using Whisper.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleAnalyzeAndDispatchVoice = async () => {
    if (!audioBlob) {
      setError('Please record or upload an audio file first.');
      return;
    }

    setDispatchingVoice(true);
    setError('');
    setVoiceDispatchResult(null);

    const formData = new FormData();
    formData.append('audio_file', audioBlob, audioBlob.name || 'recording.webm');
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);

    try {
      const res = await aiService.analyzeAndDispatchVoice(formData);
      setVoiceDispatchResult(res);
      setTranscription(res.transcription);
    } catch (err) {
      console.error('Voice dispatch error:', err);
      const msg = err.response?.data?.detail || 'Failed to dispatch voice emergency alert.';
      setError(msg);
    } finally {
      setDispatchingVoice(false);
    }
  };

  // --- TEXT HANDLERS ---
  const handlePredictTextOnly = async () => {
    if (!inputText.trim()) {
      setError('Please type or select an emergency prompt first.');
      return;
    }

    setPredictingText(true);
    setError('');
    setTextPrediction(null);

    try {
      const res = await aiService.predictText({ text: inputText });
      setTextPrediction(res);
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to classify emergency text.');
    } finally {
      setPredictingText(false);
    }
  };

  const handleAnalyzeAndDispatchText = async () => {
    if (!inputText.trim()) {
      setError('Please type or select an emergency prompt first.');
      return;
    }

    setDispatchingText(true);
    setError('');
    setTextDispatchResult(null);

    try {
      const res = await aiService.analyzeAndDispatchText({
        text: inputText,
        latitude: location.lat,
        longitude: location.lng,
      });
      setTextDispatchResult(res);
      setTextPrediction(res.prediction);
    } catch (err) {
      console.error('Dispatch error:', err);
      const msg = err.response?.data?.detail || 'Failed to dispatch AI text emergency.';
      setError(msg);
    } finally {
      setDispatchingText(false);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Multimodal AI Intelligence Engine Active
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            AI Emergency Detection
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Intelligently classify text, voice speech, and computer vision inputs into emergency categories with real-time dispatch.
          </p>
        </div>
      </div>

      {/* Modality Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
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
              : 'glass-card text-slate-400 hover:text-white opacity-60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Detection (YOLOv8)</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Sprint 8</span>
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: TEXT DETECTION */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Describe Emergency Situation
                </label>
                <span className="text-xs text-slate-500 font-mono">DistilBERT Classifier</span>
              </div>

              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your emergency message... e.g. I am being followed, send help!"
                className="w-full p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all resize-none"
              />

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

              <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handlePredictTextOnly}
                  disabled={predictingText || dispatchingText}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2 border border-slate-700 disabled:opacity-50"
                >
                  {predictingText ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
                  <span>Classify Intent Only</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeAndDispatchText}
                  disabled={predictingText || dispatchingText}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {dispatchingText ? (
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

          <div className="space-y-6">
            {textPrediction ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Text Result</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">{textPrediction.model}</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400">Predicted Category</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl">{getCategoryBadge(textPrediction.prediction).icon}</span>
                    <span className={`px-3 py-1 rounded-xl text-lg font-extrabold border ${getCategoryBadge(textPrediction.prediction).color}`}>
                      {textPrediction.prediction} Emergency
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Confidence Score</span>
                    <span className="text-emerald-400 font-bold font-mono">{(textPrediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${textPrediction.confidence * 100}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" />
                  </div>
                </div>

                {textDispatchResult && (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Push Alert Dispatched via ntfy.sh</span>
                    </div>
                    <p className="text-slate-300 text-xs">Event ID #{textDispatchResult.event.id} logged in database.</p>
                    <a href={textDispatchResult.event.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                      <span>Google Maps Location</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center text-slate-500">
                <Cpu className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <h4 className="text-white font-bold text-sm mb-1">AI Inference Ready</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Type an emergency text message to evaluate classification.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VOICE DETECTION (OPENAI WHISPER) */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Audio Recording & File Upload Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Voice Audio Recorder</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">OpenAI Whisper Engine</span>
              </div>

              {/* Recorder UI Box */}
              <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-red-500/20 border-2 border-red-500 animate-ping pointer-events-none" />
                  )}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-600/50 scale-110'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    }`}
                  >
                    {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-9 h-9" />}
                  </button>
                </div>

                <div>
                  <h4 className="text-white font-bold text-base">
                    {isRecording ? 'Recording Voice Audio...' : 'Click Microphone to Start Recording'}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    {isRecording ? `Timer: ${formatTime(recordingTime)}` : 'Speak your emergency situation aloud'}
                  </p>
                </div>

                {audioUrl && (
                  <div className="pt-3 w-full max-w-md">
                    <audio src={audioUrl} controls className="w-full rounded-xl bg-slate-950" />
                  </div>
                )}
              </div>

              {/* File Upload Alternative */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Or Upload Audio File (.webm, .wav, .mp3, .m4a)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleTranscribeVoiceOnly}
                  disabled={!audioBlob || transcribing || dispatchingVoice}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2 border border-slate-700 disabled:opacity-50"
                >
                  {transcribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>Transcribe Audio Only</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeAndDispatchVoice}
                  disabled={!audioBlob || transcribing || dispatchingVoice}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {dispatchingVoice ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transcribing & Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Analyze & Dispatch Voice Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Transcription & Pipeline Result */}
          <div className="space-y-6">
            {transcription ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Whisper Transcription</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                    {transcription.model}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-sm font-mono leading-relaxed italic">
                  "{transcription.text}"
                </div>

                {voiceDispatchResult && (
                  <>
                    <div>
                      <span className="text-xs text-slate-400">Predicted Emergency Category</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-2xl">{getCategoryBadge(voiceDispatchResult.prediction.prediction).icon}</span>
                        <span className={`px-3 py-1 rounded-xl text-lg font-extrabold border ${getCategoryBadge(voiceDispatchResult.prediction.prediction).color}`}>
                          {voiceDispatchResult.prediction.prediction} Emergency
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">Confidence Score</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {(voiceDispatchResult.prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${voiceDispatchResult.prediction.confidence * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Voice Alert Dispatched via ntfy.sh</span>
                      </div>
                      <p className="text-slate-300 text-xs">
                        Event ID #{voiceDispatchResult.event.id} logged in database with modality "Voice".
                      </p>
                      <a href={voiceDispatchResult.event.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                        <span>Google Maps Location</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center text-slate-500">
                <Mic className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <h4 className="text-white font-bold text-sm mb-1">Whisper Voice Engine Ready</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Record your voice or upload an audio file to convert speech to text and trigger alerts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
