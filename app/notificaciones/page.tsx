import DashboardPageLayout from "@/components/dashboard/layout"
import Notifications from "@/components/dashboard/notifications"
import BellIcon from "@/components/icons/bell"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"

const mockData = mockDataJson as MockData

export default function NotificacionesPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Centro de Notificaciones",
        description: "Gestión y seguimiento de notificaciones del edificio",
        icon: BellIcon,
      }}
    >
      {/* Main Notifications Component */}
      <div className="content-panel h-full">
        <Notifications initialNotifications={mockData.notifications} />
      </div>
    </DashboardPageLayout>
  )
}
