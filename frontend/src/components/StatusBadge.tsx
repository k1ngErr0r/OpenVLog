import { Badge } from '@/components/ui/badge';

// Future: map statuses to variants or colors
const statusVariantMap: Record<string, string> = {
  Open: 'default',
  'In Progress': 'secondary',
  Resolved: 'outline',
  Closed: 'outline',
};

export interface StatusBadgeProps { status: string; }
export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusVariantMap[status] as any;
  return <Badge variant={variant}>{status}</Badge>;
}
