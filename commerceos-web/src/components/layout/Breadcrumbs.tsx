import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  home: 'Home',
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  suppliers: 'Suppliers',
  recommendations: 'AI Recommendations',
  'purchase-orders': 'Purchase Orders',
  approvals: 'Approvals',
  analytics: 'Analytics',
  events: 'Event Log',
  admin: 'Administration',
  users: 'User Management',
};

export const Breadcrumbs: React.FC<{ className?: string }> = ({ className = '' }) => {
  let pathname = '';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch {
    return null;
  }

  const pathnames = pathname.split('/').filter((x) => x);
  if (pathnames.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-1.5 text-xs text-slate-500 font-medium ${className}`} aria-label="Breadcrumb">
      <Link to="/home" className="hover:text-slate-900 transition-colors">
        CommerceOS
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[value] || value;

        return (
          <React.Fragment key={to}>
            <span className="text-slate-300">/</span>
            {isLast ? (
              <span className="text-slate-900 font-semibold" aria-current="page">
                {label}
              </span>
            ) : (
              <Link to={to} className="hover:text-slate-900 transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
