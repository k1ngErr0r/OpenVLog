import { useEffect, useState } from "react";
import { useApiWithToasts } from '@/lib/http';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VulnerabilityDataTable } from "@/components/VulnerabilityDataTable";
import { useVulnerabilityColumns } from '@/hooks/useVulnerabilityColumns';
import { useToast } from '@/components/ui/toast';
import { Spinner } from "@/components/ui/spinner";
import type { Vulnerability } from '@/types';

export function DashboardPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { push } = useToast();
  const api = useApiWithToasts();

  const fetchVulnerabilities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/vulnerabilities');
      setVulnerabilities(response.data);
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/vulnerabilities/${id}`);
      fetchVulnerabilities();
      push({ type: 'success', message: 'Vulnerability deleted.' });
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
      push({ type: 'error', message: 'Failed to delete vulnerability. Only admins can delete.' });
    }
  };

  const columns = useVulnerabilityColumns({ onDelete: handleDelete });

  if (loading) {
    return <div role="status" aria-busy="true" className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Vulnerability Dashboard</h1>
        <Button onClick={() => navigate("/vulnerabilities/new")}>Add New</Button>
      </div>
      <VulnerabilityDataTable
        columns={columns}
        data={vulnerabilities}
      />
    </div>
  );
}
