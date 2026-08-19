import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => (
  <div
    className={`animate-pulse bg-slate-100 rounded ${className}`}
    {...props}
  />
);

export default Skeleton;
