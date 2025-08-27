import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VulnerabilityDataTable } from "@/components/VulnerabilityDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

  const handleDelete = async (id: number) => {
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
  };

  const columns: ColumnDef<Vulnerability>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        const variant = {
          Critical: "destructive",
          High: "destructive",
          Medium: "secondary",
          Low: "outline",
          Informational: "outline",
        }[severity] as "destructive" | "secondary" | "outline" | "default" | null | undefined;
        return <Badge variant={variant}>{severity}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge>{status}</Badge>;
      }
    },
    {
      accessorKey: "reported_at",
      header: "Reported At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("reported_at") as string);
        return date.toLocaleString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vulnerability = row.original;
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/vulnerabilities/${vulnerability.id}/edit`)}
            >
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    vulnerability.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(vulnerability.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

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
