import apiClient from './api';

export const historyService = {
  /**
   * Fetch paginated list of emergency incidents.
   * @param {Object} params - { severity, modality, search, page, limit }
   * @returns {Promise<Object>} IncidentPaginatedResponse
   */
  async getIncidents(params = {}) {
    const response = await apiClient.get('/history/incidents', { params });
    return response.data;
  },

  /**
   * Fetch detailed incident record by ID.
   * @param {number} incidentId
   * @returns {Promise<Object>} IncidentDetailResponse
   */
  async getIncidentById(incidentId) {
    const response = await apiClient.get(`/history/incidents/${incidentId}`);
    return response.data;
  },

  /**
   * Delete an incident record by ID.
   * @param {number} incidentId
   * @returns {Promise<Object>}
   */
  async deleteIncident(incidentId) {
    const response = await apiClient.delete(`/history/incidents/${incidentId}`);
    return response.data;
  },
};

export default historyService;
