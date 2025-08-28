import { useEffect, useState } from "react";
import api, { useApiWithToasts } from '@/lib/http';
import { useNavigate } from "react-router-dom";
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
import { useToast } from '@/components/ui/toast';
import { Spinner } from "@/components/ui/spinner";

interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();
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
      push({ type: 'success', message: 'User deleted.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      push({ type: 'error', message: 'Failed to delete user.' });
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post('/api/users', newUser);
      fetchUsers();
      setNewUser({ username: '', password: '' });
      push({ type: 'success', message: 'User added.' });
    } catch (error) {
      console.error('Error adding user:', error);
      push({ type: 'error', message: 'Failed to add user.' });
    }
  };

  const columns = useUserColumns({ onDelete: handleDelete });

  if (loading) {
    return <div role="status" aria-busy="true" className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
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
              <Button type="submit" onClick={handleAddUser}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <UserDataTable
        columns={columns}
        data={users}
      />
    </div>
  );
}
