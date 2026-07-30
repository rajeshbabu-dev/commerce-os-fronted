/* =============================================================================
   CommerceOS — Supplier List & Mapping Page
   =============================================================================
   Per TICKET-26: Displays supplier list with payment terms, performance badges,
   and detail drawer for mapped products.
   Per 08-FRONTEND-SPEC.md: font-mono for numeric columns (costs, lead times, rates).
   ============================================================================= */

import { useState } from 'react';
import { useSupplierQuery, useSupplierProductsQuery } from '../hooks/useSupplierQuery';
import {
  createSupplier,
  mapSupplierProduct,
  listProductsForMapping,
  type SupplierResponse,
  type ProductOption,
} from '../api/supplier';

function PerformanceBadge({ rate }: { rate: number | undefined }) {
  if (rate === undefined || rate === null) {
    return <span className="badge bg-slate-100 text-slate-600">N/A</span>;
  }
  let badgeClass = 'badge-success';
  if (rate < 85) badgeClass = 'badge-danger';
  else if (rate < 95) badgeClass = 'badge-warning';

  return <span className={`${badgeClass} font-mono`}>{rate.toFixed(1)}%</span>;
}

export default function SupplierListPage() {
  const { data: suppliers, isLoading, error, refetch } = useSupplierQuery();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Mapped products for selected supplier
  const { data: mappedProducts, refetch: refetchMappings } = useSupplierProductsQuery(
    selectedSupplier?.id ?? null,
  );

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('NET_30');

  // Mapping form states
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('7');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier({ name, contactEmail: email, phone, paymentTerms });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      refetch();
    } catch {
      alert('Failed to create supplier');
    }
  };

  const openMapModal = async () => {
    try {
      const products = await listProductsForMapping();
      setAvailableProducts(products);
      if (products.length > 0) setSelectedProductId(products[0].id);
      setShowMapModal(true);
    } catch {
      alert('Failed to load products');
    }
  };

  const handleMapProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    try {
      await mapSupplierProduct(selectedSupplier.id, {
        productId: selectedProductId,
        unitCost: parseFloat(unitCost),
        leadTimeDays: parseInt(leadTimeDays, 10),
        isPrimary,
      });
      setShowMapModal(false);
      setUnitCost('');
      refetchMappings();
    } catch {
      alert('Failed to map product');
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage vendor profiles, payment terms, and product lead times
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Supplier
        </button>
      </div>

      {/* Summary Cards */}
      {suppliers && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center py-4">
            <p className="text-2xl font-semibold font-mono text-slate-900">{suppliers.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total Suppliers</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-semibold font-mono text-green-600">
              {suppliers.filter((s) => (s.performance?.fulfillmentRate ?? 100) >= 95).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Top Performers (≥95%)</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-semibold font-mono text-amber-600">
              {suppliers.filter((s) => s.paymentTerms === 'NET_30').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">NET 30 Terms</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-semibold font-mono text-cyan-600">
              {suppliers.filter((s) => s.active).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Active Vendors</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card text-center py-16 text-slate-500">
          Loading suppliers...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 text-red-700 p-4">
          Failed to load suppliers. Please try again.
        </div>
      )}

      {/* Main Supplier Table */}
      {suppliers && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Supplier Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Contact Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Payment Terms</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase text-right">Fulfillment Rate</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase text-right">Avg Lead Time</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                    <td className="px-6 py-4 text-slate-500">{s.contactEmail}</td>
                    <td className="px-6 py-4">
                      <span className="badge badge-info font-mono">{s.paymentTerms}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <PerformanceBadge rate={s.performance?.fulfillmentRate} />
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                      {s.performance?.avgLeadTimeDays ?? 7}d
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="btn-ghost text-xs text-primary-600 hover:text-primary-700"
                        onClick={() => setSelectedSupplier(s)}
                      >
                        View Catalog &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mapped Products Drawer / Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white w-full max-w-xl h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedSupplier.name}</h2>
                  <p className="text-xs text-slate-500">{selectedSupplier.contactEmail} &bull; {selectedSupplier.paymentTerms}</p>
                </div>
                <button
                  className="btn-ghost text-slate-400 hover:text-slate-600"
                  onClick={() => setSelectedSupplier(null)}
                >
                  &times;
                </button>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-slate-900">Mapped Products & Pricing</h3>
                <button className="btn-secondary text-xs h-8" onClick={openMapModal}>
                  + Map Product
                </button>
              </div>

              {mappedProducts && (
                <div className="space-y-3">
                  {mappedProducts.map((mp) => (
                    <div key={mp.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Product ID: {mp.productId.substring(0, 8)}...</p>
                        <p className="text-xs text-slate-500">Lead Time: <span className="font-mono">{mp.leadTimeDays} days</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold font-mono text-slate-900">${mp.unitCost.toFixed(2)}</p>
                        {mp.isPrimary && <span className="badge badge-success text-[10px]">Primary</span>}
                      </div>
                    </div>
                  ))}
                  {mappedProducts.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-8">No products mapped yet.</p>
                  )}
                </div>
              )}
            </div>

            <button className="btn-secondary w-full mt-6" onClick={() => setSelectedSupplier(null)}>
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <form className="card w-full max-w-md space-y-4" onSubmit={handleCreateSupplier}>
            <h2 className="text-lg font-semibold text-slate-900">Add New Supplier</h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Terms</label>
              <select className="input-field" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                <option value="NET_30">NET_30</option>
                <option value="NET_60">NET_60</option>
                <option value="DUE_ON_RECEIPT">DUE_ON_RECEIPT</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Supplier</button>
            </div>
          </form>
        </div>
      )}

      {/* Map Product Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <form className="card w-full max-w-md space-y-4" onSubmit={handleMapProduct}>
            <h2 className="text-lg font-semibold text-slate-900">Map Product to Supplier</h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Product</label>
              <select className="input-field" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Unit Cost ($)</label>
              <input type="number" step="0.01" className="input-field" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Lead Time (Days)</label>
              <input type="number" className="input-field" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPrimary" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              <label htmlFor="isPrimary" className="text-xs text-slate-700">Set as Primary Supplier for this Product</label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowMapModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Mapping</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
