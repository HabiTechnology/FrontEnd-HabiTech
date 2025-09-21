"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { 
  SolicitudesTable, 
  SolicitudesStats
} from "@/components/solicitudes"
import NuevaSolicitudForm from "@/components/solicitudes/nueva-solicitud-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import ProcessorIcon from "@/components/icons/proccesor"
import { mockSolicitudes } from "@/data/solicitudes-mock"
import { SolicitudRenta } from "@/types/solicitudes"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import AnimatedButton from "@/components/animations/animated-button"
import FloatingElement from "@/components/animations/floating-element"

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes)
  const [showNewForm, setShowNewForm] = useState(false)

  const handleNewSolicitud = (nuevaSolicitud: Omit<SolicitudRenta, 'id_solicitud'>) => {
    const maxId = Math.max(...solicitudes.map(s => s.id_solicitud))
    const solicitudCompleta: SolicitudRenta = {
      ...nuevaSolicitud,
      id_solicitud: maxId + 1,
      departamento_solicitado: nuevaSolicitud.departamento_solicitado || "Cualquiera"
    }
    
    setSolicitudes(prev => [solicitudCompleta, ...prev])
    setShowNewForm(false)
    
    // Simular notificación de nueva solicitud
    setTimeout(() => {
      alert(`✅ Nueva solicitud recibida de ${nuevaSolicitud.nombre} ${nuevaSolicitud.apellidoPaterno}`)
    }, 500)
  }

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
          {/* Header con botón de nueva solicitud */}
          <StaggerAnimation delay={100} staggerDelay={0}>
            <div className="flex justify-end mb-6">
              <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
                <DialogTrigger asChild>
                  <AnimatedButton variant="hover">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Simular Nueva Solicitud
                    </Button>
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nueva Solicitud de Renta</DialogTitle>
                    <DialogDescription>
                      Simula una solicitud enviada por un interesado en rentar un departamento
                    </DialogDescription>
                  </DialogHeader>
                  <NuevaSolicitudForm onSubmit={handleNewSolicitud} />
                </DialogContent>
              </Dialog>
            </div>
          </StaggerAnimation>

          {/* Statistics Cards */}
          <StaggerAnimation delay={200} staggerDelay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SolicitudesStats />
            </div>
          </StaggerAnimation>

          {/* Main Table */}
          <StaggerAnimation delay={400} staggerDelay={0}>
            <div className="content-panel group hover:shadow-lg transition-all duration-300">
              <SolicitudesTable />
            </div>
          </StaggerAnimation>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
