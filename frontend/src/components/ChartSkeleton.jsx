import React from 'react';

export default function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="flex justify-between">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
          ))}
        </div>
      </div>
    </div>
  );
}