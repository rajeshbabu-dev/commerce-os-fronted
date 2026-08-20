/* =============================================================================
   CommerceOS — Inventory List Page
   =============================================================================
   Per TICKET-25: Table showing product, quantity on hand, reorder point,
   and status badge. Uses TanStack Query for live data fetching.
   Per FRONTEND-SPEC.md §1: JetBrains Mono for numeric columns,
   status badges with green/amber/red colors.
   Includes "Add Inventory" modal to create products & stock items with live refresh.
   ============================================================================= */

import { useState } from 'react';
import { useInventoryQuery } from '../hooks/useInventoryQuery';
import {
  createProduct,
  createStockItem,
  listProducts,
  type StockItemResponse,
  type ProductResponse,
} from '../api/inventory';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import { Search, Plus, Package } from 'lucide-react';

function getItemStatus(item: StockItemResponse): 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
  if (item.status) return item.status;
  if (item.quantityOnHand <= 0) return 'OUT_OF_STOCK';
  if (item.quantityOnHand <= item.reorderPoint) return 'LOW_STOCK';
  return 'HEALTHY';
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    HEALTHY: { className: 'badge-success', label: 'Healthy' },
    LOW_STOCK: { className: 'badge-warning', label: 'Low Stock' },
    OUT_OF_STOCK: { className: 'badge-danger', label: 'Out of Stock' },
  };
  const badge = config[status] ?? config.HEALTHY;
  return <span className={badge.className}>{badge.label}</span>;
}

function SummaryCards({ items }: { items: StockItemResponse[] }) {
  const total = items.length;
  const healthy = items.filter((i) => getItemStatus(i) === 'HEALTHY').length;
  const lowStock = items.filter((i) => getItemStatus(i) === 'LOW_STOCK').length;
  const outOfStock = items.filter((i) => getItemStatus(i) === 'OUT_OF_STOCK').length;

  const cards = [
    { label: 'Total SKUs', value: total, color: 'text-slate-900' },
    { label: 'Healthy', value: healthy, color: 'text-emerald-600' },
    { label: 'Low Stock', value: lowStock, color: 'text-amber-600' },
    { label: 'Out of Stock', value: outOfStock, color: 'text-rose-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.label} className="text-center py-4">
          <p className={`text-2xl font-semibold font-mono ${card.color}`}>{card.value}</p>
          <p className="text-xs text-slate-500 mt-1">{card.label}</p>
        </Card>
      ))}
    </div>
  );
}

export default function InventoryListPage() {
  const { data: pagedData, isLoading, error, refetch } = useInventoryQuery();
  const stockItems = pagedData?.content ?? [];
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [mode, setMode] = useState<'NEW_PRODUCT' | 'EXISTING_PRODUCT'>('NEW_PRODUCT');
  const [existingProducts, setExistingProducts] = useState<ProductResponse[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('UNITS');
  const [quantityOnHand, setQuantityOnHand] = useState('100');
  const [reorderPoint, setReorderPoint] = useState('20');
  const [safetyStock, setSafetyStock] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = async () => {
    setFormError(null);
    try {
      const res = await listProducts({ page: 0, size: 100 });
      setExistingProducts(res.content ?? []);
      if (res.content?.length > 0) {
        setSelectedProductId(res.content[0].id);
      }
    } catch {
      // Ignore if products cannot be fetched
    }
    setShowAddModal(true);
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      let targetProductId = selectedProductId;

      if (mode === 'NEW_PRODUCT') {
        const newProduct = await createProduct({
          name,
          sku,
          description: description || undefined,
          unitOfMeasure,
        });
        targetProductId = newProduct.id;
      }

      await createStockItem({
        productId: targetProductId,
        quantityOnHand: parseInt(quantityOnHand, 10) || 0,
        reorderPoint: parseInt(reorderPoint, 10) || 0,
        safetyStock: parseInt(safetyStock, 10) || 0,
      });

      // Reset Form & Refetch
      setShowAddModal(false);
      setName('');
      setSku('');
      setDescription('');
      setQuantityOnHand('100');
      setReorderPoint('20');
      setSafetyStock('10');
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add inventory. Please check SKU uniqueness.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = stockItems.filter(
    (item) =>
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Inventory"
        subtitle="Track product stock levels, safety buffer, and reorder status"
        badge={<Badge variant="neutral">{stockItems.length} SKUs</Badge>}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Add Inventory
          </Button>
        }
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
            Loading inventory...
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <div className="rounded-md bg-rose-50 border border-rose-200 p-4">
            <p className="text-sm text-rose-700">
              Failed to load inventory data. Please try again.
            </p>
          </div>
        </Card>
      )}

      {/* Data Loaded */}
      {pagedData && (
        <>
          {/* Summary Cards */}
          <SummaryCards items={stockItems} />

          {/* Search & Filter Toolbar with Right-Corner Add Inventory Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by SKU or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openAddModal}
              className="w-full sm:w-auto"
            >
              Add Inventory
            </Button>
          </div>

          {/* Inventory Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      Qty on Hand
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      Reserved
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      Reorder Point
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      Safety Stock
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors duration-100"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.product?.name ?? 'Unnamed Product'}
                          </p>
                          {item.product?.description && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                              {item.product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 text-xs">
                        {item.product?.sku ?? 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-medium text-right tabular-nums text-slate-900">
                        {item.quantityOnHand}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-right tabular-nums text-slate-500">
                        {item.quantityReserved ?? 0}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-right tabular-nums text-slate-500">
                        {item.reorderPoint}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-right tabular-nums text-slate-500">
                        {item.safetyStock ?? 0}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={getItemStatus(item)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No inventory items found.</p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={openAddModal}
                  className="mt-3"
                >
                  Add Your First Stock Item
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Inventory Dialog */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Inventory Item"
        description="Add a new catalog product or attach inventory levels to an existing item."
      >
        <form onSubmit={handleAddInventory} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
              {formError}
            </div>
          )}

          {/* Mode Selector */}
          <div className="flex gap-4 border-b border-slate-200 pb-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === 'NEW_PRODUCT'}
                onChange={() => setMode('NEW_PRODUCT')}
                className="text-primary-600"
              />
              Create New SKU
            </label>
            {existingProducts.length > 0 && (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'EXISTING_PRODUCT'}
                  onChange={() => setMode('EXISTING_PRODUCT')}
                  className="text-primary-600"
                />
                Select Existing Product
              </label>
            )}
          </div>

          {mode === 'NEW_PRODUCT' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Precision Sensor Module"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="input-field font-mono uppercase"
                    placeholder="SKU-SEN-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="input-field"
                  >
                    <option value="UNITS">Units</option>
                    <option value="PCS">PCS</option>
                    <option value="BOX">Box</option>
                    <option value="KG">KG</option>
                    <option value="LITERS">Liters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="High-accuracy optical sensor"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Choose Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="input-field"
                required
              >
                {existingProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Inventory Quantities */}
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Initial Qty *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(e.target.value)}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reorder Point *
              </label>
              <input
                type="number"
                min="0"
                required
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Safety Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={safetyStock}
                onChange={(e) => setSafetyStock(e.target.value)}
                className="input-field font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add to Inventory'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
