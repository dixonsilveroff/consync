export default function ProgressBar({ value, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const heightClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`w-full bg-gray-200 ${heightClass} rounded-full overflow-hidden`}>
      <div
        className={`${heightClass} bg-blue-600 rounded-full transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}