import { BarChart3 } from 'lucide-react';

export default function TrendChart({ 
  data = [], 
  type = "line", 
  xKey = "_id", 
  yKey = "count", 
  color = "#2563EB", 
  height = 300 
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <div>No data available</div>
        </div>
      </div>
    );
  }

  // Chart dimensions - responsive width
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  // Use viewport-based width, capped at sensible max
  const chartWidth = Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 100 : 600);
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate data bounds
  const values = data.map(d => d[yKey] || 0);
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue || 1;

  // Create points for the chart
  const points = data.map((d, i) => {
    const x = margin.left + (i / (data.length - 1)) * chartWidth;
    const y = margin.top + chartHeight - ((d[yKey] || 0) - minValue) / valueRange * chartHeight;
    return { x, y, value: d[yKey] || 0, label: d[xKey] };
  });

  // Create path for line chart
  const createLinePath = () => {
    if (points.length < 2) return "";
    return points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, "");
  };

  // Create path for area chart
  const createAreaPath = () => {
    if (points.length < 2) return "";
    const linePath = createLinePath();
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    return `${linePath} L ${lastPoint.x} ${margin.top + chartHeight} L ${firstPoint.x} ${margin.top + chartHeight} Z`;
  };

  // Format date labels
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Format values
  const formatValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${chartWidth + margin.left + margin.right} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-[300px]"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = minValue + ratio * valueRange;
          const y = margin.top + chartHeight - ratio * chartHeight;
          return (
            <g key={i}>
              <line 
                x1={margin.left} 
                y1={y} 
                x2={chartWidth + margin.left} 
                y2={y} 
                stroke="#e5e7eb" 
                strokeWidth="1"
              />
              <text 
                x={margin.left - 10} 
                y={y + 4} 
                textAnchor="end" 
                className="text-xs fill-gray-500"
              >
                {formatValue(value)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((point, i) => {
          if (i % Math.ceil(points.length / 5) !== 0 && i !== points.length - 1) return null;
          return (
            <text 
              key={i}
              x={point.x} 
              y={height - 10} 
              textAnchor="middle" 
              className="text-xs fill-gray-500"
            >
              {formatDate(point.label)}
            </text>
          );
        })}

        {/* Chart area */}
        {type === "area" && (
          <path 
            d={createAreaPath()} 
            fill={color} 
            fillOpacity="0.1"
            stroke="none"
          />
        )}

        {/* Line or area border */}
        <path 
          d={createLinePath()} 
          fill="none" 
          stroke={color} 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="4" 
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
            {/* Tooltip on hover */}
            <title>
              {formatDate(point.label)}: {formatValue(point.value)}
            </title>
          </g>
        ))}

        {/* Y-axis line */}
        <line 
          x1={margin.left} 
          y1={margin.top} 
          x2={margin.left} 
          y2={margin.top + chartHeight} 
          stroke="#d1d5db" 
          strokeWidth="1"
        />

        {/* X-axis line */}
        <line 
          x1={margin.left} 
          y1={margin.top + chartHeight} 
          x2={chartWidth + margin.left} 
          y2={margin.top + chartHeight} 
          stroke="#d1d5db" 
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
