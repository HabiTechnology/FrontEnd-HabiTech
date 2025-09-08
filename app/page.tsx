import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import DashboardChart from "@/components/dashboard/chart"
import RebelsRanking from "@/components/dashboard/rebels-ranking"
import SecurityStatus from "@/components/dashboard/security-status"
import { RoleGuard } from "@/components/role-guard"
import BracketsIcon from "@/components/icons/brackets"
import GearIcon from "@/components/icons/gear"
import ProcessorIcon from "@/components/icons/proccesor"
import BoomIcon from "@/components/icons/boom"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"

const mockData = mockDataJson as MockData

// Icon mapping
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
}

export default function DashboardOverview() {
  return (
    <RoleGuard allowedRoles={['admin', 'resident']}>
      <DashboardPageLayout
        header={{
          title: "Panel de Control - Edificio Inteligente",
          description: "Última actualización 12:05",
          icon: BracketsIcon,
        }}
      >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0">
        {mockData.dashboardStats.map((stat, index) => (
          <div key={index} className="grid-item">
            <DashboardStat
              label={stat.label}
              value={stat.value}
              description={stat.description}
              icon={iconMap[stat.icon as keyof typeof iconMap]}
              tag={stat.tag}
              intent={stat.intent}
              direction={stat.direction}
            />
          </div>
        ))}
      </div>

      <div className="mb-0 section-separator">
        <DashboardChart />
      </div>

      {/* Main 2-column grid section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="content-panel">
          <RebelsRanking rebels={mockData.rebelsRanking} />
        </div>
        <div className="content-panel">
          <SecurityStatus statuses={mockData.securityStatus} />
        </div>
      </div>
    </DashboardPageLayout>
    </RoleGuard>
  )
}
