import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { setAccessToken } from '../api/apiClient';
import { isTokenExpiringSoon } from '../utils/authHelpers';

export default function AddProjectModal({ close, refresh, project = null }) {
  const { user, fetchProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    budget: project?.budget || '',
    status: project?.status || 'planning'
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

      // Validate user role after fetching fresh profile
      if (!user?.role || user.role !== 'admin') {
        setError('Insufficient permissions. Only administrators can manage projects.');
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
      if (project) {
        await api.patch(`/api/projects/${project._id}`, formData);
      } else {
        await api.post('/api/projects', formData);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
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
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="1000"
              required
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
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
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