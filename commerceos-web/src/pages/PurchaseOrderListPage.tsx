/* =============================================================================
   CommerceOS — Purchase Order List Page
   ============================================================================= */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePurchaseOrderListQuery,
  useSubmitPurchaseOrderMutation,
} from '../hooks/useProcurementQuery';
import type { PurchaseOrderResponse } from '../api/procurement';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ArrowRight } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    SENT: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function SummaryCards({ orders }: { orders: PurchaseOrderResponse[] }) {
  const totalPOs = orders.length;
  const pendingValue = orders
    .filter((o) => o.status === 'PENDING_APPROVAL')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeDrafts = orders.filter((o) => o.status === 'DRAFT').length;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(pendingValue);

  const cards = [
    { label: 'Total POs', value: totalPOs, color: 'text-slate-900' },
    { label: 'Pending Value', value: formatted, color: 'text-amber-600' },
    { label: 'Active Drafts', value: activeDrafts, color: 'text-primary-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.label} className="text-center py-4">
          <p className={`text-2xl font-semibold font-mono ${card.color}`}>
            {card.value}
          </p>
          <p className="text-xs text-slate-500 mt-1">{card.label}</p>
        </Card>
      ))}
    </div>
  );
}

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const {
    data: pagedData,
    isLoading,
    error,
  } = usePurchaseOrderListQuery(
    selectedStatus === 'ALL' ? undefined : selectedStatus,
  );
  const orders = pagedData?.content ?? [];

  const submitMutation = useSubmitPurchaseOrderMutation();

  const handleSubmit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    submitMutation.mutate({ id });
  };

  const handleRowClick = (id: string) => {
    navigate(`/purchase-orders/${id}`);
  };

  const filteredOrders = (orders ?? []).filter((o) => {
    if (selectedStatus === 'ALL') return true;
    return o.status === selectedStatus;
  });

  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'PENDING_APPROVAL', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'SENT', label: 'Sent' },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage end-to-end procurement requests, vendor submissions, and authorization"
        badge={<Badge variant="neutral">{orders.length} Orders</Badge>}
      />

      {/* Loading State */}
      {isLoading && (
        <Card className="text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <svg
              className="animate-spin h-5 w-5 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading purchase orders...
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            Failed to load purchase orders. Please try again.
          </div>
        </Card>
      )}

      {/* Data Loaded */}
      {!isLoading && !error && (
        <>
          {/* Summary Cards */}
          <SummaryCards orders={orders} />

          {/* Status Filter Tabs */}
          <div className="flex border-b border-slate-200/80 mb-6 gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2 px-3.5 font-semibold text-xs rounded-t-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-b-2 border-primary-600 text-primary-700 bg-primary-50/50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* PO Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">
                      PO ID
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-center">
                      Items
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      Total
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const formattedTotal = new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 2,
                    }).format(order.totalAmount || 0);

                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleRowClick(order.id)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-slate-900 font-medium">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600 text-xs">
                          {order.supplierId.slice(0, 8)}...
                        </td>
                        <td className="px-5 py-3.5 font-mono text-center tabular-nums">
                          {order.items?.length ?? 0}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-right font-semibold text-slate-900 tabular-nums">
                          {formattedTotal}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {order.status === 'DRAFT' ? (
                            <button
                              type="button"
                              onClick={(e) => handleSubmit(order.id, e)}
                              disabled={
                                submitMutation.isPending &&
                                submitMutation.variables?.id === order.id
                              }
                              className="btn-primary text-xs h-7 px-2.5"
                            >
                              {submitMutation.isPending &&
                              submitMutation.variables?.id === order.id
                                ? 'Submitting...'
                                : 'Submit'}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs inline-flex items-center gap-1 hover:text-primary-600">
                              Details <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500">
                  No purchase orders found for status &quot;{selectedStatus}&quot;.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
