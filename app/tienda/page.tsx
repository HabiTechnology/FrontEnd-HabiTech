import DashboardPageLayout from "@/components/dashboard/layout"
import { 
  TiendaStats, 
  TiendaCatalogo
} from "@/components/tienda"
import ShoppingCartIcon from "@/components/icons/shopping-cart"

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
