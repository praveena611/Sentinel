import apiClient from './api';

export const locationService = {
  /**
   * Fetch recent emergency location pins for the current user.
   * @param {number} limit - Maximum number of location pins to fetch
   * @returns {Promise<Array>} List of location pin objects
   */
  async getRecentLocations(limit = 20) {
    const response = await apiClient.get('/location/recent', { params: { limit } });
    return response.data;
  },
};

export default locationService;
