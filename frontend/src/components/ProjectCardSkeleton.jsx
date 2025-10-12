export default function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        {/* Action buttons skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
      
      {/* Footer section */}
      <div className="flex items-center justify-between">
        {/* Budget skeleton */}
        <div>
          <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
        {/* Status skeleton */}
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>
    </div>
  );
}