import { useEffect, useState, lazy, Suspense } from "react";
import { useApiWithToasts } from '@/lib/http';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isAdmin } from '@/lib/auth';
const VulnerabilityDataTable = lazy(() => import('@/components/VulnerabilityDataTable').then(m => ({ default: m.VulnerabilityDataTable })));
import { useVulnerabilityColumns } from '@/hooks/useVulnerabilityColumns';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from "@/components/ui/spinner";
import type { Vulnerability } from '@/types';
const DashboardStats = lazy(() => import('@/components/DashboardStats').then(m => ({ default: m.DashboardStats })));
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export function DashboardPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [severity, setSeverity] = useState<string | undefined>(searchParams.get('severity') || undefined);
  const [status, setStatus] = useState<string | undefined>(searchParams.get('status') || undefined);
  const [sort, setSort] = useState(searchParams.get('sort') || 'reported_at:DESC');
  const initialDateFrom = searchParams.get('dateFrom');
  const initialDateTo = searchParams.get('dateTo');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialDateFrom ? new Date(initialDateFrom) : undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(initialDateTo ? new Date(initialDateTo) : undefined);
  const navigate = useNavigate();
  const toast = useToast().push;
  const api = useApiWithToasts();

  const syncQuery = (overrides: Record<string, any> = {}) => {
    const q: Record<string,string> = {};
    const effective = {
      page,
      pageSize,
      search: search.trim(),
      severity,
      status,
      sort,
      dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
      dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
      ...overrides,
    };
    Object.entries(effective).forEach(([k,v]) => {
      if (v === undefined || v === '' || v === null) return;
      q[k] = String(v);
    });
    setSearchParams(q, { replace: true });
  };

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
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/vulnerabilities/${id}`);
      fetchVulnerabilities();
      toast.success('Vulnerability deleted.');
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
      toast.error('Failed to delete vulnerability. Only admins can delete.');
    }
  };

  const columns = useVulnerabilityColumns({ onDelete: handleDelete });

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
    syncQuery({ page:1, search:undefined, severity:undefined, status:undefined, sort:'reported_at:DESC', dateFrom: undefined, dateTo: undefined });
  };

  const changePage = (next: number) => {
    setPage(next);
    syncQuery({ page: next });
  };

  const pageCount = Math.ceil(total / pageSize) || 1;

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    if (sort) params.append('sort', sort);
    if (dateFrom) params.append('dateFrom', format(dateFrom, 'yyyy-MM-dd'));
    if (dateTo) params.append('dateTo', format(dateTo, 'yyyy-MM-dd'));

    const url = `/api/vulnerabilities/export?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {isAdmin() && <Button onClick={() => navigate("/vulnerabilities/new")}>Add New</Button>}
      </div>

      <Suspense fallback={<div className="h-24 flex items-center justify-center"><Spinner /></div>}>
        <DashboardStats />
      </Suspense>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vulnerability Overview</h2>
        <div className="p-4 border rounded-lg mb-4">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-4">
                <label className="block text-sm font-medium mb-1">Search</label>
                <Input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') applyFilters(); }} placeholder="Search name or description" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <Select value={severity} onValueChange={(v)=>{ setSeverity(v==='__all' ? undefined : v); }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all">All</SelectItem>
                    {['Critical','High','Medium','Low','Informational'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={status} onValueChange={(v)=>{ setStatus(v==='__all' ? undefined : v); }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all">All</SelectItem>
                    {['Open','In Progress','Resolved','Closed'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="ghost" onClick={clearFilters}>Reset</Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button onClick={handleExportCsv}>Export CSV</Button>
          </div>
        </div>
        {loading ? (
          <div role="status" aria-busy="true" className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <Suspense fallback={<div className="py-10 flex justify-center"><Spinner /></div>}>
            <div>
              <VulnerabilityDataTable
                // cast due to lazy import generic inference limitation
                columns={columns as any}
                data={vulnerabilities as any}
              />
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <div>Page {page} of {pageCount} • {total} total</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>changePage(page-1)}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={page>=pageCount} onClick={()=>changePage(page+1)}>Next</Button>
                </div>
              </div>
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}
