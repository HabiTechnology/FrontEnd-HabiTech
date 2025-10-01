import DashboardStat from "@/components/dashboard/stat"
import { mockTiendaStats } from "@/data/tienda-mock"
import { DollarSign, Package, AlertTriangle } from "lucide-react"

export default function TiendaStats() {
  const stats = [
    {
      label: "PRODUCTOS EN STOCK",
      value: mockTiendaStats.totalProductos.toString(),
      description: "Inventario disponible",
      icon: Package,
      tag: "DISPONIBLE",
      intent: "neutral" as const,
      direction: "up" as const,
    },
    {
      label: "PRODUCTOS SIN STOCK",
      value: "8", // Productos que no estÃ¡n disponibles
      description: "Requieren reposiciÃ³n",
      icon: AlertTriangle,
      tag: "URGENTE",
      intent: "negative" as const,
      direction: "up" as const,
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <DashboardStat key={index} {...stat} />
      ))}
    </>
  );
}
