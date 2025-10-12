// Mock data for ConSync CLMS dashboard
const currentDate = new Date();

// Helper to generate past dates
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Global summary statistics
export const mockGlobalSummary = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 4,
  totalTasks: 246,
  completedTasks: 187,
  pendingTasks: 59,
  avgProgress: 76.2,
  totalExpenses: 6435000,
  plannedBudget: 8500000,
  resourceUtilization: 82.5
};

// Active projects summary
export const mockActiveProjects = [
  {
    id: 'PRJ001',
    name: 'Silverline Tower Complex',
    progress: 85,
    budget: 2800000,
    expenses: 2340000,
    startDate: '2025-06-15',
    endDate: '2026-03-30',
    status: 'on-track'
  },
  {
    id: 'PRJ002',
    name: 'Green Valley Residences',
    progress: 62,
    budget: 1900000,
    expenses: 1250000,
    startDate: '2025-07-01',
    endDate: '2026-01-15',
    status: 'delayed'
  },
  {
    id: 'PRJ003',
    name: 'Central Business Hub',
    progress: 91,
    budget: 3200000,
    expenses: 2845000,
    startDate: '2025-04-10',
    endDate: '2025-12-20',
    status: 'on-track'
  }
];

// Recent tasks
export const mockRecentTasks = [
  {
    id: 'TSK001',
    projectId: 'PRJ001',
    title: 'Foundation Inspection',
    status: 'completed',
    assignee: 'John Cooper',
    dueDate: getPastDate(2),
    priority: 'high'
  },
  {
    id: 'TSK002',
    projectId: 'PRJ002',
    title: 'Electrical Wiring Phase 2',
    status: 'in-progress',
    assignee: 'Sarah Martinez',
    dueDate: getPastDate(0),
    priority: 'medium'
  },
  {
    id: 'TSK003',
    projectId: 'PRJ001',
    title: 'Steel Framework Review',
    status: 'pending',
    assignee: 'Mike Anderson',
    dueDate: getPastDate(-3),
    priority: 'high'
  }
];

// Activity trend (last 14 days)
export const mockActivityTrend = Array.from({ length: 14 }, (_, i) => ({
  date: getPastDate(13 - i),
  count: Math.floor(Math.random() * 15) + 5
}));

// Cost trend (last 14 days)
export const mockCostTrend = Array.from({ length: 14 }, (_, i) => ({
  date: getPastDate(13 - i),
  total: Math.floor(Math.random() * 100000) + 50000
}));

// Resource allocation
export const mockResourceAllocation = {
  labor: { allocated: 125, available: 150 },
  equipment: { allocated: 45, available: 50 },
  materials: { onSite: 85, ordered: 100 }
};

// Risk metrics
export const mockRiskMetrics = {
  safetyIncidents: 0,
  qualityIssues: 3,
  delayedMilestones: 2,
  budgetVariance: -4.2,
  weatherImpact: 'low'
};

// Team performance
export const mockTeamPerformance = {
  productivity: 92.5,
  attendanceRate: 96.8,
  taskCompletion: 88.4,
  qualityScore: 94.2
};

// Material inventory
export const mockMaterialInventory = [
  { name: 'Steel Bars', quantity: 2500, unit: 'pcs', status: 'adequate' },
  { name: 'Cement', quantity: 850, unit: 'bags', status: 'low' },
  { name: 'Gravel', quantity: 120, unit: 'tons', status: 'adequate' },
  { name: 'Sand', quantity: 95, unit: 'tons', status: 'critical' }
];

// Weekly weather forecast
export const mockWeatherForecast = [
  { date: getPastDate(-1), condition: 'clear', impact: 'none' },
  { date: getPastDate(-2), condition: 'rain', impact: 'moderate' },
  { date: getPastDate(-3), condition: 'rain', impact: 'severe' },
  { date: getPastDate(-4), condition: 'clear', impact: 'none' },
  { date: getPastDate(-5), condition: 'cloudy', impact: 'low' }
];