/* =============================================================================
   CommerceOS — Approval Queue Page
   ============================================================================= */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  usePendingApprovalsQuery,
  useDecideApprovalMutation,
} from '../hooks/useApprovalQuery';
import type { ApprovalRequestResponse } from '../api/workflow';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import { AlertCircle } from 'lucide-react';

function DecisionModal({
  approval,
  currentUserId,
  onClose,
  onDecide,
  isPending,
}: {
  approval: ApprovalRequestResponse;
  currentUserId: string | undefined;
  onClose: () => void;
  onDecide: (action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', comment: string) => void;
  isPending: boolean;
}) {
  const [comment, setComment] = useState('');
  const isSelfApproval = currentUserId === approval.submittedBy;

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Review Approval"
      description={`PO: ${approval.entityId.slice(0, 8)}...`}
    >
      <div className="space-y-4">
        {isSelfApproval && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Self-approval policy warning: You submitted this request. Approving your own request may violate separation of duties.
            </span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="input-field h-auto py-2"
            placeholder="Add feedback or reason..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <button
            onClick={() => onDecide('REQUEST_CHANGES', comment)}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors disabled:opacity-50"
          >
            Request Changes
          </button>
          <button
            onClick={() => onDecide('REJECT', comment)}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => onDecide('APPROVE', comment)}
            disabled={isPending || isSelfApproval}
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default function ApprovalQueuePage() {
  const { user } = useAuth();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequestResponse | null>(null);

  const { data: pagedData, isLoading, error } = usePendingApprovalsQuery();
  const approvals = pagedData?.content ?? [];

  const decideMutation = useDecideApprovalMutation();

  const handleDecide = (
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    comment: string,
  ) => {
    if (!selectedApproval) return;
    decideMutation.mutate(
      {
        id: selectedApproval.id,
        decision: { action, comment: comment || undefined },
      },
      { onSuccess: () => setSelectedApproval(null) },
    );
  };

  const selfCount = approvals.filter((a) => a.submittedBy === user?.id).length;
  const readyCount = approvals.filter((a) => a.submittedBy !== user?.id).length;

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Approval Queue"
        subtitle="Review, authorize, or reject pending operational purchase orders"
        badge={<Badge variant="warning">{approvals.length} Pending</Badge>}
      />

      {/* Loading State */}
      {isLoading && (
        <Card className="text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading pending approvals...
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            Failed to load approvals. Please try again.
          </div>
        </Card>
      )}

      {/* Data Loaded */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center py-4">
              <p className="text-2xl font-semibold font-mono text-slate-900">{approvals.length}</p>
              <p className="text-xs text-slate-500 mt-1">Pending Approvals</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-semibold font-mono text-amber-600">{selfCount}</p>
              <p className="text-xs text-slate-500 mt-1">Cannot Self-Approve</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-semibold font-mono text-emerald-600">{readyCount}</p>
              <p className="text-xs text-slate-500 mt-1">Ready for Review</p>
            </Card>
          </div>

          {/* Approvals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvals.map((item) => {
              const isSelf = user?.id === item.submittedBy;
              return (
                <Card key={item.id} className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-primary-600 font-mono uppercase tracking-wider">
                        {item.entityType.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="warning">{item.status}</Badge>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        <span className="text-slate-400">Request ID:</span>{' '}
                        <span className="font-mono text-slate-900">{item.id.slice(0, 8)}...</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Entity:</span>{' '}
                        <span className="font-mono text-slate-900">{item.entityId.slice(0, 8)}...</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Submitted by:</span>{' '}
                        <span className="font-mono text-slate-700">{item.submitterName || item.submittedBy.slice(0, 8)}</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Assigned Role:</span>{' '}
                        <span className="font-medium text-slate-900">{item.assignedRole}</span>
                      </p>
                    </div>

                    {isSelf && (
                      <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                        ⚠ Self-approval forbidden. Another manager must review this PO.
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedApproval(item)}
                    >
                      Review
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {approvals.length === 0 && (
            <Card className="text-center py-12 text-slate-500 text-sm">
              No pending approvals. All caught up! 🎉
            </Card>
          )}
        </div>
      )}

      {/* Decision Modal */}
      {selectedApproval && (
        <DecisionModal
          approval={selectedApproval}
          currentUserId={user?.id}
          onClose={() => setSelectedApproval(null)}
          onDecide={handleDecide}
          isPending={decideMutation.isPending}
        />
      )}
    </div>
  );
}
