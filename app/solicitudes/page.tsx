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
    <DashboardPageLayout
      header={{
        title: "Gestión de Solicitudes de Renta",
        description: "Revisar, aprobar o rechazar solicitudes de apartamentos",
        icon: ProcessorIcon,
      }}
    >
      {/* Header con botón de nueva solicitud */}
      <div className="flex justify-end mb-6">
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Simular Nueva Solicitud
            </Button>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-0">
        <SolicitudesStats />
      </div>

      {/* Main Table */}
      <div className="content-panel">
        <SolicitudesTable />
      </div>
    </DashboardPageLayout>
  )
}
