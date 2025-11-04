/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { setAccessToken } from '../api/apiClient';
import { isTokenExpiringSoon } from '../utils/authHelpers';

export default function AddProjectModal({ close, refresh, project = null }) {
  const { user, fetchProfile } = useAuth();
  
  // Ensure budget has correct structure
  const initializeBudget = () => {
    if (project?.budget) {
      return {
        amount: project.budget.amount || 0,
        currency: project.budget.currency || 'USD'
      };
    }
    return { amount: 0, currency: 'USD' };
  };

  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    budget: initializeBudget(),
    status: project?.status || 'proposed'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Refresh user profile first to ensure we have latest permissions
      await fetchProfile();

      // Validate user role after fetching fresh profile - contractor is the admin role
      if (!user?.role || !['contractor', 'engineer'].includes(user.role)) {
        setError('Insufficient permissions. Only contractors and engineers can manage projects.');
        setLoading(false);
        return;
      }

      // Try to refresh token before making the request
      if (isTokenExpiringSoon()) {
        try {
          const { data } = await api.post('/api/auth/refresh');
          if (data.accessToken || data.token) {
            setAccessToken(data.accessToken || data.token);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Continue with the request anyway, the interceptor will handle if needed
        }
      }

      // Proceed with the project save
      const payload = {
        ...formData,
        budget: {
          amount: Number(formData.budget.amount) || 0,
          currency: formData.budget.currency || 'USD'
        }
      };

      if (project) {
        await api.put(`/api/projects/${project._id}`, payload);
      } else {
        await api.post('/api/projects', payload);
      }
      refresh();
      close();
    } catch (err) {
      console.error('Failed to save project:', err);
      let errorMessage = 'Failed to save project. Please try again.';
      
      if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action. Please contact your administrator.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {project ? 'Edit Project' : 'New Project'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (₦)
            </label>
            <input
              type="number"
              value={formData.budget.amount}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                budget: { 
                  ...prev.budget,
                  amount: Number(e.target.value) || 0
                }
              }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="proposed">Proposed</option>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}