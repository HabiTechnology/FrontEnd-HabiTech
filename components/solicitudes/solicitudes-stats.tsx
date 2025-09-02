import DashboardStat from "@/components/dashboard/stat"
import { mockSolicitudStats } from "@/data/solicitudes-mock"
import UsersIcon from "@/components/icons/users"
import ProcessorIcon from "@/components/icons/proccesor"
import GearIcon from "@/components/icons/gear"
import BoomIcon from "@/components/icons/boom"

export default function SolicitudesStats() {
  const stats = [
    {
      label: "TOTAL SOLICITUDES",
      value: mockSolicitudStats.totalSolicitudes.toString(),
      description: "Solicitudes recibidas",
      icon: UsersIcon,
      tag: "TOTAL",
      intent: "neutral" as const,
      direction: "up" as const,
    },
    {
      label: "PENDIENTES",
      value: mockSolicitudStats.pendientes.toString(),
      description: "Esperando revisión",
      icon: ProcessorIcon,
      tag: "URGENTE",
      intent: "negative" as const,
      direction: "up" as const,
    },
    {
      label: "APROBADAS",
      value: mockSolicitudStats.aprobadas.toString(),
      description: "Solicitudes aceptadas",
      icon: BoomIcon,
      tag: "ESTE MES",
      intent: "positive" as const,
      direction: "up" as const,
    },
    {
      label: "COMPLETADAS",
      value: mockSolicitudStats.completadas.toString(),
      description: "Proceso finalizado",
      icon: GearIcon,
      tag: "FINALIZADAS",
      intent: "positive" as const,
      direction: "up" as const,
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="grid-item">
          <DashboardStat
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        </div>
      ))}
    </>
  );
}
