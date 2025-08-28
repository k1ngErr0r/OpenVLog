import { type ColumnDef, type CellContext } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { UserRow } from '@/types';

interface Options {
  onDelete: (id: number) => void;
}

export function useUserColumns({ onDelete }: Options): ColumnDef<UserRow>[] {
  return [
    { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'is_admin', header: 'Role', cell: ({ row }: CellContext<UserRow, unknown>) => {
        const isAdmin = row.getValue('is_admin') as boolean;
        return <Badge variant={isAdmin ? 'destructive' : 'secondary'}>{isAdmin ? 'Admin' : 'User'}</Badge>;
      }
    },
  { id: 'actions', cell: ({ row }: CellContext<UserRow, unknown>) => {
        const user = row.original as UserRow;
        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete the user.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(user.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      }
    },
  ];
}
