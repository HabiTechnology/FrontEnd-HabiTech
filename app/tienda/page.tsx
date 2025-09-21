"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import { TiendaStats } from "@/components/tienda"
import ShoppingCartIcon from "@/components/icons/shopping-cart"

// Lazy load the catalog component
const TiendaCatalogo = dynamic(() => import("@/components/tienda/tienda-catalogo"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted rounded" />
})

export default function TiendaPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Gestión de Inventario",
        description: "Administra el stock del edificio con HabiCoins",
        icon: ShoppingCartIcon,
      }}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-0">
        <TiendaStats />
      </div>

      {/* Main Catalog */}
      <div className="content-panel">
        <TiendaCatalogo />
      </div>
    </DashboardPageLayout>
  )
}
