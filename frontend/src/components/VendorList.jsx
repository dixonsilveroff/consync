import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import VendorForm from './VendorForm';

const VendorList = ({ vendors, onUpdate }) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewType, setViewType] = useState('cards'); // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'

  const isContractor = user?.role === 'contractor';

  const handleDelete = async (vendorId, vendorName) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${vendorName}"?`)) return;

    try {
      await apiClient.delete(`/api/resources/vendors/${vendorId}`);
      onUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vendor');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === 'all' ? true :
                         filterActive === 'active' ? vendor.active :
                         !vendor.active;

    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVendors.map((vendor) => (
        <div
          key={vendor._id}
          className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
            !vendor.active ? 'opacity-60' : ''
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{vendor.name}</h3>
              {!vendor.active && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded mt-1">
                  Inactive
                </span>
              )}
            </div>
            {renderStars(vendor.rating)}
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4 text-sm">
            {vendor.contactPerson && (
              <p className="text-gray-600">
                <span className="font-medium">Contact:</span> {vendor.contactPerson}
              </p>
            )}
            {vendor.phone && (
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {vendor.phone}
              </p>
            )}
            {vendor.email && (
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {vendor.email}
              </p>
            )}
            {vendor.address && (
              <p className="text-gray-600 text-xs">
                <span className="font-medium">Address:</span> {vendor.address}
              </p>
            )}
          </div>

          {/* Materials */}
          {vendor.materials && vendor.materials.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Materials:</p>
              <div className="flex flex-wrap gap-1">
                {vendor.materials.map((material, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {isContractor && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditingVendor(vendor)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(vendor._id, vendor.name)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Materials
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {isContractor && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredVendors.map((vendor) => (
            <tr key={vendor._id} className={!vendor.active ? 'opacity-60' : ''}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{vendor.contactPerson || 'N/A'}</div>
                <div className="text-xs text-gray-500">{vendor.phone || ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {renderStars(vendor.rating)}
                  <span className="ml-2 text-sm text-gray-600">({vendor.rating})</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {vendor.materials?.slice(0, 2).join(', ') || 'N/A'}
                  {vendor.materials?.length > 2 && '...'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    vendor.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {vendor.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              {isContractor && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setEditingVendor(vendor)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vendor._id, vendor.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Vendors</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewType('cards')}
              className={`px-4 py-2 text-sm ${
                viewType === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`px-4 py-2 text-sm border-l border-gray-300 ${
                viewType === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table
            </button>
          </div>

          {/* Add Button */}
          {isContractor && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* Vendor List */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No vendors found</p>
          {isContractor && searchTerm === '' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Vendor
            </button>
          )}
        </div>
      ) : (
        viewType === 'cards' ? renderCardView() : renderTableView()
      )}

      {/* Add/Edit Vendor Form */}
      {(showAddForm || editingVendor) && (
        <VendorForm
          vendorToEdit={editingVendor}
          onClose={() => {
            setShowAddForm(false);
            setEditingVendor(null);
          }}
          onSuccess={() => {
            onUpdate?.();
          }}
        />
      )}
    </>
  );
};

export default VendorList;
