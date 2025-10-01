"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import DashboardCard from "@/components/dashboard/card"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Bullet } from "@/components/ui/bullet"

const securityStatusItemVariants = cva("border rounded-md ring-2 transition-all duration-200 hover-habitech", {
  variants: {
    variant: {
      success: "status-success-habitech border-success/20 ring-success/10",
      warning: "status-warning-habitech border-warning/20 ring-warning/10", 
      destructive: "status-error-habitech border-destructive/20 ring-destructive/10",
    },
  },
  defaultVariants: {
    variant: "success",
  },
})

interface SecurityStatusItemProps
  extends VariantProps<typeof securityStatusItemVariants> {
  title: string
  value: string
  status: string
  className?: string
}

function SecurityStatusItem({
  title,
  value,
  status,
  variant,
  className,
}: SecurityStatusItemProps) {
  return (
    <div className={cn(securityStatusItemVariants({ variant }), className)}>
      <div className="flex items-center gap-2 py-1 px-2 border-b border-current">
        <Bullet size="sm" variant={variant} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="py-1 px-2.5">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-50">{status}</div>
      </div>
    </div>
  )
}

interface SecurityData {
  camaras: {
    operativas: number
    total: number
    porcentaje: number
    estado: string
  }
  controlAcceso: {
    operativas: number
    total: number
    porcentaje: number
    estado: string
  }
  sensoresHumo: {
    problemas: number
    estado: string
    mensaje: string
  }
  incidentesRecientes: {
    total: number
    ultimasHoras: number
  }
}

export default function SecurityStatus() {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const response = await fetch("/api/dashboard/security")
        const data = await response.json()
        setSecurityData(data)
      } catch (error) {
        console.error("Error fetching security data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSecurity()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchSecurity, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <DashboardCard
        title="SECURITY STATUS"
        intent="success"
        addon={<Badge variant="outline-success">ONLINE</Badge>}
      >
        <div className="flex flex-col">
          <div className="grid grid-cols-1 gap-4 py-2 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-muted h-20 rounded" />
            ))}
          </div>
        </div>
      </DashboardCard>
    )
  }

  if (!securityData) {
    return (
      <DashboardCard
        title="SECURITY STATUS"
        intent="default"
        addon={<Badge variant="outline-warning">ERROR</Badge>}
      >
        <div className="text-center py-8 text-muted-foreground">
          Error al cargar datos de seguridad
        </div>
      </DashboardCard>
    )
  }

  const isOnline = 
    securityData.camaras.porcentaje === 100 && 
    securityData.controlAcceso.porcentaje === 100 && 
    securityData.sensoresHumo.problemas === 0

  return (
    <DashboardCard
      title="SECURITY STATUS"
      intent={isOnline ? "success" : "default"}
      addon={<Badge variant={isOnline ? "outline-success" : "outline-warning"}>{isOnline ? "ONLINE" : "REVISAR"}</Badge>}
    >
      <div className="flex flex-col">
        <div className="max-md:order-1 grid grid-cols-3 md:grid-cols-1 gap-4 py-2 px-1 md:max-w-max">
          <div className="widget-container">
            <SecurityStatusItem
              title="CÁMARAS SEGURIDAD"
              value={`${securityData.camaras.operativas}/${securityData.camaras.total}`}
              status={`[${securityData.camaras.estado}]`}
              variant={securityData.camaras.porcentaje === 100 ? "success" : "warning"}
            />
          </div>
          <div className="widget-container">
            <SecurityStatusItem
              title="CONTROL ACCESO"
              value={`${securityData.controlAcceso.porcentaje}%`}
              status={`[${securityData.controlAcceso.estado}]`}
              variant={securityData.controlAcceso.porcentaje === 100 ? "success" : "warning"}
            />
          </div>
          <div className="widget-container">
            <SecurityStatusItem
              title="SENSORES HUMO"
              value={securityData.sensoresHumo.problemas.toString()}
              status={`[${securityData.sensoresHumo.estado}]`}
              variant={securityData.sensoresHumo.problemas === 0 ? "success" : "destructive"}
            />
          </div>
        </div>
        <picture className="md:absolute md:top-0 md:right-0 w-full md:w-auto md:h-full aspect-square min-[2160px]:right-[10%] flex items-center justify-center">
          <div className="gif-container blueprint-background relative w-full h-full flex items-center justify-center border border-white/20 dark:border-white/30">
            <Image
              src="/assets/bot_greenprint.gif"
              alt="Security Status"
              width={1000}
              height={1000}
              quality={90}
              className="blueprint-image size-full object-contain drop-shadow-lg relative z-10"
            />
          </div>
        </picture>
      </div>
    </DashboardCard>
  )
}
