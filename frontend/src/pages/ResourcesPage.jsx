import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import MaterialRequestForm from '../components/MaterialRequestForm';
import MaterialRequestCard from '../components/MaterialRequestCard';
import VendorList from '../components/VendorList';

const ResourcesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'vendors'
  const [materialRequests, setMaterialRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [projects, setProjects] = useState([]);

  const isContractor = user?.role === 'contractor';
  const canCreateRequest = isContractor || user?.role === 'engineer';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, vendorsRes, projectsRes] = await Promise.all([
        apiClient.get('/api/resources/requests'),
        apiClient.get('/api/resources/vendors'),
        apiClient.get('/api/projects')
      ]);

      setMaterialRequests(requestsRes.data.data || []);
      setVendors(vendorsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = materialRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesProject = projectFilter === 'all' || request.project?._id === projectFilter;
    return matchesStatus && matchesProject;
  });

  // Count requests by status
  const requestCounts = {
    all: materialRequests.length,
    pending: materialRequests.filter(r => r.status === 'pending').length,
    approved: materialRequests.filter(r => r.status === 'approved').length,
    assigned: materialRequests.filter(r => r.status === 'assigned').length,
    delivered: materialRequests.filter(r => r.status === 'delivered').length,
    rejected: materialRequests.filter(r => r.status === 'rejected').length
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600">Total Requests</p>
        <p className="text-2xl font-bold text-gray-800">{requestCounts.all}</p>
      </div>
      <div className="bg-yellow-50 rounded-lg shadow p-4">
        <p className="text-sm text-yellow-800">Pending</p>
        <p className="text-2xl font-bold text-yellow-600">{requestCounts.pending}</p>
      </div>
      <div className="bg-green-50 rounded-lg shadow p-4">
        <p className="text-sm text-green-800">Approved</p>
        <p className="text-2xl font-bold text-green-600">{requestCounts.approved}</p>
      </div>
      <div className="bg-blue-50 rounded-lg shadow p-4">
        <p className="text-sm text-blue-800">Assigned</p>
        <p className="text-2xl font-bold text-blue-600">{requestCounts.assigned}</p>
      </div>
      <div className="bg-purple-50 rounded-lg shadow p-4">
        <p className="text-sm text-purple-800">Delivered</p>
        <p className="text-2xl font-bold text-purple-600">{requestCounts.delivered}</p>
      </div>
    </div>
  );

  const renderMaterialRequests = () => (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Material Requests</h2>
        {canCreateRequest && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + New Request
          </button>
        )}
      </div>

      {/* Stats */}
      {renderStatsCards()}

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="assigned">Assigned</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Project
          </label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading material requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500">No material requests found</p>
          {canCreateRequest && statusFilter === 'all' && projectFilter === 'all' && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Request
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <MaterialRequestCard
              key={request._id}
              request={request}
              vendors={vendors}
              onUpdate={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderVendors = () => (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vendor Directory</h2>
        <p className="text-gray-600 mt-2">
          Manage your construction material suppliers and vendors
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-800">{vendors.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-800">Active Vendors</p>
          <p className="text-2xl font-bold text-green-600">
            {vendors.filter(v => v.active).length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-800">Avg Rating</p>
          <p className="text-2xl font-bold text-yellow-600">
            {vendors.length > 0
              ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)
              : '0.0'}
          </p>
        </div>
      </div>

      {/* Vendor List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      ) : (
        <VendorList vendors={vendors} onUpdate={fetchData} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="mt-2 text-gray-600">
            Manage material requests and vendor relationships
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Material Requests
              {requestCounts.pending > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {requestCounts.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'vendors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vendors
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                {vendors.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'requests' ? renderMaterialRequests() : renderVendors()}

        {/* Material Request Form Modal */}
        {showRequestForm && (
          <MaterialRequestForm
            onClose={() => setShowRequestForm(false)}
            onSuccess={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
