import { useState, useEffect } from 'react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import TaskEditModal from '../components/TaskEditModal';
import TaskCreateModal from '../components/TaskCreateModal';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    project: 'all',
    status: 'all',
    priority: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/projects')
      ]);
      
      // Backend returns { success: true, data: { tasks: [...], total, page, pages } }
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || tasksRes.data?.data || [];
      const projectsData = projectsRes.data?.data || projectsRes.data || [];
      
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error.response?.data?.message || 'Failed to load tasks. Please try again.');
      // Set empty arrays on error
      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search tasks (with safety check)
  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filters.project === 'all' || task.project?._id === filters.project;
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    
    return matchesSearch && matchesProject && matchesStatus && matchesPriority;
  }) : [];

  // Calculate stats
  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'done' || t.status === 'completed').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress' || t.status === 'review').length,
    overdue: filteredTasks.filter(t => {
      if (t.status === 'done' || t.status === 'completed') return false;
      return t.dueDate && new Date(t.dueDate) < new Date();
    }).length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'review':
        return 'bg-purple-100 text-purple-700';
      case 'todo':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      default: 
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-700 font-bold';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'review': 'In Review',
      'done': 'Done',
      'blocked': 'Blocked',
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = () => {
    fetchData(); // Refresh the task list
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleTaskCreated = () => {
    fetchData(); // Refresh the task list
  };

  // Check if user has permission to create tasks
  const canCreateTasks = ['contractor', 'engineer'].includes(user?.role);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 md:p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-sm">{error}</span>
          <button
            onClick={fetchData}
            className="text-sm underline hover:no-underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">All Tasks</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">View and manage all tasks across your projects</p>
        </div>
        {canCreateTasks && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mt-1">{stats.overdue}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={filters.project}
              onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No tasks found matching your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ project: 'all', status: 'all', priority: 'all' });
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const isOverdue = task.dueDate && 
                                   new Date(task.dueDate) < new Date() && 
                                   task.status !== 'completed';
                  
                  return (
                    <tr
                      key={task._id}
                      onClick={() => handleTaskClick(task)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {task.project?.title || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {formatStatus(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium capitalize ${getPriorityColor(task.priority)}`}>
                          {task.priority || 'medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.dueDate ? (
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          ) : (
                            <span className="text-gray-400">No due date</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {task.assignedTo?.name || 'Unassigned'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
      />

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
