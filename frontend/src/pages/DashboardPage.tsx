import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Vulnerability {
  id: number;
  name: string;
  description: string;
  severity: string;
  status: string;
  reported_at: string;
}

export function DashboardPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const navigate = useNavigate();

  const fetchVulnerabilities = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/vulnerabilities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVulnerabilities(response.data);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this vulnerability?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/vulnerabilities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchVulnerabilities(); // Refresh the list
      } catch (error) {
        console.error("Error deleting vulnerability:", error);
        alert("Failed to delete vulnerability. Only admins can delete.");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Vulnerability Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={() => navigate("/vulnerabilities/new")}>Add New</Button>
          <Button onClick={() => navigate("/users")}>Manage Users</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vulnerabilities.map((vuln) => (
            <TableRow key={vuln.id}>
              <TableCell className="font-medium">{vuln.name}</TableCell>
              <TableCell>{vuln.description}</TableCell>
              <TableCell>{vuln.severity}</TableCell>
              <TableCell>{vuln.status}</TableCell>
              <TableCell>{new Date(vuln.reported_at).toLocaleString()}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/vulnerabilities/${vuln.id}/edit`)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(vuln.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
