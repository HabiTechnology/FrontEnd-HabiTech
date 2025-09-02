import DashboardStat from "@/components/dashboard/stat"
import { mockResidenteStats } from "@/data/residentes-mock"
import UsersIcon from "@/components/icons/users"
import ProcessorIcon from "@/components/icons/proccesor"
import GearIcon from "@/components/icons/gear"
import BoomIcon from "@/components/icons/boom"

export default function ResidentesStats() {
  const stats = [
    {
      label: "TOTAL RESIDENTES",
      value: mockResidenteStats.totalResidentes.toString(),
      description: "Residentes registrados",
      icon: UsersIcon,
      tag: "TOTAL",
      intent: "positive" as const,
      direction: "up" as const,
    },
    {
      label: "NUEVOS ESTE MES",
      value: mockResidenteStats.nuevosEsteMes.toString(),
      description: "Registros recientes",
      icon: BoomIcon,
      tag: "SEPTIEMBRE",
      intent: "positive" as const,
      direction: "up" as const,
    },
    {
      label: "OCUPACIÓN",
      value: `${mockResidenteStats.ocupacionPromedio}%`,
      description: "Promedio del edificio",
      icon: ProcessorIcon,
      tag: "PROMEDIO",
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
