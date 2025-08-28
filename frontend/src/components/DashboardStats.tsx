import { useEffect, useState } from 'react';
import { useApiWithToasts } from '@/lib/http';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Spinner } from '@/components/ui/spinner';
import { Link } from 'react-router-dom';

type SeverityKey = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
type StatusKey = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

const SEVERITY_COLORS: Record<SeverityKey, string> = {
  Critical: '#dc2626',
  High: '#f97316',
  Medium: '#facc15',
  Low: '#3b82f6',
  Informational: '#6b7280',
};

const STATUS_COLORS: Record<StatusKey, string> = {
  Open: '#3b82f6',
  'In Progress': '#f97316',
  Resolved: '#22c55e',
  Closed: '#6b7280',
};

interface StatsData {
  severities: Record<string, number>;
  statuses: Record<string, number>;
  recent: { id: number; name: string; reported_at: string }[];
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const api = useApiWithToasts();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/vulnerabilities/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (!stats) {
    return <p className="text-center text-red-500">Could not load statistics.</p>;
  }

  const severityData = Object.entries(stats.severities).map(([name, value]) => ({ name: name as SeverityKey, value }));
  const statusData = Object.entries(stats.statuses).map(([name, value]) => ({ name: name as StatusKey, value }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Vulnerabilities']} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500">No vulnerability data.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [value, 'Vulnerabilities']} />
                <Bar dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#82ca9d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500">No vulnerability data.</p>}
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Recent Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recent.length > 0 ? (
            <ul className="space-y-3">
              {stats.recent.map(vuln => (
                <li key={vuln.id} className="text-sm truncate">
                  <Link to={`/vulnerabilities/${vuln.id}`} className="hover:underline">
                    {vuln.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-center text-gray-500">No recent vulnerabilities.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
