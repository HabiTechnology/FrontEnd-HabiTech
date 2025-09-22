"use client"

import DashboardPageLayout from "@/components/dashboard/layout"
import SolicitudesRentaTable from "@/components/solicitudes/solicitudes-renta-table"
import ProcessorIcon from "@/components/icons/proccesor"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import FloatingElement from "@/components/animations/floating-element"

export default function SolicitudesPage() {
  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Gestión de Solicitudes de Renta",
          description: "Revisar, aprobar o rechazar solicitudes de apartamentos",
          icon: ProcessorIcon,
        }}
      >
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(3)].map((_, i) => {
            const positions = [
              { top: '20%', right: '12%' },
              { top: '40%', left: '8%' },
              { bottom: '25%', right: '5%' }
            ];
            
            return (
              <FloatingElement key={i} intensity={6} duration={2800 + (i * 400)}>
                <div
                  className="absolute w-18 h-18 bg-purple-500/10 dark:bg-purple-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            );
          })}
        </div>

        <div className="relative z-1">
          <StaggerAnimation delay={200} staggerDelay={0}>
            <div className="content-panel group hover:shadow-lg transition-all duration-300">
              <SolicitudesRentaTable />
            </div>
          </StaggerAnimation>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
