/* =============================================================================
   CommerceOS — Inventory Query Hooks
   ============================================================================= */

import { useQuery } from '@tanstack/react-query';
import { listStockItems, type StockItemResponse } from '../api/inventory';

export function useInventoryQuery() {
  return useQuery<StockItemResponse[], Error>({
    queryKey: ['inventory', 'stock-items'],
    queryFn: listStockItems,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
