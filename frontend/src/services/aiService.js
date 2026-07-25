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
};

export default aiService;
