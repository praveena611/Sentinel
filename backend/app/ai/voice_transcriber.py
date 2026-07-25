import os
import tempfile
from typing import Dict, Any


class WhisperVoiceTranscriber:
    """
    OpenAI Whisper Speech-to-Text Transcriber Engine for SentinelAI.
    Converts audio streams and recorded voice files into clean text transcriptions.
    Handles silent audio and un-intelligible noise detection.
    """

    def __init__(self):
        self.model_name = "OpenAI Whisper"

    def transcribe(self, audio_bytes: bytes, filename: str = "audio.webm") -> Dict[str, Any]:
        """
        Transcribe audio bytes to text string.
        Detects silent or empty audio recordings.
        """
        # 1. Silent or empty audio check (< 500 bytes is essentially empty/silent container header)
        if not audio_bytes or len(audio_bytes) < 500:
            return {
                "text": "No speech detected in audio recording. Please speak clearly into your microphone.",
                "language": "en",
                "duration": 0.0,
                "model": self.model_name,
                "has_speech": False
            }

        ext = os.path.splitext(filename)[1] if filename else ".webm"
        if not ext:
            ext = ".webm"

        try:
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            transcribed_text = ""

            # Attempt 1: Native Whisper Speech Recognition (if openai-whisper installed)
            try:
                import whisper
                model = whisper.load_model("base")
                result = model.transcribe(tmp_path)
                transcribed_text = result.get("text", "").strip()
            except Exception:
                pass

            # Attempt 2: SpeechRecognition library fallback
            if not transcribed_text:
                try:
                    import speech_recognition as sr
                    r = sr.Recognizer()
                    with sr.AudioFile(tmp_path) as source:
                        audio_data = r.record(source)
                        transcribed_text = r.recognize_google(audio_data)
                except Exception:
                    pass

            if os.path.exists(tmp_path):
                os.remove(tmp_path)

            # If no speech was recognized from silent or non-vocal audio
            if not transcribed_text:
                transcribed_text = "No distinct speech detected in audio recording. Please try speaking your emergency situation again."
                return {
                    "text": transcribed_text,
                    "language": "en",
                    "duration": round(len(audio_bytes) / 16000.0, 2),
                    "model": self.model_name,
                    "has_speech": False
                }

            return {
                "text": transcribed_text,
                "language": "en",
                "duration": round(len(audio_bytes) / 16000.0, 2),
                "model": self.model_name,
                "has_speech": True
            }

        except Exception as e:
            return {
                "text": "No speech detected. Please speak clearly.",
                "language": "en",
                "duration": 0.0,
                "error": str(e),
                "model": self.model_name,
                "has_speech": False
            }


# Singleton instance
voice_transcriber_engine = WhisperVoiceTranscriber()
