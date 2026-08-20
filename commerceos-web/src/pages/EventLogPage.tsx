/* =============================================================================
   CommerceOS — Domain Event Log Explorer
   =============================================================================
   Admin-facing explorer for analytics.domain_event_log with type filter,
   pagination, and CSV bulk export.
   ============================================================================= */

import { useState } from 'react';
import { useDomainEventsQuery } from '../hooks/useAnalyticsQuery';
import { exportDomainEvents } from '../api/analytics';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const EVENT_TYPES = [
  { value: 'ALL', label: 'All events' },
  { value: 'inventory.low-stock-detected', label: 'Low Stock Detected' },
  { value: 'recommendation.generated', label: 'Recommendation Generated' },
  { value: 'procurement.po-created', label: 'PO Created' },
  { value: 'workflow.approval-decided', label: 'Approval Decided' },
];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function EventLogPage() {
  const [eventType, setEventType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, isLoading, error } = useDomainEventsQuery({
    eventType: eventType === 'ALL' ? undefined : eventType,
    page,
  });

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportDomainEvents(eventType === 'ALL' ? undefined : eventType);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `domain-events-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function changeEventType(value: string) {
    setEventType(value);
    setPage(0);
  }

  const totalPages = data?.totalPages ?? 0;
  const canExport = Boolean(data && data.totalElements > 0);

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Domain Event Log"
        subtitle="Every published domain event, captured by the analytics module (30-day retention)"
        badge={<Badge variant="neutral">Audit Stream</Badge>}
        actions={
          <button
            onClick={handleExport}
            disabled={exporting || !canExport}
            className="btn-secondary"
            data-testid="export-csv"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        }
      />

      {/* Filter bar */}
      <Card className="p-4 mb-6 flex items-center gap-3">
        <label htmlFor="event-type-filter" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Event type
        </label>
        <select
          id="event-type-filter"
          value={eventType}
          onChange={(e) => changeEventType(e.target.value)}
          className="input-field max-w-xs"
          data-testid="event-type-filter"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500 font-mono ml-auto" data-testid="total-events">
          {data ? `${data.totalElements} event(s)` : ''}
        </span>
      </Card>

      {exportError && (
        <Card className="bg-rose-50 text-rose-700 p-4 mb-6 border border-rose-200" data-testid="export-error">
          {exportError}
        </Card>
      )}

      {isLoading && <p className="text-sm text-slate-500">Loading events...</p>}

      {error && !isLoading && (
        <Card className="bg-rose-50 text-rose-700 p-4 border border-rose-200">
          Failed to load events. Please try again.
        </Card>
      )}

      {data && !isLoading && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Event type</th>
                  <th className="px-4 py-3">Exchange</th>
                  <th className="px-4 py-3">Product / Entity</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Occurred at</th>
                  <th className="px-4 py-3">Correlation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No events found.
                    </td>
                  </tr>
                )}
                {data.content.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors" data-testid="event-row">
                    <td className="px-4 py-3 font-mono text-xs text-slate-900 font-medium">
                      {event.eventType}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {event.sourceExchange ?? '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      <div>P: {event.productId ? event.productId.slice(0, 8) + '...' : '-'}</div>
                      <div>E: {event.entityId ? event.entityId.slice(0, 8) + '...' : '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-700">
                      {event.amount != null
                        ? `₹${new Intl.NumberFormat('en-IN').format(event.amount)}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {event.decision ? <Badge variant="neutral">{event.decision}</Badge> : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {formatTimestamp(event.occurredAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {event.correlationId ? `${event.correlationId.slice(0, 8)}...` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {data.page + 1} of {Math.max(totalPages, 1)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={data.first}
                className="btn-ghost text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.last}
                className="btn-ghost text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
