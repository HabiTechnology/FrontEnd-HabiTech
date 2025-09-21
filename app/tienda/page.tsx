"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import { TiendaStats } from "@/components/tienda"
import ShoppingCartIcon from "@/components/icons/shopping-cart"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import AnimatedButton from "@/components/animations/animated-button"
import FloatingElement from "@/components/animations/floating-element"

// Lazy load the catalog component
const TiendaCatalogo = dynamic(() => import("@/components/tienda/tienda-catalogo"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted rounded" />
})

export default function TiendaPage() {
  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Gestión de Inventario",
          description: "Administra el stock del edificio con HabiCoins",
          icon: ShoppingCartIcon,
        }}
      >
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(4)].map((_, i) => {
            const positions = [
              { top: '10%', right: '8%' },
              { top: '25%', left: '12%' },
              { bottom: '30%', right: '10%' },
              { bottom: '15%', left: '8%' }
            ];
            
            return (
              <FloatingElement key={i} intensity={4} duration={3200 + (i * 300)}>
                <div
                  className="absolute w-14 h-14 bg-green-500/10 dark:bg-green-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            );
          })}
        </div>

        <div className="relative z-1">
          {/* Statistics Cards with Stagger Animation */}
          <StaggerAnimation delay={200} staggerDelay={150}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <TiendaStats />
            </div>
          </StaggerAnimation>

          {/* Main Catalog with Animation */}
          <StaggerAnimation delay={400} staggerDelay={0}>
            <div className="content-panel group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <TiendaCatalogo />
            </div>
          </StaggerAnimation>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
