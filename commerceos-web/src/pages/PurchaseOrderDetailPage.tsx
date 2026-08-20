/* =============================================================================
   CommerceOS — Purchase Order Detail Page
   ============================================================================= */

import { useParams, useNavigate } from 'react-router-dom';
import {
  usePurchaseOrderQuery,
  useSubmitPurchaseOrderMutation,
} from '../hooks/useProcurementQuery';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Send } from 'lucide-react';

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
        <Card className="text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading purchase order...
          </div>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <Card>
          <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            Failed to load purchase order. Please try again.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="text-xs text-slate-500 hover:text-slate-900 mb-2 inline-flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Purchase Orders
        </button>
      </div>

      <PageHeader
        title="Purchase Order"
        subtitle={order.id}
        badge={<StatusBadge status={order.status} />}
        actions={
          order.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleSubmit}
              isLoading={submitMutation.isPending}
            >
              Submit for Approval
            </Button>
          )
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="text-center py-4">
          <p className="text-2xl font-semibold font-mono text-slate-900">
            ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Amount</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-semibold font-mono text-primary-600">
            {order.items.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Line Items</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-sm font-medium font-mono text-slate-900 mt-2">
            {new Date(order.createdAt).toLocaleDateString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Created</p>
        </Card>
      </div>

      {/* Line Items Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-200 text-slate-500">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">
                  Product ID
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                  Quantity
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                  Unit Price
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-700">
                    {item.productId.slice(0, 8)}...
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 text-right font-mono tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 text-right font-mono tabular-nums">
                    ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-slate-900 text-right font-mono font-semibold tabular-nums">
                    ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation Link */}
      {order.recommendationId && (
        <Card className="mt-6 py-4 px-5 bg-purple-50/40 border-purple-200 text-xs">
          <p className="text-slate-600">
            Created from recommendation:{' '}
            <span className="font-mono text-purple-700 font-semibold">
              {order.recommendationId.slice(0, 8)}...
            </span>
          </p>
        </Card>
      )}
    </div>
  );
}
