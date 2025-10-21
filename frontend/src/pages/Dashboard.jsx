import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";
import DashboardCard from "../components/DashboardCard";
import TrendChart from "../components/TrendChart";
import ActivityList from "../components/ActivityList";
import DashboardSkeleton from "../components/DashboardSkeleton";
import MockModeBanner from "../components/MockModeBanner";
import ProjectSelector from "../components/ProjectSelector";
import ActiveProjectsWidget from "../components/ActiveProjectsWidget";
import QuickActions from "../components/QuickActions";
import AddProjectModal from "../components/AddProjectModal";
import { RefreshCw } from 'lucide-react';
import { USE_MOCK, simulateDelay, simulateError } from "../config/mock";
import { 
  mockGlobalSummary,
  mockActivityTrend,
  mockCostTrend,
  mockActiveProjects,
  mockRecentTasks
} from "../data/mockData";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    activityTrends: [],
    costTrends: [],
    recentActivities: [],
    activeProjects: []
  });

  // Fetch all dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (USE_MOCK) {
        await simulateDelay();
        simulateError();

        setDashboardData({
          summary: mockGlobalSummary,
          activityTrends: mockActivityTrend,
          costTrends: mockCostTrend,
          recentActivities: mockRecentTasks,
          activeProjects: mockActiveProjects
        });
      } else {
        // Fetch all data in parallel
        const [summaryRes, activityTrendsRes, activitiesRes, projectsRes] = await Promise.all([
          api.get("/api/analytics/summary/global"),
          api.get("/api/analytics/trends/activity"),
          api.get("/api/activities?limit=10"),
          api.get("/api/projects?status=active&limit=5")
        ]);

        setDashboardData({
          summary: summaryRes.data.data,
          activityTrends: activityTrendsRes.data.data,
          costTrends: [], // Will be populated when a project is selected
          recentActivities: activitiesRes.data.data,
          activeProjects: projectsRes.data.data || []
        });
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Export the handleProjectSelect function to be used by the project selector component
  const handleProjectSelect = async (projectId) => {
    setSelectedProjectId(projectId);
    
    if (!projectId) {
      // Clear cost trends when "All Projects" is selected
      setDashboardData(prev => ({
        ...prev,
        costTrends: []
      }));
      return;
    }
    
    try {
      const costTrendsRes = await api.get(`/api/analytics/trends/cost?project=${projectId}`);
      setDashboardData(prev => ({
        ...prev,
        costTrends: costTrendsRes.data.data
      }));
    } catch (err) {
      console.error("Failed to fetch cost trends:", err);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
    if (selectedProjectId) {
      handleProjectSelect(selectedProjectId);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Mock Mode Banner */}
      {USE_MOCK && <MockModeBanner />}

      {/* Header */}
      <div className="mb-4 sm:mb-6 transition-opacity duration-300 ease-in-out">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
            ConSync Project Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Monitor progress, cost, and activity across all projects.
          </p>
          {user && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Welcome back, <span className="font-medium">{user.name}</span> ({user.role})
            </p>
          )}
        </div>
      </div>

      {/* Refresh Section - Below Header */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs sm:text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <QuickActions onNewProject={() => setShowAddProjectModal(true)} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          {
            title: "Total Projects",
            value: dashboardData.summary?.totalProjects || 0,
            icon: "🏗️",
            color: "blue"
          },
          {
            title: "Total Tasks",
            value: dashboardData.summary?.totalTasks || 0,
            icon: "📋",
            color: "green"
          },
          {
            title: "Avg. Progress",
            value: `${dashboardData.summary?.avgProgress || 0}%`,
            icon: "📊",
            color: "purple",
            isProgress: true,
            progressValue: parseFloat(dashboardData.summary?.avgProgress || 0)
          },
          {
            title: "Total Expenses",
            value: `₦${(dashboardData.summary?.totalExpenses || 0).toLocaleString()}`,
            icon: "💰",
            color: "red",
            isExpense: true
          }
        ].map((card, index) => (
          <div key={card.title} 
               className="transition-all duration-300 ease-in-out"
               style={{ animationDelay: `${index * 100}ms` }}>
            <DashboardCard {...card} />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 transition-all duration-300 ease-in-out hover:shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            Recent Activity Volume
          </h3>
          <div className="transition-opacity duration-500 ease-in-out">
            <TrendChart
              data={dashboardData.activityTrends}
              type="line"
              xKey="_id"
              yKey="count"
              color="#2563EB"
              height={300}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 transition-all duration-300 ease-in-out hover:shadow-md">
          <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row items-start sm:items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex-shrink-0">
              Project Cost Trends
            </h3>
            <div className="w-full sm:w-auto sm:min-w-[200px] sm:max-w-[300px]">
              <ProjectSelector 
                onProjectSelect={handleProjectSelect}
                selectedProjectId={selectedProjectId}
              />
            </div>
          </div>
          <div className="transition-opacity duration-500 ease-in-out">
            {dashboardData.costTrends.length > 0 ? (
              <TrendChart
                data={dashboardData.costTrends}
                type="area"
                xKey="_id"
                yKey="total"
                color="#16A34A"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Select a project to view cost trends</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Projects & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Active Projects */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            Active Projects
          </h3>
          <ActiveProjectsWidget projects={dashboardData.activeProjects} />
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            Recent System Activities
          </h3>
          <ActivityList activities={dashboardData.recentActivities} />
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <AddProjectModal
          close={() => setShowAddProjectModal(false)}
          refresh={() => {
            fetchDashboardData(true);
            setShowAddProjectModal(false);
          }}
        />
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        © 2025 ConSync CLMS
      </div>
    </div>
  );
}
