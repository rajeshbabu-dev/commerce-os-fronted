/* =============================================================================
   CommerceOS — Recommendation List Page
   =============================================================================
   Per TICKET-27: Displays AI purchase recommendations, summary statistics,
   status filters (All, Open, Dismissed), and recommendation cards with AI insights.
   ============================================================================= */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationCard from '../components/RecommendationCard';
import {
  useDismissRecommendationMutation,
  useRecommendationQuery,
} from '../hooks/useRecommendationQuery';
import type { PurchaseRecommendationResponse } from '../api/recommendation';

// ---------------------------------------------------------------------------
// Summary Cards Component
// ---------------------------------------------------------------------------

function SummaryCards({
  recommendations,
}: {
  recommendations: PurchaseRecommendationResponse[];
}) {
  const totalOpen = recommendations.filter((r) => r.status === 'OPEN').length;
  const criticalCount = recommendations.filter(
    (r) => r.urgencyLevel === 'CRITICAL' && r.status === 'OPEN',
  ).length;
  const estTotalSpend = recommendations
    .filter((r) => r.status === 'OPEN')
    .reduce((sum, r) => sum + (r.estimatedTotalCost || 0), 0);

  const formattedSpend = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(estTotalSpend);

  const cards = [
    { label: 'Total Open', value: totalOpen, color: 'text-slate-900' },
    { label: 'Critical Urgency', value: criticalCount, color: 'text-red-600' },
    { label: 'Est Total Spend', value: formattedSpend, color: 'text-indigo-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="card text-center py-4">
          <p className={`text-2xl font-semibold font-mono ${card.color}`}>
            {card.value}
          </p>
          <p className="text-xs text-slate-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RecommendationListPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const {
    data: pagedData,
    isLoading,
    error,
  } = useRecommendationQuery(selectedStatus === 'ALL' ? undefined : selectedStatus);
  const recommendations = pagedData?.content ?? [];

  const dismissMutation = useDismissRecommendationMutation();

  const handleDismiss = (id: string) => {
    dismissMutation.mutate(id);
  };

  const handleConvertToPO = (recommendation: PurchaseRecommendationResponse) => {
    navigate('/purchase-orders', { state: { recommendation } });
  };

  const filteredRecommendations = (recommendations ?? []).filter((rec) => {
    if (selectedStatus === 'ALL') return true;
    return rec.status === selectedStatus;
  });

  const tabs = [
    { key: 'ALL', label: 'All Recommendations' },
    { key: 'OPEN', label: 'Open' },
    { key: 'DISMISSED', label: 'Dismissed' },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Purchase Recommendations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          AI-generated reorder suggestions based on safety stock and lead times
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
            Loading recommendations...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card">
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              Failed to load recommendations. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Content Loaded */}
      {!isLoading && !error && recommendations && (
        <>
          {/* Summary Cards */}
          <SummaryCards recommendations={recommendations} />

          {/* Status Filter Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            {tabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2.5 px-4 font-medium text-sm border-b-2 transition-colors duration-150 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Recommendation Cards Grid */}
          {filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onDismiss={handleDismiss}
                  onConvertToPO={handleConvertToPO}
                  isDismissing={
                    dismissMutation.isPending && dismissMutation.variables === rec.id
                  }
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-sm text-slate-500">
                No recommendations found for status &quot;{selectedStatus}&quot;.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
