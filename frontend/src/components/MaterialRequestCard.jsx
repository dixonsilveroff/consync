import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const MaterialRequestCard = ({ request, onUpdate, vendors = [] }) => {
  const { user } = useAuth();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const canApprove = isAdmin && request.status === 'pending';
  const canAssignVendor = isAdmin && request.status === 'approved';
  const canMarkDelivered = (isAdmin || user?.role === 'engineer') && request.status === 'assigned';

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      assigned: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await apiClient.patch(`/api/resources/requests/${request._id}/approve`);
      onUpdate?.();
      setShowApprovalModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch(`/api/resources/requests/${request._id}/reject`, {
        reason: rejectReason
      });
      onUpdate?.();
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVendor = async () => {
    if (!selectedVendor || !deliveryDate) {
      alert('Please select a vendor and delivery date');
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch(`/api/resources/requests/${request._id}/assign`, {
        vendorId: selectedVendor,
        deliveryDate
      });
      onUpdate?.();
      setShowAssignModal(false);
      setSelectedVendor('');
      setDeliveryDate('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!window.confirm('Mark this material request as delivered?')) return;

    setLoading(true);
    try {
      await apiClient.patch(`/api/resources/requests/${request._id}/deliver`);
      onUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    return request.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {request.project?.title || 'Unknown Project'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Requested by {request.requestedBy?.name || 'Unknown'} on{' '}
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status.toUpperCase()}
          </span>
        </div>

        {/* Items List */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Materials:</h4>
          <ul className="space-y-2">
            {request.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">
                    {item.quantity} {item.unit}
                  </span>
                  {item.estimatedCost > 0 && (
                    <span className="text-green-600 font-medium">
                      ₦{item.estimatedCost.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {calculateTotalCost() > 0 && (
            <div className="mt-2 flex justify-end">
              <span className="text-sm font-semibold text-gray-700">
                Total Estimated: ₦{calculateTotalCost().toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Vendor Info */}
        {request.vendor && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm">
              <span className="font-medium">Vendor:</span> {request.vendor.name}
            </p>
            {request.deliveryDate && (
              <p className="text-sm mt-1">
                <span className="font-medium">Expected Delivery:</span>{' '}
                {new Date(request.deliveryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        {request.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {request.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {canApprove && (
            <>
              <button
                onClick={() => setShowApprovalModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                disabled={loading}
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                disabled={loading}
              >
                Reject
              </button>
            </>
          )}

          {canAssignVendor && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              disabled={loading}
            >
              Assign Vendor
            </button>
          )}

          {canMarkDelivered && (
            <button
              onClick={handleMarkDelivered}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              disabled={loading}
            >
              Mark Delivered
            </button>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Approve Material Request</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve this material request for{' '}
              <span className="font-semibold">{request.project?.title}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Material Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Vendor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Vendor</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vendor <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name} {vendor.rating > 0 && `(★ ${vendor.rating})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedVendor('');
                  setDeliveryDate('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignVendor}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialRequestCard;
