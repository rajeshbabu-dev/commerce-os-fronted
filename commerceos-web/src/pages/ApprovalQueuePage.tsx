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

// ---------------------------------------------------------------------------
// Decision Modal
// ---------------------------------------------------------------------------

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Review Approval</h3>
          <p className="text-sm text-slate-500 mt-1">
            PO: <span className="font-mono">{approval.entityId.slice(0, 8)}...</span>
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add feedback or reason..."
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDecide('REQUEST_CHANGES', comment)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors disabled:opacity-50"
          >
            Request Changes
          </button>
          <button
            onClick={() => onDecide('REJECT', comment)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => onDecide('APPROVE', comment)}
            disabled={isPending || isSelfApproval}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
            title={isSelfApproval ? 'Self-approval forbidden. Another manager must review this PO.' : 'Approve this PO'}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Approval Card
// ---------------------------------------------------------------------------

function ApprovalCard({
  approval,
  currentUserId,
  onReview,
}: {
  approval: ApprovalRequestResponse;
  currentUserId: string | undefined;
  onReview: (approval: ApprovalRequestResponse) => void;
}) {
  const isSelfApproval = currentUserId === approval.submittedBy;

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {approval.entityType.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {approval.entityId.slice(0, 8)}...
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          PENDING
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Submitted by</span>
          <span className="text-slate-700 font-mono">
            {approval.submitterName ?? approval.submittedBy.slice(0, 8) + '...'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Assigned to</span>
          <span className="text-slate-700">{approval.assignedRole}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Created</span>
          <span className="text-slate-700">
            {new Date(approval.createdAt).toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>

      {isSelfApproval && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 mb-4">
          <p className="text-xs text-red-700 font-medium">
            ⚠ Self-approval forbidden. Another manager must review this PO.
          </p>
        </div>
      )}

      <button
        onClick={() => onReview(approval)}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Review
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
      { id: selectedApproval.id, decision: { action, comment } },
      {
        onSuccess: () => {
          setSelectedApproval(null);
        },
      },
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Approval Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and approve purchase orders pending your decision
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="card text-center py-16">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading pending approvals...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card">
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              Failed to load approvals. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && approvals && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card text-center py-4">
              <p className="text-2xl font-semibold font-mono text-amber-600">
                {approvals.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Pending Approvals</p>
            </div>
            <div className="card text-center py-4">
              <p className="text-2xl font-semibold font-mono text-red-600">
                {approvals.filter((a) => a.submittedBy === user?.id).length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Cannot Self-Approve</p>
            </div>
            <div className="card text-center py-4">
              <p className="text-2xl font-semibold font-mono text-slate-900">
                {approvals.length - approvals.filter((a) => a.submittedBy === user?.id).length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Ready for Review</p>
            </div>
          </div>

          {/* Approval Cards Grid */}
          {approvals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  currentUserId={user?.id}
                  onReview={setSelectedApproval}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-sm text-slate-500">
                No pending approvals. All caught up! 🎉
              </p>
            </div>
          )}
        </>
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
