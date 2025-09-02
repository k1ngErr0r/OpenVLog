import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { VulnerabilityList } from "@/components/vulnerability-list"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function VulnerabilitiesPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Vulnerabilities</h1>
              <p className="text-muted-foreground">
                Manage and track security vulnerabilities across your organization
              </p>
            </div>
            <VulnerabilityList />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
