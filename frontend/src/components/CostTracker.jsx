import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../api/apiClient';

export default function CostTracker({ projectId }) {
  const [costs, setCosts] = useState([]);
  const [newCost, setNewCost] = useState({
    description: '',
    amount: '',
    type: 'estimate' // or 'expense'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchCosts();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/finance', {
        ...newCost,
        projectId,
        amount: parseFloat(newCost.amount)
      });
      
      setNewCost({
        description: '',
        amount: '',
        type: 'estimate'
      });
      
      fetchCosts();
    } catch (error) {
      console.error('Failed to add cost:', error);
    }
  };

  const calculateTotals = () => {
    return costs.reduce((acc, cost) => ({
      estimates: acc.estimates + (cost.type === 'estimate' ? cost.amount : 0),
      expenses: acc.expenses + (cost.type === 'expense' ? cost.amount : 0)
    }), { estimates: 0, expenses: 0 });
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-20 bg-gray-100 rounded-lg"></div>
      <div className="h-40 bg-gray-100 rounded-lg"></div>
    </div>;
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-500">Estimated Cost</h4>
          <p className="text-2xl font-semibold text-gray-800">{formatCurrency(totals.estimates)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-500">Actual Expenses</h4>
          <p className="text-2xl font-semibold text-gray-800">{formatCurrency(totals.expenses)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-500">Difference</h4>
          <p className={`text-2xl font-semibold ${
            totals.estimates >= totals.expenses ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totals.estimates - totals.expenses)}
          </p>
        </div>
      </div>

      {/* Add New Cost Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newCost.description}
              onChange={(e) => setNewCost(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₦)
            </label>
            <input
              type="number"
              value={newCost.amount}
              onChange={(e) => setNewCost(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={newCost.type}
              onChange={(e) => setNewCost(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="estimate">Estimate</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Cost Line
        </button>
      </form>

      {/* Costs Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {costs.map((cost) => (
              <tr key={cost._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {cost.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {formatCurrency(cost.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    cost.type === 'estimate'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {cost.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(cost.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}