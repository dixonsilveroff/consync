import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../api/apiClient';

export default function ProjectCard({ project, refresh }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    try {
      await api.delete(`/api/projects/${project._id}`);
      refresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3
          onClick={() => navigate(`/projects/${project._id}`)}
          className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer"
        >
          {project.title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Budget</span>
          <p className="font-medium text-gray-800">{formatCurrency(project.budget)}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
          {project.status?.replace('_', ' ')}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm mx-4">
            <h4 className="text-lg font-semibold mb-2">Delete Project</h4>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <AddProjectModal
          project={project}
          close={() => setShowEditModal(false)}
          refresh={refresh}
        />
      )}
    </div>
  );
}