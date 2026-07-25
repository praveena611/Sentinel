import apiClient from './api';

export const contactService = {
  /**
   * Fetch all emergency contacts for current user.
   * @param {string} search - Optional search query
   * @returns {Promise<Array>} List of contact objects
   */
  async getContacts(search = '') {
    const params = search ? { search } : {};
    const response = await apiClient.get('/contacts/', { params });
    return response.data;
  },

  /**
   * Create a new emergency contact.
   * @param {Object} contactData - { contact_name, phone_number, relationship }
   * @returns {Promise<Object>} Created contact object
   */
  async createContact(contactData) {
    const response = await apiClient.post('/contacts/', contactData);
    return response.data;
  },

  /**
   * Update an existing emergency contact.
   * @param {number} id - Contact ID
   * @param {Object} contactData - { contact_name, phone_number, relationship }
   * @returns {Promise<Object>} Updated contact object
   */
  async updateContact(id, contactData) {
    const response = await apiClient.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  /**
   * Delete an emergency contact by ID.
   * @param {number} id - Contact ID
   * @returns {Promise<void>}
   */
  async deleteContact(id) {
    await apiClient.delete(`/contacts/${id}`);
  },
};

export default contactService;
