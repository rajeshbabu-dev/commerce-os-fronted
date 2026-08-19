/* =============================================================================
   CommerceOS — Recommendation Card Component
   =============================================================================
   Displays a single purchase recommendation with product, supplier, quantity,
   and cost breakdown in INR (₹). Uses a special violet panel for AI reasoning text.
   ============================================================================= */

import type { PurchaseRecommendationResponse } from '../api/recommendation';

interface RecommendationCardProps {
  recommendation: PurchaseRecommendationResponse;
  onDismiss?: (id: string) => void;
  onConvertToPO?: (recommendation: PurchaseRecommendationResponse) => void;
  isDismissing?: boolean;
}

// ---------------------------------------------------------------------------
// Urgency Badge Component
// ---------------------------------------------------------------------------

function UrgencyBadge({ urgency }: { urgency: string }) {
  switch (urgency.toUpperCase()) {
    case 'CRITICAL':
      return <span className="badge-danger">CRITICAL</span>;
    case 'HIGH':
      return <span className="badge-warning">HIGH</span>;
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          LOW
        </span>
      );
  }
}

// Helper to truncate long UUID strings cleanly
function formatMinimalId(id: string): string {
  if (!id) return '';
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}...`;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function RecommendationCard({
  recommendation,
  onDismiss,
  onConvertToPO,
  isDismissing = false,
}: RecommendationCardProps) {
  const {
    id,
    productId,
    recommendedSupplierId,
    recommendedQuantity,
    unitCost,
    estimatedTotalCost,
    urgencyLevel,
    confidenceScore,
    llmReasoning,
    status,
  } = recommendation;

  // Format currency in Indian Rupees (INR / ₹)
  const formattedUnitCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(unitCost);

  const formattedTotalCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(estimatedTotalCost);

  const confidencePercentage = Math.round(confidenceScore * 100);

  return (
    <div className="card flex flex-col justify-between space-y-4">
      {/* Header & Urgency */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-mono" title={productId}>
              Product: {formatMinimalId(productId)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5" title={recommendedSupplierId}>
              Supplier ID: <span className="font-mono text-slate-500">{formatMinimalId(recommendedSupplierId)}</span>
            </p>
          </div>
          <UrgencyBadge urgency={urgencyLevel} />
        </div>

        {/* Quantities & Pricing Metrics in INR */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-md my-3 text-center">
          <div>
            <span className="block text-xs text-slate-500">Rec Qty</span>
            <span className="font-mono text-sm font-semibold text-slate-900">
              {recommendedQuantity}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Unit Cost</span>
            <span className="font-mono text-xs font-semibold text-slate-900">
              {formattedUnitCost}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-medium">Est Total</span>
            <span className="font-mono text-xs font-bold text-indigo-700">
              {formattedTotalCost}
            </span>
          </div>
        </div>

        {/* AI Insight Section (Reserved Violet Accent per FRONTEND-SPEC.md §1) */}
        {llmReasoning ? (
          <div className="bg-purple-50 border border-purple-200 text-purple-900 rounded-md p-3.5 my-2 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 font-semibold text-purple-900 text-xs">
                <svg
                  className="w-3.5 h-3.5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                AI Insight
              </span>
              <span className="text-[10px] font-mono font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {confidencePercentage}% confidence
              </span>
            </div>
            <p className="leading-relaxed text-purple-900">{llmReasoning}</p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-md p-3 my-2 text-xs text-center italic">
            <span className="inline-flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              AI insight unavailable
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
        {status !== 'DISMISSED' && onDismiss && (
          <button
            type="button"
            className="btn-secondary text-xs h-9 px-3"
            onClick={() => onDismiss(id)}
            disabled={isDismissing}
          >
            {isDismissing ? 'Dismissing...' : 'Dismiss'}
          </button>
        )}

        {status !== 'PO_CREATED' && onConvertToPO && (
          <button
            type="button"
            className="btn-primary text-xs h-9 px-3"
            onClick={() => onConvertToPO(recommendation)}
          >
            Convert to PO
          </button>
        )}

        {status === 'PO_CREATED' && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
            PO Created
          </span>
        )}

        {status === 'DISMISSED' && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Dismissed
          </span>
        )}
      </div>
    </div>
  );
}
