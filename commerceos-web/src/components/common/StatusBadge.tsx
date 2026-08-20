import React from 'react';
import Badge from '../ui/Badge';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase();

  const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'ai'; label: string }> = {
    // Inventory
    HEALTHY: { variant: 'success', label: 'Healthy' },
    LOW_STOCK: { variant: 'warning', label: 'Low Stock' },
    OUT_OF_STOCK: { variant: 'danger', label: 'Out of Stock' },

    // Purchase Order & Approval
    DRAFT: { variant: 'neutral', label: 'Draft' },
    PENDING_APPROVAL: { variant: 'warning', label: 'Pending Approval' },
    PENDING: { variant: 'warning', label: 'Pending' },
    APPROVED: { variant: 'success', label: 'Approved' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    ORDERED: { variant: 'info', label: 'Ordered' },
    FULFILLED: { variant: 'success', label: 'Fulfilled' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },

    // Recommendation
    GENERATED: { variant: 'ai', label: 'AI Generated' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    DISMISSED: { variant: 'neutral', label: 'Dismissed' },

    // IAM / Roles / General
    ACTIVE: { variant: 'success', label: 'Active' },
    INACTIVE: { variant: 'neutral', label: 'Inactive' },
    ADMIN: { variant: 'ai', label: 'Admin' },
    PROCUREMENT_MANAGER: { variant: 'info', label: 'Procurement Mgr' },
    OPS_EXECUTIVE: { variant: 'neutral', label: 'Ops Executive' },
    VIEWER: { variant: 'neutral', label: 'Viewer' },
  };

  const current = config[normalized] || { variant: 'neutral', label: status };

  return (
    <Badge variant={current.variant} dot className={className}>
      {current.label}
    </Badge>
  );
};

export default StatusBadge;
