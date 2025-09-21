"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import { ResidentesStats } from "@/components/residentes"
import UsersIcon from "@/components/icons/users"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import AnimatedButton from "@/components/animations/animated-button"
import FloatingElement from "@/components/animations/floating-element"

// Lazy load the heavy table component
const ResidentesTable = dynamic(() => import("@/components/residentes/residentes-table"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted rounded" />
})

export default function ResidentesPage() {
  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Gestión de Residentes",
          description: "Administración y seguimiento de residentes del edificio",
          icon: UsersIcon,
        }}
      >
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(3)].map((_, i) => {
            const positions = [
              { top: '15%', left: '10%' },
              { top: '30%', right: '15%' },
              { bottom: '20%', left: '5%' }
            ];
            
            return (
              <FloatingElement key={i} intensity={5} duration={2500 + (i * 400)}>
                <div
                  className="absolute w-16 h-16 bg-blue-500/10 dark:bg-blue-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            );
          })}
        </div>

        <div className="relative z-1">
          {/* Statistics Cards with Stagger Animation */}
          <StaggerAnimation delay={200} staggerDelay={120}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ResidentesStats />
            </div>
          </StaggerAnimation>

          {/* Main Table with Animation */}
          <StaggerAnimation delay={500} staggerDelay={0}>
            <div className="content-panel group hover:shadow-lg transition-all duration-300">
              <ResidentesTable />
            </div>
          </StaggerAnimation>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
