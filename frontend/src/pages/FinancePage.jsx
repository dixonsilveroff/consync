import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../api/apiClient';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function FinancePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [costLines, setCostLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCost, setEditingCost] = useState(null);

  const [formData, setFormData] = useState({
    project: '',
    type: 'expense',
    category: 'materials',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const canEditFinance = ['contractor', 'engineer'].includes(user?.role);
  const canDeleteFinance = user?.role === 'contractor';

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      const projectsData = res.data?.data || res.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      
      // Set initial project selection
      if (projectIdFromUrl && projectsData.find(p => p._id === projectIdFromUrl)) {
        setSelectedProject(projectIdFromUrl);
      } else if (projectsData.length > 0) {
        setSelectedProject(projectsData[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects');
    }
  };

  const fetchCostLines = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedProject === 'all' 
        ? '/api/finance' 
        : `/api/finance/project/${selectedProject}`;
      
      const res = await api.get(url);
      setCostLines(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch cost lines:', err);
      setError(err.response?.data?.message || 'Failed to load cost data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectSummary = async () => {
    try {
      const res = await api.get(`/api/finance/summary/${selectedProject}`);
      // Summary data is available but not displayed separately
      console.log('Project summary:', res.data?.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchCostLines();
      if (selectedProject !== 'all') {
        fetchProjectSummary();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingCost) {
        await api.put(`/api/finance/${editingCost._id}`, dataToSend);
      } else {
        await api.post('/api/finance', dataToSend);
      }

      // Reset form
      setFormData({
        project: selectedProject === 'all' ? '' : selectedProject,
        type: 'expense',
        category: 'materials',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      setShowAddModal(false);
      setEditingCost(null);
      
      // Refresh data
      fetchCostLines();
      if (selectedProject !== 'all') {
        fetchProjectSummary();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save cost line');
    }
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    setFormData({
      project: cost.project?._id || cost.project,
      type: cost.type,
      category: cost.category || 'materials',
      amount: cost.amount.toString(),
      description: cost.description || '',
      date: cost.date ? new Date(cost.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      note: cost.note || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (costId) => {
    if (!confirm('Are you sure you want to delete this cost line?')) return;

    try {
      await api.delete(`/api/finance/${costId}`);
      fetchCostLines();
      if (selectedProject !== 'all') {
        fetchProjectSummary();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete cost line');
    }
  };

  const openAddModal = () => {
    setEditingCost(null);
    setFormData({
      project: selectedProject === 'all' ? '' : selectedProject,
      type: 'expense',
      category: 'materials',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setShowAddModal(true);
  };

  // Calculate totals
  const totals = costLines.reduce((acc, cost) => {
    if (cost.type === 'expense') acc.expenses += cost.amount;
    else if (cost.type === 'estimate') acc.estimates += cost.amount;
    return acc;
  }, { expenses: 0, estimates: 0 });

  const currentProject = projects.find(p => p._id === selectedProject);
  const budgetAmount = currentProject?.budget?.amount || 0;
  const budgetUsed = budgetAmount ? (totals.expenses / budgetAmount) * 100 : 0;
  const isOverBudget = budgetAmount && totals.expenses > budgetAmount;

  return (
    <div className="p-3 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Finance & Budget</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track costs and manage project budgets</p>
        </div>
        {canEditFinance && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Add Cost Line</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full sm:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {selectedProject !== 'all' && currentProject && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Budget */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Budget</span>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentProject.budget?.currency || 'NGN'} {budgetAmount.toLocaleString()}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Expenses</span>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentProject.budget?.currency || 'NGN'} {totals.expenses.toLocaleString()}
            </p>
            {budgetAmount > 0 && (
              <p className={`text-sm mt-1 ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                {budgetUsed.toFixed(1)}% of budget
              </p>
            )}
          </div>

          {/* Estimates */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Estimates</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentProject.budget?.currency || 'NGN'} {totals.estimates.toLocaleString()}
            </p>
          </div>

          {/* Remaining */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Remaining</span>
              {isOverBudget ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {currentProject.budget?.currency || 'NGN'} {Math.abs(budgetAmount - totals.expenses).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isOverBudget ? 'Over budget' : 'Under budget'}
            </p>
          </div>
        </div>
      )}

      {/* Budget Progress Bar (for single project) */}
      {selectedProject !== 'all' && currentProject && budgetAmount > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Budget Usage</span>
            <span className="text-sm font-medium text-gray-700">{budgetUsed.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                isOverBudget ? 'bg-red-600' : budgetUsed > 80 ? 'bg-yellow-600' : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Cost Lines Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : costLines.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No cost lines found. Add your first entry to start tracking.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  {canEditFinance && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costLines.map((cost) => (
                  <tr key={cost._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(cost.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cost.project?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        cost.type === 'expense' ? 'bg-red-100 text-red-700' :
                        cost.type === 'estimate' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {cost.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {cost.category || 'General'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {cost.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {cost.project?.budget?.currency || 'NGN'} {cost.amount.toLocaleString()}
                    </td>
                    {canEditFinance && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleEdit(cost)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {canDeleteFinance && (
                          <button
                            onClick={() => handleDelete(cost._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCost ? 'Edit Cost Line' : 'Add Cost Line'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a project...</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="expense">Expense</option>
                      <option value="estimate">Estimate</option>
                      <option value="adjustment">Adjustment</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="materials">Materials</option>
                      <option value="labor">Labor</option>
                      <option value="equipment">Equipment</option>
                      <option value="permits">Permits</option>
                      <option value="professional_fees">Professional Fees</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the cost..."
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCost(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingCost ? 'Update' : 'Add'} Cost Line
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
