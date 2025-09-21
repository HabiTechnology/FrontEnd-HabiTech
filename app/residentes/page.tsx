"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import { ResidentesStats } from "@/components/residentes"
import UsersIcon from "@/components/icons/users"

// Lazy load the heavy table component
const ResidentesTable = dynamic(() => import("@/components/residentes/residentes-table"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted rounded" />
})

export default function ResidentesPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Gestión de Residentes",
        description: "Administración y seguimiento de residentes del edificio",
        icon: UsersIcon,
      }}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0">
        <ResidentesStats />
      </div>

      {/* Main Table */}
      <div className="content-panel">
        <ResidentesTable />
      </div>
    </DashboardPageLayout>
  )
}
