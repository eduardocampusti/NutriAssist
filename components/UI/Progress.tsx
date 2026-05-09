import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, className = '', indicatorClassName = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full bg-emerald-500 transition-all duration-500 ease-out ${indicatorClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
