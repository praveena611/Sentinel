import apiClient from './api';

export const authService = {
  /**
   * Register a new user account.
   * @param {Object} userData - { full_name, email, password }
   * @returns {Promise<Object>} Token response object containing access_token & user
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Authenticate user credentials.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} Token response object containing access_token & user
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current authenticated user profile.
   * @returns {Promise<Object>} User response object
   */
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
