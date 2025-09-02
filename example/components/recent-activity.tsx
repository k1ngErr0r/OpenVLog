import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "vulnerability_added",
    title: "SQL Injection vulnerability detected",
    description: "Critical vulnerability found in user authentication module",
    severity: "Critical",
    time: "2 hours ago",
    user: "Security Scanner",
  },
  {
    id: 2,
    type: "vulnerability_resolved",
    title: "XSS vulnerability resolved",
    description: "Cross-site scripting issue in contact form has been patched",
    severity: "High",
    time: "4 hours ago",
    user: "John Doe",
  },
  {
    id: 3,
    type: "user_added",
    title: "New user added to system",
    description: "Sarah Johnson has been granted analyst access",
    severity: "Info",
    time: "6 hours ago",
    user: "Admin",
  },
  {
    id: 4,
    type: "vulnerability_updated",
    title: "CSRF vulnerability status updated",
    description: "Moved to in-progress status with assigned developer",
    severity: "Medium",
    time: "8 hours ago",
    user: "Mike Wilson",
  },
  {
    id: 5,
    type: "scan_completed",
    title: "Weekly security scan completed",
    description: "Automated scan found 3 new vulnerabilities",
    severity: "Info",
    time: "1 day ago",
    user: "Security Scanner",
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "destructive"
    case "High":
      return "destructive"
    case "Medium":
      return "secondary"
    case "Low":
      return "outline"
    case "Info":
      return "outline"
    default:
      return "outline"
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "vulnerability_added":
      return (
        <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      )
    case "vulnerability_resolved":
      return (
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )
    case "user_added":
      return (
        <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )
    default:
      return (
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest security events and system updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <Badge variant={getSeverityColor(activity.severity)} className="ml-2 text-xs">
                    {activity.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
