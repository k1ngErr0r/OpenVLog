import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AddVulnerabilityForm } from "@/components/add-vulnerability-form"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AddVulnerabilityPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Add New Vulnerability</h1>
              <p className="text-muted-foreground">Report a new security vulnerability to the system</p>
            </div>
            <AddVulnerabilityForm />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
