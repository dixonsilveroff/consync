import { useState, useEffect } from 'react';
import api from '../api/apiClient';
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  FolderOpen,
  CheckSquare,
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
  const [globalSummary, setGlobalSummary] = useState(null);
  const [activityTrends, setActivityTrends] = useState([]);
  const [costTrends, setCostTrends] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectAnalytics, setProjectAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGlobalSummary();
    fetchActivityTrends();
    fetchCostTrends();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectAnalytics(selectedProject);
    }
  }, [selectedProject]);

  const fetchGlobalSummary = async () => {
    try {
      const res = await api.get('/api/analytics/summary/global');
      setGlobalSummary(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch global summary:', err);
      setError('Failed to load analytics data');
    }
  };

  const fetchActivityTrends = async () => {
    try {
      const res = await api.get('/api/analytics/trends/activity');
      setActivityTrends(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch activity trends:', err);
    }
  };

  const fetchCostTrends = async () => {
    try {
      const res = await api.get('/api/analytics/trends/cost');
      setCostTrends(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch cost trends:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      const projectsData = res.data?.data || res.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setLoading(false);
    }
  };

  const fetchProjectAnalytics = async (projectId) => {
    try {
      const res = await api.get(`/api/analytics/summary/project/${projectId}`);
      setProjectAnalytics(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch project analytics:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Insights and trends across all projects
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Global Summary Cards */}
      {globalSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Projects */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Projects</span>
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{globalSummary.totalProjects || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active and completed</p>
          </div>

          {/* Total Tasks */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Tasks</span>
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{globalSummary.totalTasks || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Across all projects</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Expenses</span>
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${(globalSummary.totalExpenses || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">All-time spending</p>
          </div>

          {/* Avg Progress */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg Progress</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {globalSummary.averageProgress?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Overall completion</p>
          </div>
        </div>
      )}

      {/* Activity Trends */}
      {activityTrends.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Activity Trends (Last 14 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-2 min-w-max">
              {activityTrends.map((day, index) => {
                const maxCount = Math.max(...activityTrends.map(d => d.count), 1);
                const heightPercent = (day.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center min-w-[60px]">
                    <div className="text-xs font-semibold text-gray-700 mb-1">{day.count}</div>
                    <div 
                      className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                      style={{ height: `${Math.max(heightPercent, 5)}px`, maxHeight: '200px' }}
                    />
                    <div className="text-xs text-gray-500 mt-2 rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cost Trends */}
      {costTrends.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Cost Trends</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-2 min-w-max">
              {costTrends.map((item, index) => {
                const maxAmount = Math.max(...costTrends.map(d => d.totalAmount), 1);
                const heightPercent = (item.totalAmount / maxAmount) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center min-w-[80px]">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      ${item.totalAmount.toLocaleString()}
                    </div>
                    <div 
                      className="w-full bg-green-600 rounded-t transition-all hover:bg-green-700"
                      style={{ height: `${Math.max(heightPercent, 5)}px`, maxHeight: '200px' }}
                    />
                    <div className="text-xs text-gray-500 mt-2 rotate-45 origin-top-left">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Project Analytics Selector */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project-Specific Analytics</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full sm:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a project...</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        {/* Project Analytics Display */}
        {projectAnalytics && selectedProject && (
          <div className="mt-6 space-y-6">
            {/* Task Statistics */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">Task Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projectAnalytics.taskStats?.total || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-700">
                    {projectAnalytics.taskStats?.completed || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {projectAnalytics.taskStats?.inProgress || 0}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {projectAnalytics.taskStats?.pending || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">Cost Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-700">
                    ${(projectAnalytics.costBreakdown?.totalExpenses || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Estimates</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${(projectAnalytics.costBreakdown?.totalEstimates || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Variance</p>
                  <p className={`text-2xl font-bold ${
                    (projectAnalytics.costBreakdown?.variance || 0) < 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    ${Math.abs(projectAnalytics.costBreakdown?.variance || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(projectAnalytics.costBreakdown?.variance || 0) < 0 ? 'Under' : 'Over'} estimate
                  </p>
                </div>
              </div>
            </div>

            {/* Cost by Category */}
            {projectAnalytics.costByCategory && projectAnalytics.costByCategory.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Cost by Category</h3>
                <div className="space-y-2">
                  {projectAnalytics.costByCategory.map((cat, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-32 capitalize">{cat._id || 'Other'}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                          style={{
                            width: `${(cat.total / Math.max(...projectAnalytics.costByCategory.map(c => c.total))) * 100}%`
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            ${cat.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {projectAnalytics.timeline && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Project Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Start Date</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {projectAnalytics.timeline.startDate
                        ? new Date(projectAnalytics.timeline.startDate).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <p className="text-sm text-gray-600">End Date</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {projectAnalytics.timeline.endDate
                        ? new Date(projectAnalytics.timeline.endDate).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
