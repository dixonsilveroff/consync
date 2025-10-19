import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, ListTodo, BarChart3 } from 'lucide-react';

export default function QuickActions({ onNewProject }) {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Project',
      icon: Plus,
      color: 'blue',
      onClick: onNewProject
    },
    {
      label: 'View Projects',
      icon: FolderOpen,
      color: 'green',
      onClick: () => navigate('/projects')
    },
    {
      label: 'View Tasks',
      icon: ListTodo,
      color: 'purple',
      onClick: () => navigate('/tasks')
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      color: 'orange',
      onClick: () => navigate('/analytics')
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 ${getColorClasses(action.color)}`}
          >
            <Icon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
