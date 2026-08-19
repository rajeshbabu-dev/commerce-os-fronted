import React from 'react';
import Card from '../ui/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  delta,
  className = '',
}) => {
  return (
    <Card className={`p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300/80 transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-medium text-slate-500">{title}</p>
        {icon && <div className="p-2 bg-slate-50 rounded-md text-slate-600 border border-slate-100">{icon}</div>}
      </div>
      <div className="mt-3">
        <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900">{value}</p>
        {(subtitle || delta) && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            {delta && (
              <span className={`font-medium ${delta.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {delta.value}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
