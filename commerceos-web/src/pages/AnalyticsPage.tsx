/* =============================================================================
   CommerceOS — Analytics Dashboard Page (TICKET-30)
   =============================================================================
   Visualizes the 6 KPIs from the analytics aggregate API with Recharts.
   Layout follows FRONTEND-SPEC.md §1 spacing/card rules.
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

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({ kpi }: { kpi: KpiValue }) {
  return (
    <div className="card" data-testid={`kpi-${kpi.key}`}>
      <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
      <p className="text-2xl font-semibold mt-1 text-slate-900">
        {formatKpiValue(kpi)}
      </p>
      <p className="text-xs text-slate-400 mt-1">{kpi.description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analytics Dashboard Page
// ---------------------------------------------------------------------------

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
        <div className="card bg-red-50 text-red-700 p-4">
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          KPIs computed from the domain event log — updated automatically as events flow in
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Active users strip */}
      <div className="card mb-8 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">Active users (PO submitters)</p>
          <p className="text-xs text-slate-500 mt-1">
            Distinct users who submitted purchase orders in the window
          </p>
        </div>
        <p className="text-2xl font-semibold text-primary-600" data-testid="active-users">
          {data.activeUsers}
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Event Trends (14 days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Low Stock" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="Recommendations" stroke="#7c3aed" strokeWidth={2} />
              <Line type="monotone" dataKey="POs" stroke="#0891b2" strokeWidth={2} />
              <Line type="monotone" dataKey="Approvals" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Procurement Funnel</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="events" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
