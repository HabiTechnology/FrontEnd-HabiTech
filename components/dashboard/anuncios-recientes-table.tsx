"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"

interface Anuncio {
  id: number
  titulo: string
  contenido: string
  tipo: string
  prioridad: string
  fecha_publicacion: string
  activo: boolean
  autor: string
}

export function AnunciosRecientesTable() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/anuncios-recientes")
        const result = await response.json()
        setAnuncios(result.data || [])
      } catch (error) {
        console.error("Error fetching anuncios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 120000) // 2 min
    return () => clearInterval(interval)
  }, [])

  const getPrioridadBadge = (prioridad: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      alta: "destructive",
      media: "default",
      baja: "secondary"
    }
    return variants[prioridad] || "outline"
  }

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      mantenimiento: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      evento: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      emergencia: "bg-red-500/10 text-red-500 border-red-500/20"
    }
    return colors[tipo] || ""
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anuncios Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Anuncios Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anuncios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay anuncios recientes
                  </TableCell>
                </TableRow>
              ) : (
                anuncios.map((anuncio) => (
                  <TableRow key={anuncio.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{anuncio.titulo}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {anuncio.contenido}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTipoBadge(anuncio.tipo)}>
                        {anuncio.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPrioridadBadge(anuncio.prioridad)}>
                        {anuncio.prioridad}
                      </Badge>
                    </TableCell>
                    <TableCell>{anuncio.autor}</TableCell>
                    <TableCell>
                      {new Date(anuncio.fecha_publicacion).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={anuncio.activo ? "default" : "secondary"}>
                        {anuncio.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
