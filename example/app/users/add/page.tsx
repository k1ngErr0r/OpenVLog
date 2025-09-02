import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AddUserForm } from "@/components/add-user-form"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AddUserPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Add New User</h1>
              <p className="text-muted-foreground">Create a new user account for your security team</p>
            </div>
            <AddUserForm />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
