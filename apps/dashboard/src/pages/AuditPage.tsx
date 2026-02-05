import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '@hummbl/ui';
import { useAuditLog, useAuditActions } from '@/hooks/useGovernance';
import { type AuditLogOptions } from '@/lib/governance-mock';
import { formatDistanceToNow, format } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Filter,
} from 'lucide-react';

const PAGE_SIZE = 10;

export const AuditPage: React.FC = () => {
  const [filters, setFilters] = React.useState<AuditLogOptions>({
    limit: PAGE_SIZE,
    offset: 0,
  });

  const [showFilters, setShowFilters] = React.useState(false);
  const [localStartDate, setLocalStartDate] = React.useState('');
  const [localEndDate, setLocalEndDate] = React.useState('');

  const { data, isLoading } = useAuditLog(filters);
  const { data: availableActions } = useAuditActions();

  const events = data?.events || [];
  const total = data?.total || 0;
  const currentPage = Math.floor((filters.offset || 0) / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      offset: (newPage - 1) * PAGE_SIZE,
    }));
  };

  const handleApplyFilters = () => {
    setFilters(prev => ({
      ...prev,
      offset: 0,
      startDate: localStartDate || undefined,
      endDate: localEndDate ? `${localEndDate}T23:59:59Z` : undefined,
    }));
  };

  const handleClearFilters = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setFilters({
      limit: PAGE_SIZE,
      offset: 0,
    });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'Sequence',
      'Timestamp',
      'Action',
      'Decision',
      'Agent',
      'Session',
      'State',
      'Reason',
    ];
    const rows = events.map(e => [
      e.sequence,
      e.timestamp,
      e.action,
      e.decision,
      e.agent_id,
      e.session_id,
      e.temporal_state,
      e.reason || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'allow':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'deny':
        return <XCircle className="h-4 w-4 text-rose-400" />;
      case 'require_approval':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return null;
    }
  };

  const getDecisionBadge = (decision: string) => {
    const styles = {
      allow: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      deny: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      require_approval: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return styles[decision as keyof typeof styles] || 'bg-zinc-500/10 text-zinc-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Audit Log</h2>
          <p className="text-zinc-500">View governance decisions and state changes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={localStartDate}
                  onChange={e => setLocalStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={localEndDate}
                  onChange={e => setLocalEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision">Decision</Label>
                <select
                  id="decision"
                  className="w-full h-10 px-3 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100"
                  value={filters.decision || ''}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      offset: 0,
                      decision: (e.target.value as AuditLogOptions['decision']) || undefined,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                  <option value="require_approval">Require Approval</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <select
                  id="action"
                  className="w-full h-10 px-3 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100"
                  value={filters.action || ''}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      offset: 0,
                      action: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">All</option>
                  {availableActions?.map(action => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            {total} events {filters.decision || filters.action ? '(filtered)' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">No events found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">#</th>
                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Time</th>
                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Action</th>
                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Decision</th>
                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Agent</th>
                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">State</th>
                    <th className="text-left py-3 px-2 text-zinc-400 font-medium">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-2 font-mono text-zinc-500">{event.sequence}</td>
                      <td className="py-3 px-2">
                        <span className="text-zinc-300" title={event.timestamp}>
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <code className="px-2 py-1 rounded bg-zinc-800 text-zinc-200">
                          {event.action}
                        </code>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs ${getDecisionBadge(event.decision)}`}
                        >
                          {getDecisionIcon(event.decision)}
                          {event.decision}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-zinc-400">{event.agent_id}</td>
                      <td className="py-3 px-2">
                        <span className="text-zinc-400 capitalize">{event.temporal_state}</span>
                      </td>
                      <td className="py-3 px-2">
                        <code className="text-zinc-500 text-xs" title={event.hash}>
                          {event.hash.substring(0, 8)}...
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
              <span className="text-sm text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
