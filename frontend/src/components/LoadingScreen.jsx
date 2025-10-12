import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900">Loading ConSync</h3>
        <p className="text-sm text-gray-500">Please wait...</p>
      </div>
    </div>
  );
}