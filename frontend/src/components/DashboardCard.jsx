export default function DashboardCard({ 
  title, 
  value, 
  icon, 
  color = "blue", 
  isProgress = false, 
  progressValue = 0,
  isExpense = false,
  trend = null 
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600"
  };

  const bgColorClasses = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50", 
    red: "bg-red-50",
    yellow: "bg-yellow-50"
  };

  const textColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600", 
    red: "text-red-600",
    yellow: "text-yellow-600"
  };

  const gradientClass = colorClasses[color] || colorClasses.blue;
  const bgClass = bgColorClasses[color] || bgColorClasses.blue;
  const textClass = textColorClasses[color] || textColorClasses.blue;

  // Determine if expense is high (red) or low (green)
  const getExpenseColor = (value) => {
    if (!isExpense) return textClass;
    const numericValue = parseFloat(value.replace(/[₦,]/g, ''));
    return numericValue > 1000000 ? "text-red-600" : "text-green-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md hover:translate-y-[-2px] group">
      {/* Gradient accent border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`}></div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{icon}</span>
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="mb-2">
            {isProgress ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <span className={`text-xl sm:text-2xl font-bold ${getExpenseColor(value)}`}>
                  {value}
                </span>
                <div className="w-full sm:flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${gradientClass}`}
                      style={{ width: `${Math.min(progressValue, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <span className={`text-xl sm:text-2xl font-bold ${getExpenseColor(value)}`}>
                {value}
              </span>
            )}
          </div>

          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center text-xs sm:text-sm transition-transform duration-300 group-hover:translate-x-1">
              <span className={`${trend > 0 ? "text-green-600" : "text-red-600"} font-medium`}>
                {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}%
              </span>
              <span className="text-gray-500 ml-1 hidden sm:inline">vs last month</span>
            </div>
          )}
        </div>
      </div>

      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${bgClass} rounded-full opacity-20 transition-all duration-300 group-hover:scale-110 group-hover:opacity-30`}></div>
    </div>
  );
}
