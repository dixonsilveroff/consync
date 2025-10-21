import { FileText, FolderKanban, ListTodo, User, DollarSign, Package } from 'lucide-react';

export default function ActivityList({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <div>No recent activities</div>
      </div>
    );
  }

  // Get icon based on entity type
  const getEntityIcon = (entityType) => {
    switch (entityType?.toLowerCase()) {
      case 'project':
        return FolderKanban;
      case 'task':
        return ListTodo;
      case 'user':
        return User;
      case 'finance':
        return DollarSign;
      case 'resource':
        return Package;
      default:
        return FileText;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 168) { // 7 days
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return 'Unknown';
    }
  };

  // Get activity color based on action
  const getActivityColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'created':
        return 'text-green-600 bg-green-50';
      case 'update':
      case 'updated':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
      case 'deleted':
        return 'text-red-600 bg-red-50';
      case 'complete':
      case 'completed':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = getEntityIcon(activity.entityType);
        return (
          <div 
            key={activity._id || index}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {/* Action badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.action)}`}>
                {activity.action}
              </span>
              
              {/* User name */}
              {activity.user?.name && (
                <span className="text-sm font-medium text-gray-700">
                  {activity.user.name}
                </span>
              )}
            </div>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-1">
              {activity.message || `${activity.action} ${activity.entityType?.toLowerCase() || 'item'}`}
            </p>

            {/* Project reference */}
            {activity.project?.title && (
              <p className="text-xs text-gray-500">
                Project: {activity.project.title}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex-shrink-0">
            <span className="text-xs text-gray-500">
              {formatTimestamp(activity.createdAt)}
            </span>
          </div>
        </div>
        );
      })}
    </div>
  );
}
