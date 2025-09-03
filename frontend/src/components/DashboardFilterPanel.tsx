import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterState {
  search: string;
  severity?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sort: string;
}

export interface DashboardFilterPanelProps extends FilterState {
  onChange: (next: Partial<FilterState>, applyImmediately?: boolean) => void;
  onApply: () => void;
  onClear: () => void;
  exporting: boolean;
  onExport: () => void;
}

export function DashboardFilterPanel(props: DashboardFilterPanelProps) {
  const { search, severity, status, dateFrom, dateTo, sort, onChange, onApply, onClear, exporting, onExport } = props;
  // local sort unused currently but kept for future enhancements
  const [localSort] = useState(sort);

  return (
    <div className="p-4 border rounded-lg mb-4">
      <div className="grid md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-4">
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input
            value={search}
            onChange={e => onChange({ search: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') onApply(); }}
            placeholder="Search name or description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Severity</label>
          <Select value={severity} onValueChange={v => onChange({ severity: v === '__all' ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All</SelectItem>
              {['Critical', 'High', 'Medium', 'Low', 'Informational'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select value={status} onValueChange={v => onChange({ status: v === '__all' ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All</SelectItem>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <SelectItem key={s} value={s}>
                {s}
              </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" /> {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateFrom} onSelect={(d) => onChange({ dateFrom: d })} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" /> {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateTo} onSelect={(d) => onChange({ dateTo: d })} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button variant="ghost" onClick={onClear}>Reset</Button>
        <Button onClick={onApply}>Apply Filters</Button>
        <Button onClick={onExport} disabled={exporting}>{exporting ? 'Exporting…' : 'Export CSV'}</Button>
      </div>
    </div>
  );
}

export default DashboardFilterPanel;