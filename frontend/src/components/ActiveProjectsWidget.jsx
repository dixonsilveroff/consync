import { useNavigate } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function ActiveProjectsWidget({ projects = [] }) {
  const navigate = useNavigate();

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FolderKanban className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <div>No active projects</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.slice(0, 5).map((project) => (
        <div
          key={project._id}
          onClick={() => navigate(`/projects/${project._id}`)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {project.title}
            </h4>
            <div className="mt-2 w-full">
              <ProgressBar value={project.progressPercent || 0} size="sm" />
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {project.progressPercent || 0}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
