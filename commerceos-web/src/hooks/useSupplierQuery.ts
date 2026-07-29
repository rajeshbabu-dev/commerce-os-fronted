/* =============================================================================
   CommerceOS — Supplier Query Hooks
   ============================================================================= */

import { useQuery } from '@tanstack/react-query';
import { listSuppliers, listSupplierProducts, type SupplierResponse, type SupplierProductResponse } from '../api/supplier';

export function useSupplierQuery() {
  return useQuery<SupplierResponse[], Error>({
    queryKey: ['suppliers'],
    queryFn: listSuppliers,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSupplierProductsQuery(supplierId: string | null) {
  return useQuery<SupplierProductResponse[], Error>({
    queryKey: ['supplier-products', supplierId],
    queryFn: () => (supplierId ? listSupplierProducts(supplierId) : Promise.resolve([])),
    enabled: !!supplierId,
  });
}
