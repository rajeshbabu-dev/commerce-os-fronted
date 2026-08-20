/* =============================================================================
   CommerceOS — Supplier List & Mapping Page
   =============================================================================
   Displays full-width, responsive supplier catalog with vendor performance ratings,
   payment terms, search filtering, and clean modal for viewing/mapping SKUs.
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
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import { Plus, Link as LinkIcon, Building2, Search, PackageCheck } from 'lucide-react';

function PerformanceBadge({ rate }: { rate: number | undefined }) {
  if (rate === undefined || rate === null) {
    return <Badge variant="neutral">N/A</Badge>;
  }
  let variant: 'success' | 'warning' | 'danger' = 'success';
  if (rate < 85) variant = 'danger';
  else if (rate < 95) variant = 'warning';

  return <Badge variant={variant} className="font-mono">{rate.toFixed(1)}%</Badge>;
}

export default function SupplierListPage() {
  const { data: pagedData, isLoading, error, refetch } = useSupplierQuery();
  const suppliers = pagedData?.content ?? [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const openDetails = (supplier: SupplierResponse) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const openMapModal = async (supplier?: SupplierResponse) => {
    if (supplier) setSelectedSupplier(supplier);
    try {
      const prods = await listProductsForMapping();
      setAvailableProducts(prods);
      if (prods.length > 0) setSelectedProductId(prods[0].id);
      setShowMapModal(true);
    } catch {
      alert('Failed to load products for mapping');
    }
  };

  const handleMapProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedProductId) return;
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
      refetch();
    } catch {
      alert('Failed to map product');
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentTerms.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor catalog relationships, performance ratings, and payment terms"
        badge={<Badge variant="neutral">{suppliers.length} Vendors</Badge>}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Supplier
          </Button>
        }
      />

      {/* Loading State */}
      {isLoading && (
        <Card className="text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading suppliers...
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            Failed to load supplier directory. Please try again.
          </div>
        </Card>
      )}

      {/* Data Loaded - Full Width Clean Table */}
      {pagedData && (
        <div className="space-y-4">
          {/* Search & Actions Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vendors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto"
            >
              Add Supplier
            </Button>
          </div>

          {/* Clean Full-Width Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Vendor</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Contact</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Terms</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">Avg Lead Time</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">Fulfillment</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuppliers.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-xs shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{s.name}</p>
                            <span className="text-[11px] text-slate-400 font-mono">{s.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <p>{s.contactEmail}</p>
                        {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="neutral">{s.paymentTerms}</Badge>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-right tabular-nums text-slate-600">
                        {s.performance?.avgLeadTimeDays ?? 7} days
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <PerformanceBadge rate={s.performance?.fulfillmentRate} />
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(s)}
                          leftIcon={<PackageCheck className="w-3.5 h-3.5" />}
                        >
                          View SKUs
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openMapModal(s)}
                          leftIcon={<LinkIcon className="w-3.5 h-3.5" />}
                        >
                          Map SKU
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No suppliers found.</p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setShowAddModal(true)}
                  className="mt-3"
                >
                  Add Your First Supplier
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supplier Details & Mapped SKUs Modal */}
      <Dialog
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedSupplier ? `${selectedSupplier.name} — Vendor Details` : 'Vendor Details'}
        description="View supplier terms, performance indicators, and mapped catalog products."
      >
        {selectedSupplier && (
          <div className="space-y-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Email</p>
                <p className="font-medium text-slate-900 truncate">{selectedSupplier.contactEmail}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Payment Terms</p>
                <p className="font-medium text-slate-900">{selectedSupplier.paymentTerms}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Avg Lead Time</p>
                <p className="font-medium text-slate-900 font-mono">{selectedSupplier.performance?.avgLeadTimeDays ?? 7} days</p>
              </div>
            </div>

            {/* Mapped SKUs Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Mapped Catalog Products
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LinkIcon className="w-3 h-3" />}
                  onClick={() => {
                    setShowDetailsModal(false);
                    openMapModal(selectedSupplier);
                  }}
                >
                  Map New SKU
                </Button>
              </div>

              {mappedProducts && mappedProducts.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {mappedProducts.map((mp) => (
                    <div
                      key={mp.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium font-mono text-slate-900">{mp.productId.slice(0, 8)}...</p>
                        <p className="text-[11px] text-slate-500 font-mono">Lead Time: {mp.leadTimeDays} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-slate-900">₹{mp.unitCost}</p>
                        {mp.isPrimary && (
                          <span className="text-[10px] text-emerald-600 font-medium">Primary Vendor</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-400">
                  No catalog products mapped to this vendor yet.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Supplier Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Supplier"
        description="Register a new vendor partner into CommerceOS."
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Acme Industrial Corp"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="sales@acme.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="input-field"
            >
              <option value="NET_15">NET 15</option>
              <option value="NET_30">NET 30</option>
              <option value="NET_60">NET 60</option>
              <option value="DUE_ON_RECEIPT">Due on Receipt</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Supplier
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Map SKU Modal */}
      <Dialog
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title={selectedSupplier ? `Map SKU to ${selectedSupplier.name}` : 'Map SKU to Vendor'}
        description="Bind a catalog product with vendor-specific pricing and lead times."
      >
        <form onSubmit={handleMapProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Product *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="input-field"
              required
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Unit Cost (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="input-field font-mono"
                placeholder="150.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Lead Time (Days) *</label>
              <input
                type="number"
                required
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                className="input-field font-mono"
                placeholder="7"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded text-primary-600"
            />
            <label htmlFor="isPrimary" className="text-xs text-slate-700 font-medium">
              Designate as Primary Vendor for this product
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowMapModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Mapping
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
