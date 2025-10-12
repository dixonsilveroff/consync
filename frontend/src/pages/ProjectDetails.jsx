import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';
import CostTracker from '../components/CostTracker';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    axios.get(`/api/projects/${id}`, { withCredentials: true })
         .then(res => setProject(res.data.data))
         .catch(console.error);
  }, [id]);

  if (!project) return <div className="p-6"><div className="animate-pulse bg-gray-200 h-32 rounded-xl"></div></div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'finance', label: 'Finance' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">{project.title}</h2>
        <p className="text-gray-600 mt-2">{project.description}</p>
        <div className="mt-4 flex items-center gap-6">
          <div>
            <span className="text-sm text-gray-500">Budget</span>
            <p className="font-medium text-gray-800">{formatCurrency(project.budget)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p className={`inline-flex px-2 py-1 rounded-full text-sm ${
              project.status === 'completed' ? 'bg-green-100 text-green-700' :
              project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {project.status?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 -mb-px ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Add overview content */}
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <TaskList projectId={id} />
            <AddTaskForm projectId={id} />
          </div>
        )}
        
        {activeTab === 'finance' && (
          <div>
            <CostTracker projectId={id} />
          </div>
        )}
      </div>
    </div>
  );
}