import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, ListTodo, BarChart3, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function QuickActions({ onNewProject }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const baseActions = [
    {
      label: 'New Project',
      icon: Plus,
      color: 'blue',
      onClick: onNewProject,
      roles: ['contractor'] // Only contractors can create projects
    },
    {
      label: 'Invite Team',
      icon: UserPlus,
      color: 'indigo',
      onClick: () => navigate('/invite-team'),
      roles: ['contractor'] // Only contractors can invite
    },
    {
      label: 'View Projects',
      icon: FolderOpen,
      color: 'green',
      onClick: () => navigate('/projects'),
      roles: null // Available to all
    },
    {
      label: 'View Tasks',
      icon: ListTodo,
      color: 'purple',
      onClick: () => navigate('/tasks'),
      roles: null // Available to all
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      color: 'orange',
      onClick: () => navigate('/analytics'),
      roles: null // Available to all
    }
  ];

  // Filter actions based on user role
  const actions = baseActions.filter(action => {
    if (!action.roles) return true; // Available to all
    return action.roles.includes(user?.role);
  });

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg transition-all duration-200 ${getColorClasses(action.color)} hover:scale-105 active:scale-95`}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm font-medium text-center">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
