/* =============================================================================
   CommerceOS — Purchase Order Detail Page
   ============================================================================= */

import { useParams, useNavigate } from 'react-router-dom';
import {
  usePurchaseOrderQuery,
  useSubmitPurchaseOrderMutation,
} from '../hooks/useProcurementQuery';

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
// Component
// ---------------------------------------------------------------------------

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
  } = usePurchaseOrderQuery(id ?? '');

  const submitMutation = useSubmitPurchaseOrderMutation();

  const handleSubmit = () => {
    if (id) submitMutation.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading purchase order...
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              Failed to load purchase order. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/purchase-orders')}
            className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-flex items-center gap-1"
          >
            ← Back to Purchase Orders
          </button>
          <h1 className="text-2xl font-semibold text-slate-900">
            Purchase Order
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-mono">{order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {order.status === 'DRAFT' && (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center py-4">
          <p className="text-2xl font-semibold font-mono text-slate-900">
            ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Amount</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-semibold font-mono text-indigo-600">
            {order.items.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Line Items</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-sm font-medium text-slate-900">
            {new Date(order.createdAt).toLocaleDateString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Created</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-mono text-slate-700">
                  {item.productId.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 text-right font-mono">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 text-right font-mono">
                  ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 text-right font-mono font-medium">
                  ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommendation Link */}
      {order.recommendationId && (
        <div className="mt-6 card py-4 px-6">
          <p className="text-sm text-slate-500">
            Created from recommendation:{' '}
            <span className="font-mono text-indigo-600">
              {order.recommendationId.slice(0, 8)}...
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
