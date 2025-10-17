import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import api from '../api/apiClient';

export default function TaskList({ projectId, onUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setError('');
      const res = await api.get(`/api/tasks?project=${projectId}&limit=100`);
      // Backend returns { success: true, data: { tasks: [...], total, page, pages } }
      const tasksData = res.data?.data?.tasks || res.data?.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTaskStatus = async (taskId, currentStatus) => {
    setUpdatingTaskId(taskId);
    setError('');
    
    // Optimistic update - update UI immediately
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const response = await api.put(`/api/tasks/${taskId}`, { 
        status: newStatus
      });
      
      console.log('Task update response:', response.data);
      
      // Notify parent to update (e.g., refresh project progress)
      if (onUpdate) onUpdate();
      
      // Refresh to get the latest data from server
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      console.error('Error response:', error.response?.data);
      
      // Only show error if the task update actually failed
      // Sometimes errors occur in logging but task updates successfully
      if (error.response?.status !== 200 && error.response?.data?.success !== true) {
        setError(error.response?.data?.message || 'Failed to update task status');
        
        // Revert optimistic update on actual error
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId ? { ...task, status: currentStatus } : task
          )
        );
      } else {
        // Task updated successfully despite error in logging
        console.log('Task updated successfully, ignoring non-critical error');
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-3">
      {[1, 2, 3].map(n => (
        <div key={n} className="h-12 bg-gray-100 rounded-lg"></div>
      ))}
    </div>;
  }

  if (tasks.length === 0) {
    return <p className="text-gray-500 text-center py-4">No tasks yet.</p>;
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {tasks.map(task => {
        const isUpdating = updatingTaskId === task._id;
        
        return (
          <div
            key={task._id}
            className={`flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow ${isUpdating ? 'opacity-50' : ''}`}
          >
            <button
              onClick={() => toggleTaskStatus(task._id, task.status)}
              disabled={isUpdating}
              className="text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed"
            >
              {task.status === 'done' || task.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${task.status === 'done' || task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {task.title}
                {isUpdating && <span className="ml-2 text-xs text-blue-600">Updating...</span>}
              </h4>
              {task.assignedTo && (
                <p className="text-sm text-gray-500 truncate">
                  Assigned to: {task.assignedTo.name || task.assignedTo}
                </p>
              )}
            </div>
            
            {task.dueDate && (
              <span className="text-sm text-gray-500">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}