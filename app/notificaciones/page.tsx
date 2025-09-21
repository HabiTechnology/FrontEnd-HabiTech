"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import BellIcon from "@/components/icons/bell"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"

// Lazy load notifications component
const Notifications = dynamic(() => import("@/components/dashboard/notifications"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full animate-pulse bg-muted rounded" />
})

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
