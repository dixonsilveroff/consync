import { useState } from 'react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function AddTaskForm({ projectId, onAdd }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user has permission to add tasks
  const canAddTasks = ['admin', 'engineer', 'contractor'].includes(user?.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddTasks) {
      setError('You do not have permission to add tasks.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const taskData = {
        ...formData,
        project: projectId,
        createdBy: user.id,
        status: 'todo' // Using the default status from the schema
      };
      
      await api.post('/api/tasks', taskData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: ''
      });
      
      // Notify parent component to refresh task list
      onAdd();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create task. Please try again.';
      setError(errorMessage);
      console.error('Failed to create task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg border">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Title
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
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deadline
        </label>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !canAddTasks}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
        title={!canAddTasks ? 'You do not have permission to add tasks' : undefined}
      >
        {loading ? 'Adding Task...' : 'Add Task'}
      </button>

      {!canAddTasks && (
        <p className="text-sm text-gray-500 text-center mt-2">
          Only administrators, engineers, and contractors can add tasks.
        </p>
      )}
    </form>
  );
}