/* =============================================================================
   CommerceOS — Dashboard Page
   =============================================================================
   Operational analytics and KPI workspace with live health checks,
   Quick Actions, and Account Info per FRONTEND-SPEC.md.
   ============================================================================= */

import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Users,
  FileText,
  AlertTriangle,
  Zap,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkHealth, type HealthResponse } from '../api/health';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: JSX.Element;
  colorClass: string;
}

function KpiCard({ title, value, subtitle, icon, colorClass }: KpiCardProps) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <p className="text-xs sm:text-sm text-slate-500 font-medium">{title}</p>
        <div className={`p-2 rounded-md ${colorClass.replace('text-', 'bg-').replace('700', '50').replace('600', '50')} border border-slate-100`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-bold font-mono tracking-tight ${colorClass}`}>{value}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </Card>
  );
}

const quickActions = [
  {
    title: 'View Inventory',
    description: 'Check current stock levels and reorder points',
    to: '/inventory',
    icon: <Boxes className="w-4 h-4 text-primary-600" />,
    badgeColor: 'border-l-primary-600',
  },
  {
    title: 'Browse Recommendations',
    description: 'Review AI-assisted purchase recommendations',
    to: '/recommendations',
    icon: <Zap className="w-4 h-4 text-purple-600" />,
    badgeColor: 'border-l-purple-600',
  },
  {
    title: 'Pending Approvals',
    description: 'Review and act on purchase orders awaiting approval',
    to: '/approvals',
    icon: <CheckSquare className="w-4 h-4 text-amber-600" />,
    badgeColor: 'border-l-amber-600',
  },
  {
    title: 'Purchase Orders',
    description: 'Manage purchase orders and procurement workflow',
    to: '/purchase-orders',
    icon: <FileText className="w-4 h-4 text-cyan-600" />,
    badgeColor: 'border-l-cyan-600',
  },
];

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
      {/* Page Header */}
      <PageHeader
        title={`Welcome back${user?.username ? `, ${user.username}` : ''}`}
        subtitle="Here's your operations overview"
        badge={<Badge variant="info">Live Workspace</Badge>}
      />

      {/* System Health Banner */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shrink-0 ${health ? 'bg-emerald-500 animate-pulse' : healthError ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'}`} />
            <div>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" /> System Status
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {health
                  ? `${health.service} is ${health.status} — last checked ${new Date(health.timestamp).toLocaleTimeString()}`
                  : healthError
                  ? 'Unable to reach backend service'
                  : 'Checking backend status...'}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            health
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : healthError
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {health ? 'Healthy' : healthError ? 'Offline' : 'Loading'}
          </span>
        </div>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          key="inventory-health"
          title="Inventory Health"
          value="--"
          subtitle="% of SKUs within healthy band"
          icon={<Boxes className="w-5 h-5 text-primary-700" />}
          colorClass="text-primary-700"
        />
        <KpiCard
          key="supplier-score"
          title="Supplier Score"
          value="--"
          subtitle="Weighted performance score"
          icon={<Users className="w-5 h-5 text-emerald-700" />}
          colorClass="text-emerald-700"
        />
        <KpiCard
          key="open-pos"
          title="Open POs"
          value="--"
          subtitle="Purchase orders by status"
          icon={<FileText className="w-5 h-5 text-amber-700" />}
          colorClass="text-amber-700"
        />
        <KpiCard
          key="stockout-risk"
          title="Stockout Risk"
          value="--"
          subtitle="SKUs at risk in next N days"
          icon={<AlertTriangle className="w-5 h-5 text-rose-700" />}
          colorClass="text-rose-700"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`block card border-l-4 ${action.badgeColor} hover:shadow-md hover:border-slate-300 transition-all group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-6">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Info Card */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary-600" /> Account Info
          </h2>
          <Badge variant="neutral">Verified</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Username</span>
            <span className="text-slate-900 font-semibold mt-0.5 block">
              {user?.username ?? '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Email</span>
            <span className="text-slate-900 font-semibold mt-0.5 block">
              {user?.email ?? '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Roles</span>
            <span className="text-slate-900 font-semibold mt-0.5 block font-mono">
              {user?.roles?.join(', ') ?? '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Permissions</span>
            <span className="text-slate-900 font-semibold mt-0.5 block">
              {user?.permissions?.length ?? 0} permissions
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
