import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";
import DashboardCard from "../components/DashboardCard";
import TrendChart from "../components/TrendChart";
import ActivityList from "../components/ActivityList";
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
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    activityTrends: [],
    costTrends: [],
    recentActivities: []
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
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
          const [summaryRes, activityTrendsRes, activitiesRes] = await Promise.all([
            api.get("/api/analytics/summary/global"),
            api.get("/api/analytics/trends/activity"),
            api.get("/api/activities?limit=5")
          ]);

          setDashboardData({
            summary: summaryRes.data.data,
            activityTrends: activityTrendsRes.data.data,
            costTrends: [], // Will be populated when a project is selected
            recentActivities: activitiesRes.data.data
          });
        }
        
        setDashboardData(mockData);
        console.log("Using mock data for development");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle project selection for cost trends
  const handleProjectSelect = async (projectId) => {
    if (!projectId) return;
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          ConSync Project Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Monitor progress, cost, and activity across all projects.
        </p>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, <span className="font-medium">{user.name}</span> ({user.role})
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Total Projects"
          value={dashboardData.summary?.totalProjects || 0}
          icon="🏗️"
          color="blue"
        />
        <DashboardCard
          title="Total Tasks"
          value={dashboardData.summary?.totalTasks || 0}
          icon="📋"
          color="green"
        />
        <DashboardCard
          title="Avg. Progress"
          value={`${dashboardData.summary?.avgProgress || 0}%`}
          icon="📊"
          color="purple"
          isProgress={true}
          progressValue={parseFloat(dashboardData.summary?.avgProgress || 0)}
        />
        <DashboardCard
          title="Total Expenses"
          value={`₦${(dashboardData.summary?.totalExpenses || 0).toLocaleString()}`}
          icon="💰"
          color="red"
          isExpense={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity Volume
          </h3>
          <TrendChart
            data={dashboardData.activityTrends}
            type="line"
            xKey="_id"
            yKey="count"
            color="#2563EB"
            height={300}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Project Cost Flow
          </h3>
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

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent System Activities
        </h3>
        <ActivityList activities={dashboardData.recentActivities} />
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        © 2025 ConSync CLMS
      </div>
    </div>
  );
}
