/* =============================================================================
   CommerceOS — Dashboard Page
   =============================================================================
   Landing page after login showing key metrics and quick actions.
   KPI cards follow the card component spec from FRONTEND-SPEC.md §1.
   ============================================================================= */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkHealth, type HealthResponse } from '../api/health';

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

import type { JSX } from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: JSX.Element;
  colorClass: string;
}

function KpiCard({ title, value, subtitle, icon, colorClass }: KpiCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className={`text-2xl font-semibold mt-1 ${colorClass}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('700', '100').replace('600', '100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

const quickActions = [
  {
    title: 'View Inventory',
    description: 'Check current stock levels and reorder points',
    to: '/inventory',
    color: 'border-l-primary-600',
  },
  {
    title: 'Browse Recommendations',
    description: 'Review AI-assisted purchase recommendations',
    to: '/recommendations',
    color: 'border-l-ai-accent',
  },
  {
    title: 'Pending Approvals',
    description: 'Review and act on purchase orders awaiting approval',
    to: '/approvals',
    color: 'border-l-amber-600',
  },
  {
    title: 'Purchase Orders',
    description: 'Manage purchase orders and procurement workflow',
    to: '/purchase-orders',
    color: 'border-l-cyan-700',
  },
];

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch(() => setHealthError('Backend unreachable'));
  }, []);

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back{user?.username ? `, ${user.username}` : ''}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s your operations overview
        </p>
      </div>

      {/* System Health */}
      <div className="mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${health ? 'bg-green-500 animate-pulse' : healthError ? 'bg-red-500' : 'bg-amber-400 animate-pulse'}`} />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  System Status
                </p>
                <p className="text-xs text-slate-500">
                  {health
                    ? `${health.service} is ${health.status} — last checked ${new Date(health.timestamp).toLocaleTimeString()}`
                    : healthError
                    ? 'Unable to reach backend service'
                    : 'Checking backend status...'}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              health
                ? 'bg-green-100 text-green-800'
                : healthError
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {health ? 'Healthy' : healthError ? 'Offline' : 'Loading'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard key="inventory-health"
          title="Inventory Health"
          value="--"
          subtitle="% of SKUs within healthy band"
          icon={
            <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
          colorClass="text-primary-700"
        />
        <KpiCard key="supplier-score"
          title="Supplier Score"
          value="--"
          subtitle="Weighted performance score"
          icon={
            <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
          colorClass="text-green-700"
        />
        <KpiCard key="open-pos"
          title="Open POs"
          value="--"
          subtitle="Purchase orders by status"
          icon={
            <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          }
          colorClass="text-amber-700"
        />
        <KpiCard key="stockout-risk"
          title="Stockout Risk"
          value="--"
          subtitle="SKUs at risk in next N days"
          icon={
            <svg className="w-5 h-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
          colorClass="text-red-700"
        />
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`block card border-l-4 ${action.color} hover:shadow-md transition-shadow duration-150`}
            >
              <h3 className="font-medium text-slate-900">{action.title}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* User info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Account Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Username:</span>{' '}
            <span className="text-slate-900 font-medium">
              {user?.username ?? '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Email:</span>{' '}
            <span className="text-slate-900 font-medium">
              {user?.email ?? '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Roles:</span>{' '}
            <span className="text-slate-900 font-medium">
              {user?.roles?.join(', ') ?? '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Permissions:</span>{' '}
            <span className="text-slate-900 font-medium">
              {user?.permissions?.length ?? 0} permissions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
