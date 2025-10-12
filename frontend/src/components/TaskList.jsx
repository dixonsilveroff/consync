import { useState, useEffect } from 'react';
import api from '../api/apiClient';

export default function TaskList({ projectId, onUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/api/tasks/project/${projectId}`);
      setTasks(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, onUpdate]);

  const toggleTaskStatus = async (taskId, completed) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, { 
        status: completed ? 'completed' : 'pending' 
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
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
      {tasks.map(task => (
        <div
          key={task._id}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
        >
          <button
            onClick={() => toggleTaskStatus(task._id, task.status !== 'completed')}
            className="text-gray-400 hover:text-blue-600"
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              {task.title}
            </h4>
            {task.assignedTo && (
              <p className="text-sm text-gray-500 truncate">
                Assigned to: {task.assignedTo}
              </p>
            )}
          </div>
          
          {task.deadline && (
            <span className="text-sm text-gray-500">
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}