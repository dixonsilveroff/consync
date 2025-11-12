import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function TaskEditModal({ isOpen, onClose, task, onUpdate }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchOrganizationMembers = async () => {
    try {
      const res = await api.get(`/api/organizations/${user.organization}/members`);
      setUsers(res.data?.members || []);
    } catch (err) {
      console.error('Failed to fetch organization members:', err);
    }
  };

  // Load task data when modal opens
  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo?._id || task.assignedTo || ''
      });
      setError('');
      setDeleteConfirm(false);
      
      // Fetch organization members if we have an organization
      if (user?.organization) {
        fetchOrganizationMembers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, isOpen, user?.organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        assignedTo: formData.assignedTo || undefined
      };

      await api.put(`/api/tasks/${task._id}`, updateData);
      
      onUpdate(); // Refresh the task list
      onClose(); // Close the modal
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update task. Please try again.';
      setError(errorMessage);
      console.error('Failed to update task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = async () => {
    setLoading(true);
    setError('');

    try {
      await api.put(`/api/tasks/${task._id}`, {
        status: 'done'
      });
      
      onUpdate(); // Refresh the task list
      onClose(); // Close the modal
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark task as done. Please try again.';
      setError(errorMessage);
      console.error('Failed to mark task as done:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await api.delete(`/api/tasks/${task._id}`);
      onUpdate(); // Refresh the task list
      onClose(); // Close the modal
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task. Please try again.';
      setError(errorMessage);
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to edit/delete tasks
  const canEditTasks = ['contractor', 'engineer'].includes(user?.role);
  const canDeleteTasks = ['contractor', 'engineer'].includes(user?.role);
  
  // Check if current user is assigned to this task
  const isAssignedToTask = task?.assignedTo?._id === user?._id || task?.assignedTo === user?._id;
  
  // Engineers assigned to the task can at least change status to done
  const canMarkAsDone = isAssignedToTask && user?.role === 'engineer';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900"
                  >
                    Edit Task
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Task Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!canEditTasks}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      disabled={!canEditTasks}
                    />
                  </div>

                  {/* Status and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!canEditTasks && !canMarkAsDone}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="done">Done</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!canEditTasks}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  {/* Due Date and Assigned To */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!canEditTasks}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign To
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!canEditTasks}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Project Info (Read-only) */}
                  {task?.project && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project
                      </label>
                      <input
                        type="text"
                        value={task.project.title || 'N/A'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        disabled
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  {/* Permission Warning */}
                  {!canEditTasks && !canMarkAsDone && (
                    <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                      You do not have permission to edit tasks. Only contractors and engineers can edit tasks.
                    </div>
                  )}

                  {/* Quick Action for Assigned Engineers */}
                  {canMarkAsDone && task.status !== 'done' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 mb-2">
                        This task is assigned to you. Quick action:
                      </p>
                      <button
                        type="button"
                        onClick={handleMarkAsDone}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                      >
                        ✓ Mark as Done
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {canDeleteTasks && !deleteConfirm && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(true)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                        >
                          Delete Task
                        </button>
                      )}
                      {deleteConfirm && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Are you sure?</span>
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                      >
                        Close
                      </button>
                      {canEditTasks && (
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 font-medium transition-colors"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
