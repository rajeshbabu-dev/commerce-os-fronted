/* =============================================================================
   CommerceOS — Inventory List Page
   =============================================================================
   Per TICKET-25: Table showing product, quantity on hand, reorder point,
   and status badge. Uses TanStack Query for live data fetching.
   Per 08-FRONTEND-SPEC.md §1: JetBrains Mono for numeric columns,
   status badges with amber (low) and red (critical) colors.
   ============================================================================= */

import { useInventoryQuery } from '../hooks/useInventoryQuery';
import type { StockItemResponse } from '../api/inventory';

// ---------------------------------------------------------------------------
// Status Badge Component
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    HEALTHY: { className: 'badge-success', label: 'Healthy' },
    LOW_STOCK: { className: 'badge-warning', label: 'Low Stock' },
    OUT_OF_STOCK: { className: 'badge-danger', label: 'Out of Stock' },
  };
  const badge = config[status] ?? config.HEALTHY;
  return <span className={badge.className}>{badge.label}</span>;
}

// ---------------------------------------------------------------------------
// Summary Cards
// ---------------------------------------------------------------------------

function SummaryCards({ items }: { items: StockItemResponse[] }) {
  const total = items.length;
  const healthy = items.filter((i) => i.status === 'HEALTHY').length;
  const lowStock = items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStock = items.filter((i) => i.status === 'OUT_OF_STOCK').length;

  const cards = [
    { label: 'Total SKUs', value: total, color: 'text-slate-900' },
    { label: 'Healthy', value: healthy, color: 'text-green-600' },
    { label: 'Low Stock', value: lowStock, color: 'text-amber-600' },
    { label: 'Out of Stock', value: outOfStock, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="card text-center py-4">
          <p className={`text-2xl font-semibold font-mono ${card.color}`}>{card.value}</p>
          <p className="text-xs text-slate-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InventoryListPage() {
  const { data: pagedData, isLoading, error } = useInventoryQuery();
  const stockItems = pagedData?.content ?? [];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track product stock levels and reorder status
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <svg
              className="animate-spin h-5 w-5"
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
            Loading inventory...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card">
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              Failed to load inventory data. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Data Loaded */}
      {pagedData && (
        <>
          {/* Summary Cards */}
          <SummaryCards items={stockItems} />

          {/* Inventory Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                      Qty on Hand
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                      Reserved
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                      Reorder Point
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors duration-100"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.product.name}
                          </p>
                          {item.product.description && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                              {item.product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                        {item.product.sku}
                      </td>
                      <td className="px-6 py-4 font-mono text-right tabular-nums">
                        {item.quantityOnHand}
                      </td>
                      <td className="px-6 py-4 font-mono text-right tabular-nums text-slate-500">
                        {item.quantityReserved}
                      </td>
                      <td className="px-6 py-4 font-mono text-right tabular-nums text-slate-500">
                        {item.reorderPoint}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {stockItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500">No inventory items found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
