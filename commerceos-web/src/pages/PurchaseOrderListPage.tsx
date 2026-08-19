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

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    SENT: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Summary Cards
// ---------------------------------------------------------------------------

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
    { label: 'Active Drafts', value: activeDrafts, color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="card text-center py-4">
          <p className={`text-2xl font-semibold font-mono ${card.color}`}>
            {card.value}
          </p>
          <p className="text-xs text-slate-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const {
    data: pagedData,
    isLoading,
    error,
  } = usePurchaseOrderListQuery(selectedStatus === 'ALL' ? undefined : selectedStatus);
  const orders = pagedData?.content ?? [];

  const submitMutation = useSubmitPurchaseOrderMutation();

  const handleSubmit = (po: PurchaseOrderResponse) => {
    submitMutation.mutate({ id: po.id });
  };

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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Purchase Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage purchase orders and approval workflows
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="card text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading purchase orders...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card">
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              Failed to load purchase orders. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && orders && (
        <>
          <SummaryCards orders={orders} />

          {/* Status Filter Tabs */}
          <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2.5 px-4 font-medium text-sm border-b-2 transition-colors duration-150 whitespace-nowrap ${isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders Table */}
          {orders.length > 0 ? (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      PO ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/purchase-orders/${order.id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 font-mono"
                        >
                          {order.id.slice(0, 8)}...
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                        {order.supplierId.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right font-mono font-medium">
                        ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/purchase-orders/${order.id}`)}
                            className="text-sm text-slate-600 hover:text-slate-900"
                          >
                            View
                          </button>
                          {order.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSubmit(order)}
                              disabled={submitMutation.isPending}
                              className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-sm text-slate-500">
                No purchase orders found for status &quot;{selectedStatus}&quot;.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
