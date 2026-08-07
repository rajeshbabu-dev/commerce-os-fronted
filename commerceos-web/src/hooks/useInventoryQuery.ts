/* =============================================================================
   CommerceOS — Inventory Query Hooks
   ============================================================================= */

import { useQuery } from '@tanstack/react-query';
import { listStockItems, type StockItemResponse, type PagedResponse } from '../api/inventory';

export function useInventoryQuery() {
  return useQuery<PagedResponse<StockItemResponse>, Error>({
    queryKey: ['inventory', 'stock-items'],
    queryFn: () => listStockItems({ page: 0, size: 100 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
