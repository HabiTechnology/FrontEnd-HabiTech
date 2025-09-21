"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import BellIcon from "@/components/icons/bell"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import FloatingElement from "@/components/animations/floating-element"

// Lazy load notifications component
const Notifications = dynamic(() => import("@/components/dashboard/notifications"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full animate-pulse bg-muted rounded" />
})

const mockData = mockDataJson as MockData

export default function NotificacionesPage() {
  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Centro de Notificaciones",
          description: "Gestión y seguimiento de notificaciones del edificio",
          icon: BellIcon,
        }}
      >
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(4)].map((_, i) => {
            const positions = [
              { top: '12%', left: '15%' },
              { top: '35%', right: '10%' },
              { bottom: '40%', left: '8%' },
              { bottom: '20%', right: '12%' }
            ];
            
            return (
              <FloatingElement key={i} intensity={4} duration={3500 + (i * 300)}>
                <div
                  className="absolute w-12 h-12 bg-orange-500/10 dark:bg-orange-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            );
          })}
        </div>

        <div className="relative z-1">
          {/* Main Notifications Component */}
          <StaggerAnimation delay={300} staggerDelay={0}>
            <div className="content-panel h-full group hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
              <Notifications initialNotifications={mockData.notifications} />
            </div>
          </StaggerAnimation>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
