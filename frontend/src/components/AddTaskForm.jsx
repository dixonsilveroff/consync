import { useState } from 'react';
import axios from 'axios';

export default function AddTaskForm({ projectId }) {
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/tasks', {
        ...formData,
        projectId
      }, { withCredentials: true });
      
      // Reset form
      setFormData({
        title: '',
        assignedTo: '',
        deadline: ''
      });
      
      // Refresh task list (you can implement this via a prop or context)
    } catch (error) {
      console.error('Failed to create task:', error);
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
          Assigned To
        </label>
        <input
          type="text"
          value={formData.assignedTo}
          onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Email or username"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding Task...' : 'Add Task'}
      </button>
    </form>
  );
}