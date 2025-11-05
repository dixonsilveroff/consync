import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, UserPlus, X, Copy, CheckCircle2 } from 'lucide-react';
import api from '../api/apiClient';

export default function InviteTeam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    role: 'engineer',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const roleDescriptions = {
    engineer: 'Manages tasks, updates progress, and tracks project execution',
    client: 'Views project progress and provides approvals',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/api/invitations/send', formData);
      
      // Add to sent invitations list
      setSentInvitations(prev => [response.data.invitation, ...prev]);
      
      // Reset form
      setFormData({
        email: '',
        role: 'engineer',
        message: '',
      });
      setErrors({});
      
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Failed to send invitation'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = (link, index) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            Invite Team Members
          </h1>
          <p className="mt-2 text-gray-600">
            Invite engineers and clients to collaborate on your projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invitation Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Invitation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="colleague@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="engineer">Engineer</option>
                  <option value="client">Client</option>
                </select>
                <p className="mt-1 text-sm text-gray-600">
                  {roleDescriptions[formData.role]}
                </p>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a personal note to your invitation..."
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invitation
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sent Invitations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Invitations</h2>
            
            {sentInvitations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No invitations sent yet</p>
                <p className="text-sm mt-1">Invitations will appear here after sending</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentInvitations.map((invitation, index) => (
                  <div key={invitation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <p className="text-sm text-gray-600 capitalize">{invitation.role}</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pending
                      </span>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200 flex items-center gap-2">
                      <input
                        type="text"
                        value={invitation.inviteLink}
                        readOnly
                        className="flex-1 bg-transparent text-xs text-gray-600 outline-none"
                      />
                      <button
                        onClick={() => copyInviteLink(invitation.inviteLink, index)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title="Copy invite link"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Invitations are valid for 7 days</li>
            <li>• Invitees will receive an email with a registration link</li>
            <li>• They can create their account and join your organization</li>
            <li>• You can copy the invite link to share directly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
