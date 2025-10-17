import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../api/apiClient';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function CostTracker({ projectId }) {
  const [costs, setCosts] = useState([]);
  const [newCost, setNewCost] = useState({
    description: '',
    amount: '',
    category: 'materials',
    type: 'estimate',
    note: ''
  });
  const [editingCost, setEditingCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const res = await api.get(`/api/finance/project/${projectId}`);
        setCosts(res.data.data || []);
        setError('');
      } catch (error) {
        console.error('Failed to fetch costs:', error);
        setError(error.response?.data?.message || 'Failed to fetch costs');
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, [projectId]);

  const refetchCosts = async () => {
    try {
      const res = await api.get(`/api/finance/project/${projectId}`);
      setCosts(res.data.data || []);
      setError('');
    } catch (error) {
      console.error('Failed to fetch costs:', error);
      setError(error.response?.data?.message || 'Failed to fetch costs');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      const costData = {
        project: projectId,
        description: newCost.description,
        amount: parseFloat(newCost.amount),
        category: newCost.category,
        type: newCost.type,
        note: newCost.note
      };

      await api.post('/api/finance', costData);
      
      setNewCost({
        description: '',
        amount: '',
        category: 'materials',
        type: 'estimate',
        note: ''
      });
      
      await refetchCosts();
    } catch (error) {
      console.error('Failed to add cost:', error);
      setError(error.response?.data?.message || 'Failed to add cost');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      await api.put(`/api/finance/${editingCost._id}`, {
        description: editingCost.description,
        amount: parseFloat(editingCost.amount),
        category: editingCost.category,
        type: editingCost.type,
        note: editingCost.note
      });
      
      setEditingCost(null);
      await refetchCosts();
    } catch (error) {
      console.error('Failed to update cost:', error);
      setError(error.response?.data?.message || 'Failed to update cost');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (costId) => {
    setSubmitting(true);
    try {
      await api.delete(`/api/finance/${costId}`);
      setDeleteConfirm(null);
      await refetchCosts();
    } catch (error) {
      console.error('Failed to delete cost:', error);
      setError(error.response?.data?.message || 'Failed to delete cost');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotals = () => {
    return costs.reduce((acc, cost) => ({
      estimates: acc.estimates + (cost.type === 'estimate' ? cost.amount : 0),
      expenses: acc.expenses + (cost.type === 'expense' ? cost.amount : 0),
      adjustments: acc.adjustments + (cost.type === 'adjustment' ? cost.amount : 0)
    }), { estimates: 0, expenses: 0, adjustments: 0 });
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-20 bg-gray-100 rounded-lg"></div>
      <div className="h-40 bg-gray-100 rounded-lg"></div>
    </div>;
  }

  const totals = calculateTotals();
  const totalNet = totals.estimates - (totals.expenses + totals.adjustments);

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-500">Estimated Cost</h4>
          <p className="text-2xl font-semibold text-blue-600">{formatCurrency(totals.estimates)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-500">Actual Expenses</h4>
          <p className="text-2xl font-semibold text-orange-600">{formatCurrency(totals.expenses)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-500">Adjustments</h4>
          <p className="text-2xl font-semibold text-purple-600">{formatCurrency(totals.adjustments)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-500">Net Balance</h4>
          <p className={`text-2xl font-semibold ${
            totalNet >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(Math.abs(totalNet))}
            <span className="text-sm ml-1">
              {totalNet >= 0 ? '(Under)' : '(Over)'}
            </span>
          </p>
        </div>
      </div>

      {/* Add New Cost Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Cost Line</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={newCost.description}
              onChange={(e) => setNewCost(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Cement purchase"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₦) *
            </label>
            <input
              type="number"
              value={newCost.amount}
              onChange={(e) => setNewCost(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={newCost.type}
              onChange={(e) => setNewCost(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="estimate">Estimate</option>
              <option value="expense">Expense</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newCost.category}
              onChange={(e) => setNewCost(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="materials">Materials</option>
              <option value="labor">Labor</option>
              <option value="equipment">Equipment</option>
              <option value="subcontractor">Subcontractor</option>
              <option value="permits">Permits</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={newCost.note}
              onChange={(e) => setNewCost(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding...' : 'Add Cost Line'}
        </button>
      </form>

      {/* Costs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {costs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No cost lines added yet. Add your first cost entry above.
                  </td>
                </tr>
              ) : (
                costs.map((cost) => (
                  <tr key={cost._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div>
                        <div className="font-medium">{cost.description}</div>
                        {cost.note && (
                          <div className="text-xs text-gray-500 mt-1">{cost.note}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {cost.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {formatCurrency(cost.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cost.type === 'estimate'
                          ? 'bg-blue-100 text-blue-700'
                          : cost.type === 'expense'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {cost.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cost.date || cost.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingCost(cost)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cost._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Cost Line</h3>
              <button
                onClick={() => setEditingCost(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={editingCost.description}
                    onChange={(e) => setEditingCost(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₦) *
                  </label>
                  <input
                    type="number"
                    value={editingCost.amount}
                    onChange={(e) => setEditingCost(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={editingCost.type}
                    onChange={(e) => setEditingCost(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="estimate">Estimate</option>
                    <option value="expense">Expense</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingCost.category || 'materials'}
                    onChange={(e) => setEditingCost(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="materials">Materials</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="permits">Permits</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <input
                    type="text"
                    value={editingCost.note || ''}
                    onChange={(e) => setEditingCost(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCost(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Cost Line</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this cost line? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}