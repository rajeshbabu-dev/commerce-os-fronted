/* =============================================================================
   CommerceOS — Recommendation List Page
   =============================================================================
   Displays AI purchase recommendations, summary statistics,
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
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

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
    { label: 'Critical Urgency', value: criticalCount, color: 'text-rose-600' },
    { label: 'Est Total Spend', value: formattedSpend, color: 'text-primary-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.label} className="text-center py-4">
          <p className={`text-2xl font-semibold font-mono ${card.color}`}>
            {card.value}
          </p>
          <p className="text-xs text-slate-500 mt-1">{card.label}</p>
        </Card>
      ))}
    </div>
  );
}

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
      <PageHeader
        title="Purchase Recommendations"
        subtitle="AI-generated reorder suggestions based on safety stock and lead times"
        badge={<Badge variant="ai">Claude Intelligence</Badge>}
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
            Loading recommendations...
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            Failed to load recommendations. Please try again.
          </div>
        </Card>
      )}

      {/* Content Loaded */}
      {!isLoading && !error && recommendations && (
        <>
          {/* Summary Cards */}
          <SummaryCards recommendations={recommendations} />

          {/* Status Filter Tabs */}
          <div className="flex border-b border-slate-200/80 mb-6 gap-2">
            {tabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2 px-3.5 font-semibold text-xs rounded-t-md transition-all ${
                    isActive
                      ? 'border-b-2 border-primary-600 text-primary-700 bg-primary-50/50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
            <Card className="text-center py-12 text-slate-500 text-sm">
              No recommendations found for status &quot;{selectedStatus}&quot;.
            </Card>
          )}
        </>
      )}
    </div>
  );
}
