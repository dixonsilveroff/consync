import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/apiClient';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';
import ProgressBar from '../components/ProgressBar';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${id}`);
      setProject(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, refreshTrigger]);

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
      <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <h2 className="text-2xl font-semibold">{project.title}</h2>
        <p className="text-gray-600 mt-1">{project.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Project Progress</p>
            <ProgressBar value={project.progress || 0} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Budget</p>
            <p className="text-lg font-semibold">
              {formatCurrency(project.budget)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Tasks</h3>
          <span className="text-sm text-gray-500">
            {project.progress}% Complete
          </span>
        </div>
        
        <TaskList 
          projectId={id} 
          onUpdate={() => setRefreshTrigger(prev => !prev)} 
        />
        
        <AddTaskForm 
          projectId={id} 
          onAdd={() => setRefreshTrigger(prev => !prev)} 
        />
      </div>
    </div>
  );
}