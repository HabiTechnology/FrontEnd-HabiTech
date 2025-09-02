"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockResidentes } from "@/data/residentes-mock"
import type { Residente } from "@/types/residentes"
import { Bullet } from "@/components/ui/bullet"

const getStatusVariant = (estado: Residente["estado"]) => {
  switch (estado) {
    case "Activo":
      return "outline-success" as const
    case "Inactivo":
      return "secondary" as const
    case "Suspendido":
      return "outline-destructive" as const
    default:
      return "secondary" as const
  }
}

const getTipoColor = (tipo: Residente["tipo"]) => {
  switch (tipo) {
    case "Residente":
      return "primary"
    case "Visitante":
      return "warning"
    case "Personal":
      return "secondary"
    default:
      return "secondary"
  }
}

export default function ResidentesTable() {
  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="border-b border-border/30 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-card-foreground">
          <Bullet variant="default" />
          REGISTRO DE RESIDENTES
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline">
            Agregar Residente
          </Button>
          <Button size="sm" variant="outline">
            Exportar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto table-container">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Nombre Completo</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Teléfono</TableHead>
                <TableHead className="text-muted-foreground">Departamento</TableHead>
                <TableHead className="text-muted-foreground">Piso</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Fecha Registro</TableHead>
                <TableHead className="text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResidentes.map((residente) => (
                <TableRow 
                  key={residente.id_residente}
                  className="border-border/20 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    {residente.id_residente}
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {residente.nombre} {residente.apellidoPaterno}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {residente.apellidoMaterno}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.email}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.telefono}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {residente.departamento || "N/A"}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.piso || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${getTipoColor(residente.tipo) === "primary" ? "border-primary text-primary" : ""}
                        ${getTipoColor(residente.tipo) === "warning" ? "border-warning text-warning" : ""}
                        ${getTipoColor(residente.tipo) === "secondary" ? "border-muted-foreground text-muted-foreground" : ""}
                      `}
                    >
                      {residente.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(residente.estado)}>
                      {residente.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {new Date(residente.fechaRegistro).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
