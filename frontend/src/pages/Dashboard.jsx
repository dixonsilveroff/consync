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
import OnboardingModal from "../components/OnboardingModal";
import { RefreshCw, ListChecks, BarChart3, DollarSign, FolderKanban } from 'lucide-react';
import { USE_MOCK, simulateDelay, simulateError } from "../config/mock";
import { 
  mockGlobalSummary,
  mockActivityTrend,
  mockCostTrend,
  mockActiveProjects,
  mockRecentTasks
} from "../data/mockData";

export default function Dashboard() {
  const { user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
        // Determine what data to fetch based on role
        const isContractor = user?.role === 'contractor';
        const isClient = user?.role === 'client';
        const isEngineer = user?.role === 'engineer';

        // Build project query based on role
        let projectQuery = 'status=active&limit=5';
        if (isClient) {
          // Clients see only their projects
          projectQuery = `status=active&limit=5&client=${user._id}`;
        } else if (isEngineer) {
          // Engineers see projects they're assigned to
          projectQuery = `status=active&limit=5&assignedUser=${user._id}`;
        }
        // Contractors see all projects (no additional filter)

        // Fetch data - contractors get global analytics, others get filtered
        const requests = [
          isContractor 
            ? api.get("/api/analytics/summary/global")
            : api.get("/api/projects?" + projectQuery).then(res => {
                // Calculate summary from filtered projects
                const projects = res.data.data || [];
                const totalProgress = projects.reduce((sum, p) => sum + (Number(p.progressPercent) || 0), 0);
                return {
                  data: {
                    data: {
                      totalProjects: projects.length,
                      totalTasks: projects.reduce((sum, p) => sum + (Number(p.taskCount) || 0), 0),
                      totalExpenses: projects.reduce((sum, p) => sum + (Number(p.totalExpenses) || 0), 0),
                      avgProgress: projects.length > 0 ? totalProgress / projects.length : 0
                    }
                  }
                };
              }),
          api.get("/api/analytics/trends/activity"),
          api.get("/api/activities?limit=10"),
          api.get("/api/projects?" + projectQuery)
        ];

        const [summaryRes, activityTrendsRes, activitiesRes, projectsRes] = await Promise.all(requests);

        setDashboardData({
          summary: summaryRes.data.data,
          activityTrends: activityTrendsRes.data.data,
          costTrends: [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Check if user needs onboarding
  useEffect(() => {
    if (user && user.role === 'contractor' && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refresh user data to get updated onboardingCompleted status
    try {
      await fetchProfile();
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
    // Optionally show success message
    console.log('Onboarding completed!');
  };

  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    // User can still complete onboarding later from settings
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
            {user?.role === 'contractor' && 'ConSync Project Dashboard'}
            {user?.role === 'engineer' && 'My Engineering Dashboard'}
            {user?.role === 'client' && 'My Projects Dashboard'}
            {user?.role === 'supplier' && 'Supplier Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {user?.role === 'contractor' && 'Monitor progress, cost, and activity across all projects.'}
            {user?.role === 'engineer' && 'Track your assigned projects and tasks.'}
            {user?.role === 'client' && 'View and monitor your project progress.'}
            {user?.role === 'supplier' && 'Manage material requests and deliveries.'}
          </p>
          {user && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Welcome back, <span className="font-medium">{user.name}</span>
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
            title: user?.role === 'contractor' ? "Total Projects" : "My Projects",
            value: Number(dashboardData.summary?.totalProjects) || 0,
            icon: FolderKanban,
            color: "blue"
          },
          {
            title: user?.role === 'contractor' ? "Total Tasks" : "My Tasks",
            value: Number(dashboardData.summary?.totalTasks) || 0,
            icon: ListChecks,
            color: "green"
          },
          {
            title: "Avg. Progress",
            value: `${(Number(dashboardData.summary?.avgProgress) || 0).toFixed(1)}%`,
            icon: BarChart3,
            color: "purple",
            isProgress: true,
            progressValue: Number(dashboardData.summary?.avgProgress) || 0
          },
          ...(user?.role !== 'client' ? [{
            title: user?.role === 'contractor' ? "Total Expenses" : "Project Expenses",
            value: `₦${(Number(dashboardData.summary?.totalExpenses) || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "red",
            isExpense: true
          }] : [])
        ].map((card, index) => (
          <div key={card.title} 
               className="transition-all duration-300 ease-in-out"
               style={{ animationDelay: `${index * 100}ms` }}>
            <DashboardCard {...card} />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {user?.role !== 'client' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 transition-all duration-300 ease-in-out hover:shadow-md">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              {user?.role === 'contractor' ? 'System Activity Volume' : 'My Activity Trends'}
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
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <div>Select a project to view cost trends</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section: Active Projects & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Active Projects */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            {user?.role === 'contractor' ? 'Active Projects' : 'My Active Projects'}
          </h3>
          <ActiveProjectsWidget projects={dashboardData.activeProjects} />
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            {user?.role === 'contractor' ? 'Recent System Activities' : 'Recent Activities'}
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

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          user={user}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        © 2025 ConSync CLMS
      </div>
    </div>
  );
}
