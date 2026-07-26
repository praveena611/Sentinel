import apiClient from './api';

export const intelligenceService = {
  /**
   * Analyze multimodal evidence and execute intelligence emergency pipeline.
   * @param {FormData} formData - Contains text, audio_file, image_file, is_manual_sos, latitude, longitude, speed_kmh
   * @returns {Promise<Object>} MultimodalAnalysisResponse
   */
  async analyzeEmergency(formData) {
    const response = await apiClient.post('/intelligence/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default intelligenceService;
