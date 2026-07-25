import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Phone, User, Heart, Edit2, Trash2, 
  X, AlertCircle, Loader2, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import contactService from '../services/contactService';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    contact_name: '',
    phone_number: '',
    relationship: 'Family',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deletingContact, setDeletingContact] = useState(null);

  const fetchContacts = async (searchQuery = '') => {
    try {
      setLoading(true);
      const data = await contactService.getContacts(searchQuery);
      setContacts(data);
      setError('');
    } catch (err) {
      console.error('Fetch contacts error:', err);
      setError('Failed to load emergency contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(search);
  }, [search]);

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        contact_name: contact.contact_name,
        phone_number: contact.phone_number,
        relationship: contact.relationship,
      });
    } else {
      setEditingContact(null);
      setFormData({
        contact_name: '',
        phone_number: '',
        relationship: 'Family',
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contact_name || !formData.phone_number || !formData.relationship) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingContact) {
        await contactService.updateContact(editingContact.id, formData);
        setSuccess('Contact updated successfully!');
      } else {
        await contactService.createContact(formData);
        setSuccess('Emergency contact added successfully!');
      }
      handleCloseModal();
      fetchContacts(search);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Save contact error:', err);
      const message = err.response?.data?.detail || 'Failed to save emergency contact.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContact) return;
    setSubmitting(true);
    try {
      await contactService.deleteContact(deletingContact.id);
      setSuccess(`Removed ${deletingContact.contact_name} from trusted contacts.`);
      setDeletingContact(null);
      fetchContacts(search);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Delete contact error:', err);
      setError('Failed to delete contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRelationshipBadgeColor = (rel) => {
    const lower = rel.toLowerCase();
    if (lower.includes('parent') || lower.includes('father') || lower.includes('mother')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (lower.includes('spouse') || lower.includes('partner') || lower.includes('husband') || lower.includes('wife')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (lower.includes('sibling') || lower.includes('brother') || lower.includes('sister')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-2xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            Trusted Contact Network
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Emergency Contacts
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Manage trusted people who will be immediately notified with your live GPS location during emergencies.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Success Alert Banner */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Controls Bar: Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or relationship..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all"
          />
        </div>

        <div className="text-slate-400 text-xs font-mono">
          Total Contacts: <span className="text-white font-bold">{contacts.length}</span>
        </div>
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="min-h-[240px] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
          <p className="text-sm">Fetching trusted contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Emergency Contacts Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            {search ? `No contacts match your query "${search}".` : "You haven't added any trusted contacts yet. Add your emergency contacts to ensure they get alerted instantly during crisis."}
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-lg">
                        {contact.contact_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-base leading-snug">{contact.contact_name}</h4>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${getRelationshipBadgeColor(contact.relationship)}`}>
                          {contact.relationship}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(contact)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingContact(contact)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3 text-slate-300 text-sm">
                    <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-mono">{contact.phone_number}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Trusted Recipient</span>
                  <a
                    href={`tel:${contact.phone_number}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Direct Call</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-red-500" />
                  {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    required
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone Number (With Country Code)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="e.g. +1 555-019-2834"
                    required
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Relationship
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingContact ? 'Save Changes' : 'Add Contact'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-2xl border border-slate-800 p-6 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-4">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Remove Contact?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to remove <span className="text-white font-semibold">{deletingContact.contact_name}</span> from your trusted emergency contact list?
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingContact(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Remove Contact</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
