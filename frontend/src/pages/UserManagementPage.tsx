import { useEffect, useState } from "react";
import { useApiWithToasts } from '@/lib/http';
import { Button } from "@/components/ui/button";
import { UserDataTable } from "@/components/UserDataTable";
import { useUserColumns } from '@/hooks/useUserColumns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/PageHeader";

interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast().push;
  const [dialogOpen, setDialogOpen] = useState(false);
  const api = useApiWithToasts();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/users/${id}`);
      fetchUsers();
      toast.success('User deleted.');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.');
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post('/api/users', newUser);
      await fetchUsers();
      setNewUser({ username: '', password: '' });
      toast.success('User added.');
    } catch (error: any) {
      console.error('Error adding user:', error);
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('Forbidden: admin role required.');
      } else if (status === 409) {
        toast.error('Username already exists.');
      } else {
        toast.error('Failed to add user.');
      }
    }
  };

  const columns = useUserColumns({ onDelete: handleDelete });

  if (loading) {
    return <div role="status" aria-busy="true" className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Create, review and manage application user accounts and roles."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>Add User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" aria-describedby="add-user-desc">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription id="add-user-desc">
                  Create a new user. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={async () => { await handleAddUser(); setDialogOpen(false); }}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <UserDataTable
        columns={columns}
        data={users}
      />
    </div>
  );
}
