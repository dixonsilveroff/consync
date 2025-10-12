import React from 'react';

export default function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-2/3"></div>
    </div>
  );
}