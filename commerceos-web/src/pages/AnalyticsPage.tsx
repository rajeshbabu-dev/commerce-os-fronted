/* =============================================================================
   CommerceOS — Analytics Dashboard Page
   =============================================================================
   Visualizes the 6 KPIs from the analytics aggregate API with Recharts.
   ============================================================================= */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDashboardQuery } from '../hooks/useAnalyticsQuery';
import type { KpiValue } from '../api/analytics';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Users } from 'lucide-react';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatKpiValue(kpi: KpiValue): string {
  switch (kpi.key) {
    case 'procurementCost':
      return inrFormatter.format(kpi.value);
    case 'deadStock':
      return `${new Intl.NumberFormat('en-IN').format(kpi.value)} ${kpi.unit}`;
    default:
      return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(kpi.value)}${kpi.unit === '%' ? '%' : ''}`;
  }
}

function KpiCard({ kpi }: { kpi: KpiValue }) {
  return (
    <Card className="p-4 sm:p-5" data-testid={`kpi-${kpi.key}`}>
      <p className="text-xs sm:text-sm text-slate-500 font-medium">{kpi.label}</p>
      <p className="text-2xl font-bold font-mono tracking-tight mt-1 text-slate-900">
        {formatKpiValue(kpi)}
      </p>
      <p className="text-xs text-slate-400 mt-1">{kpi.description}</p>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className="page-container">
        <p className="text-sm text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="card bg-rose-50 text-rose-700 p-4 border border-rose-200">
          Failed to load analytics. Please try again.
        </div>
      </div>
    );
  }

  const kpis = [
    data.inventoryHealth,
    data.supplierScore,
    data.procurementCost,
    data.inventoryTurnover,
    data.stockoutRisk,
    data.deadStock,
  ];

  const funnelData = [
    { stage: 'Low Stock Alerts', events: data.funnel.lowStockAlerts },
    { stage: 'Recommendations', events: data.funnel.recommendations },
    { stage: 'POs Created', events: data.funnel.poCreated },
    { stage: 'Approvals', events: data.funnel.approvals },
  ];

  const trends = data.trends.map((point) => ({
    date: new Date(`${point.date}T00:00:00`).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }),
    'Low Stock': point.lowStockAlerts,
    'Recommendations': point.recommendations,
    'POs': point.poCreated,
    'Approvals': point.approvals,
  }));

  return (
    <div className="page-container">
      {/* Page header */}
      <PageHeader
        title="Analytics Dashboard"
        subtitle="KPIs computed from the domain event log — updated automatically as events flow in"
        badge={<Badge variant="info">Domain Stream</Badge>}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Active users strip */}
      <Card className="mb-8 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600" /> Active users (PO submitters)
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Distinct users who submitted purchase orders in the window
          </p>
        </div>
        <p className="text-2xl font-bold font-mono text-primary-600" data-testid="active-users">
          {data.activeUsers}
        </p>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Event Trends (14 days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Low Stock" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="Recommendations" stroke="#7c3aed" strokeWidth={2} />
              <Line type="monotone" dataKey="POs" stroke="#0891b2" strokeWidth={2} />
              <Line type="monotone" dataKey="Approvals" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Procurement Funnel</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="events" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
