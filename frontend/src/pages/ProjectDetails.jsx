import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';
import ProgressBar from '../components/ProgressBar';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  
  const canManageTasks = ['admin', 'engineer', 'contractor'].includes(user?.role);

    const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/api/projects/${id}`);
      console.log('Project details:', res.data.data); // Debug log
      setProject(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [id, refreshTrigger, fetchProject]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
          <div className="mt-4">
            <div className="h-3 bg-gray-200 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="p-6 space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#1E4E8C] rounded-lg hover:bg-[#183d70] transition-colors duration-300"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Link>

      <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <h2 className="text-2xl font-semibold">{project.title}</h2>
        <p className="text-gray-600 mt-1">{project.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Project Progress</p>
            <ProgressBar value={project.progressPercent || 0} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Budget</p>
            <p className="text-lg font-semibold">
              {formatCurrency(project.budget?.amount || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Tasks</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {project.progressPercent || 0}% Complete
            </span>
            {canManageTasks && (
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                {showAddTask ? 'Cancel' : 'Add Task'}
              </button>
            )}
          </div>
        </div>
        
        {showAddTask && (
          <div className="mb-4">
            <AddTaskForm 
              projectId={id} 
              onAdd={() => {
                setShowAddTask(false);
                setRefreshTrigger(prev => !prev);
              }} 
            />
          </div>
        )}

        <TaskList 
          projectId={id} 
          onUpdate={() => setRefreshTrigger(prev => !prev)} 
        />
      </div>
    </div>
  );
}