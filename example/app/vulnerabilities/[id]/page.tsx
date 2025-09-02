import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { VulnerabilityDetail } from "@/components/vulnerability-detail"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function VulnerabilityDetailPage({ params }: { params: { id: string } }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <VulnerabilityDetail vulnerabilityId={params.id} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
