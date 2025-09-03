import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useApiWithToasts } from '@/lib/http';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { StatsSkeleton, TableSkeleton } from '@/components/skeletons';
import { Spinner } from '@/components/ui/spinner';
import { isAdmin } from '@/lib/auth';
import { useVulnerabilityColumns } from '@/hooks/useVulnerabilityColumns';
import type { Vulnerability } from '@/types';

// Lazy-loaded heavy components
const VulnerabilityDataTable = lazy(() => import('@/components/VulnerabilityDataTable').then(m => ({ default: m.VulnerabilityDataTable })));
const DashboardStats = lazy(() => import('@/components/DashboardStats').then(m => ({ default: m.DashboardStats })));
const DashboardFilterPanel = lazy(() => import('@/components/DashboardFilterPanel').then(m => ({ default: m.DashboardFilterPanel || m.default })));

export function DashboardPage() {
  // Navigation & utilities
  const navigate = useNavigate();
  const toast = useToast().push;
  const api = useApiWithToasts();

  // URL params
  const [searchParams, setSearchParams] = useSearchParams();

  // State derived from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [severity, setSeverity] = useState<string | undefined>(searchParams.get('severity') || undefined);
  const [status, setStatus] = useState<string | undefined>(searchParams.get('status') || undefined);
  const [sort, setSort] = useState(searchParams.get('sort') || 'reported_at:DESC');
  const initialDateFrom = searchParams.get('dateFrom');
  const initialDateTo = searchParams.get('dateTo');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialDateFrom ? new Date(initialDateFrom) : undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(initialDateTo ? new Date(initialDateTo) : undefined);

  // Pagination & data
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Keep query string in sync
  const syncQuery = (overrides: Record<string, any> = {}) => {
    const q: Record<string, string> = {};
    const effective = {
      page,
      pageSize,
      search: search.trim(),
      severity,
      status,
      sort,
      dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
      dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
      ...overrides
    };
    Object.entries(effective).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === null) return;
      q[k] = String(v);
    });
    setSearchParams(q, { replace: true });
  };

  // Fetch vulnerabilities when query params change
  const fetchVulnerabilities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/vulnerabilities', { params: Object.fromEntries(searchParams.entries()) });
      if (Array.isArray(response.data)) {
        setVulnerabilities(response.data);
        setTotal(response.data.length);
      } else {
        setVulnerabilities(response.data.data);
        setTotal(response.data.total);
        setPage(response.data.page);
        setPageSize(response.data.pageSize);
      }
    } catch (e) {
      console.error('Error fetching vulnerabilities:', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVulnerabilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Delete handler
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/vulnerabilities/${id}`);
      toast.success('Vulnerability deleted.');
      fetchVulnerabilities();
    } catch {
      toast.error('Failed to delete vulnerability. Only admins can delete.');
    }
  };

  const columns = useVulnerabilityColumns({ onDelete: handleDelete });

  // Filtering helpers
  const applyFilters = () => {
    setPage(1);
    syncQuery({ page: 1 });
  };
  const clearFilters = () => {
    setSearch('');
    setSeverity(undefined);
    setStatus(undefined);
    setSort('reported_at:DESC');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
    syncQuery({
      page: 1,
      search: undefined,
      severity: undefined,
      status: undefined,
      sort: 'reported_at:DESC',
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  const changePage = (next: number) => {
    setPage(next);
    syncQuery({ page: next });
  };
  const pageCount = Math.ceil(total / pageSize) || 1;

  // CSV Export
  const handleExportCsv = async () => {
    if (exporting) return;
    setExporting(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    if (sort) params.append('sort', sort);
    if (dateFrom) params.append('dateFrom', format(dateFrom, 'yyyy-MM-dd'));
    if (dateTo) params.append('dateTo', format(dateTo, 'yyyy-MM-dd'));
    try {
      const resp = await api.get('/api/vulnerabilities/export', {
        params: Object.fromEntries(params.entries()),
        responseType: 'blob'
      });
      const blob = new Blob([resp.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
      link.download = `vulnerabilities-${ts}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export ready.');
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of current reported vulnerabilities and their status across the system"
        actions={isAdmin() ? <Button size="sm" onClick={() => navigate('/vulnerabilities/new')}>Add New</Button> : null}
      />
      <div className="ov-panel-flat p-4 ov-animate-panel">
        <Suspense fallback={<StatsSkeleton />}>          
          <DashboardStats />
        </Suspense>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Vulnerability Overview</h2>
  <div className="ov-panel-flat p-4 mb-4 ov-animate-panel">
        <Suspense fallback={<div className="h-24 flex items-center justify-center"><Spinner /></div>}>
          <DashboardFilterPanel
            search={search}
            severity={severity}
            status={status}
            dateFrom={dateFrom}
            dateTo={dateTo}
            sort={sort}
            exporting={exporting}
            onExport={handleExportCsv}
            onApply={applyFilters}
            onClear={clearFilters}
            onChange={(next) => {
              if ('search' in next && typeof next.search === 'string') setSearch(next.search);
              if ('severity' in next) setSeverity(next.severity);
              if ('status' in next) setStatus(next.status);
              if ('dateFrom' in next) setDateFrom(next.dateFrom);
              if ('dateTo' in next) setDateTo(next.dateTo);
              if ('sort' in next && next.sort) setSort(next.sort);
            }}
          />
        </Suspense>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : (
          <Suspense fallback={<TableSkeleton />}>
            <div>
              <VulnerabilityDataTable columns={columns as any} data={vulnerabilities as any} />
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <div>
                  Page {page} of {pageCount} • {total} total
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => changePage(page - 1)}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => changePage(page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}

