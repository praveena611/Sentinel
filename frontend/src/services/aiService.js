import apiClient from './api';

export const aiService = {
  /**
   * Predict emergency category and confidence score from text.
   * @param {Object} payload - { text }
   * @returns {Promise<Object>} TextPredictionResponse
   */
  async predictText(payload) {
    const response = await apiClient.post('/ai/text/predict', payload);
    return response.data;
  },

  /**
   * Analyze text emergency and execute full emergency pipeline dispatch.
   * @param {Object} payload - { text, latitude, longitude }
   * @returns {Promise<Object>} TextDispatchResponse
   */
  async analyzeAndDispatchText(payload) {
    const response = await apiClient.post('/ai/text/analyze-and-dispatch', payload);
    return response.data;
  },

  /**
   * Transcribe voice audio to text using OpenAI Whisper.
   * @param {FormData} formData - Contains 'audio_file'
   * @returns {Promise<Object>} VoiceTranscribeResponse
   */
  async transcribeVoice(formData) {
    const response = await apiClient.post('/ai/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Transcribe voice audio, classify intent, and execute emergency pipeline dispatch.
   * @param {FormData} formData - Contains 'audio_file', 'latitude', 'longitude'
   * @returns {Promise<Object>} VoiceDispatchResponse
   */
  async analyzeAndDispatchVoice(formData) {
    const response = await apiClient.post('/ai/voice/analyze-and-dispatch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Detect emergency objects in image using YOLOv8.
   * @param {FormData} formData - Contains 'image_file'
   * @returns {Promise<Object>} ImagePredictionResponse
   */
  async predictImage(formData) {
    const response = await apiClient.post('/ai/image/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Detect emergency objects in image via YOLOv8 and execute emergency pipeline dispatch.
   * @param {FormData} formData - Contains 'image_file', 'latitude', 'longitude'
   * @returns {Promise<Object>} ImageDispatchResponse
   */
  async analyzeAndDispatchImage(formData) {
    const response = await apiClient.post('/ai/image/analyze-and-dispatch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default aiService;
