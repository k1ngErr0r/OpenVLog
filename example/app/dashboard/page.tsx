import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardStats } from "@/components/dashboard-stats"
import { VulnerabilityCharts } from "@/components/vulnerability-charts"
import { RecentActivity } from "@/components/recent-activity"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Security Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage your organization's vulnerability landscape</p>
            </div>

            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VulnerabilityCharts />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
