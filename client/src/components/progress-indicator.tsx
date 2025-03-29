interface ProgressIndicatorProps {
  percentage: number;
}

export function ProgressIndicator({ percentage }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        >
        </div>
      </div>
      <span className="ml-4 text-sm text-gray-600">{percentage}%</span>
    </div>
  );
}
