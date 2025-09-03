import { Badge } from '@/components/ui/badge';

const severityVariantMap: Record<string, string> = {
  Critical: 'destructive',
  High: 'destructive',
  Medium: 'secondary',
  Low: 'outline',
  Informational: 'outline',
};

export interface SeverityBadgeProps { severity: string; }
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const variant = severityVariantMap[severity] as any;
  return <Badge variant={variant}>{severity}</Badge>;
}
