import apiClient from './api';

export const sosService = {
  /**
   * Trigger manual SOS emergency alert.
   * @param {Object} payload - { latitude, longitude, emergency_type }
   * @returns {Promise<Object>} SOSEventResponse object containing event details & notification status
   */
  async triggerSOS(payload) {
    const response = await apiClient.post('/sos/trigger', payload);
    return response.data;
  },
};

export default sosService;
