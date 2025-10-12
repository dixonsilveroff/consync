export default function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
      <div
        className="h-3 bg-blue-600 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}