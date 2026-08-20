import React from 'react';
import Button from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected network error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-4 sm:p-5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-rose-100 text-rose-600 rounded-md shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
          <p className="text-xs text-rose-700 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="shrink-0">
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
