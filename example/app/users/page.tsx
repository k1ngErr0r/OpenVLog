import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { UserManagement } from "@/components/user-management"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function UsersPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
              <p className="text-muted-foreground">
                Manage user accounts, roles, and permissions for your security team
              </p>
            </div>
            <UserManagement />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
