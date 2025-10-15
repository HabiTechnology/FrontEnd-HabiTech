"use client"

import DashboardPageLayout from "@/components/dashboard/layout"
import SolicitudesRentaTable from "@/components/solicitudes/solicitudes-renta-table"
import ProcessorIcon from "@/components/icons/proccesor"
import { PageTransition } from "@/components/animations/page-transition"
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
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(4)].map((_, i) => {
            const positions = [
              { top: '10%', left: '12%' },
              { top: '30%', right: '8%' },
              { bottom: '35%', left: '5%' },
              { bottom: '15%', right: '15%' }
            ]
            
            return (
              <FloatingElement key={i} intensity={4} duration={3500 + (i * 300)}>
                <div
                  className="absolute w-12 h-12 bg-purple-500/10 dark:bg-purple-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            )
          })}
        </div>

        <div className="relative z-1">
          <SolicitudesRentaTable />
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
