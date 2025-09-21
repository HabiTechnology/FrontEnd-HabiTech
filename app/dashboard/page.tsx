"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import { RoleGuard } from "@/components/role-guard"
import BracketsIcon from "@/components/icons/brackets"
import GearIcon from "@/components/icons/gear"
import ProcessorIcon from "@/components/icons/proccesor"
import BoomIcon from "@/components/icons/boom"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import AnimatedButton from "@/components/animations/animated-button"
import FloatingElement from "@/components/animations/floating-element"

// Lazy load heavy components
const DashboardChart = dynamic(() => import("@/components/dashboard/chart"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded mb-6" />
})

const RebelsRanking = dynamic(() => import("@/components/dashboard/rebels-ranking"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded" />
})

const SecurityStatus = dynamic(() => import("@/components/dashboard/security-status"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded" />
})

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
      <PageTransition>
        <DashboardPageLayout
          header={{
            title: "Panel de Control - Edificio Inteligente",
            description: "Última actualización 12:05",
            icon: BracketsIcon,
          }}
        >
          {/* Floating background elements */}
          <div className="fixed inset-0 pointer-events-none -z-10">
            {[...Array(4)].map((_, i) => {
              const positions = [
                { top: '10%', left: '5%' },
                { top: '20%', right: '10%' },
                { bottom: '30%', left: '8%' },
                { bottom: '15%', right: '5%' }
              ];
              
              return (
                <FloatingElement key={i} intensity={6} duration={3000 + (i * 500)}>
                  <div
                    className="absolute w-20 h-20 bg-primary/5 dark:bg-primary/10 rounded-full backdrop-blur-sm"
                    style={positions[i]}
                  />
                </FloatingElement>
              );
            })}
          </div>

          <div className="relative z-1">
            {/* Stats Grid with Stagger Animation */}
            <StaggerAnimation delay={200} staggerDelay={100}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {mockData.dashboardStats.map((stat, index) => (
                  <div key={index} className="grid-item">
                    <AnimatedButton variant="hover">
                      <DashboardStat
                        label={stat.label}
                        value={stat.value}
                        description={stat.description}
                        icon={iconMap[stat.icon as keyof typeof iconMap]}
                        tag={stat.tag}
                        intent={stat.intent}
                        direction={stat.direction}
                      />
                    </AnimatedButton>
                  </div>
                ))}
              </div>
            </StaggerAnimation>

            {/* Chart Section with Animation */}
            <StaggerAnimation delay={600} staggerDelay={0}>
              <div className="mb-8 section-separator">
                <DashboardChart />
              </div>
            </StaggerAnimation>

            {/* Main 2-column grid section with Stagger */}
            <StaggerAnimation delay={800} staggerDelay={200}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="content-panel">
                  <AnimatedButton variant="hover">
                    <RebelsRanking rebels={mockData.rebelsRanking} />
                  </AnimatedButton>
                </div>
                <div className="content-panel">
                  <AnimatedButton variant="hover">
                    <SecurityStatus statuses={mockData.securityStatus} />
                  </AnimatedButton>
                </div>
              </div>
            </StaggerAnimation>
          </div>
        </DashboardPageLayout>
      </PageTransition>
    </RoleGuard>
  )
}