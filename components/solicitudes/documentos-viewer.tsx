"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Eye, Phone, Mail, Building, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { DocumentoAdjunto, ReferenciaContacto } from "@/types/solicitudes"

interface DocumentosViewerProps {
  documentos?: DocumentoAdjunto[]
  referencias?: ReferenciaContacto[]
}

export default function DocumentosViewer({ documentos = [], referencias = [] }: DocumentosViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentoAdjunto | null>(null)
  const [showDocViewer, setShowDocViewer] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTipoDocumento = (tipo: DocumentoAdjunto["tipo"]) => {
    const tipos = {
      "INE": "IdentificaciÃ³n Oficial",
      "Comprobante_Ingresos": "Comprobante de Ingresos",
      "Referencias_Laborales": "Referencias Laborales",
      "Comprobante_Domicilio": "Comprobante de Domicilio",
      "Estados_Cuenta": "Estados de Cuenta",
      "Otros": "Otros Documentos"
    }
    return tipos[tipo] || tipo
  }

  const getRelacionColor = (relacion: ReferenciaContacto["relacion"]) => {
    switch (relacion) {
      case "Laboral": return "bg-blue-100 text-blue-800 border-blue-200"
      case "Personal": return "bg-green-100 text-green-800 border-green-200"
      case "Familiar": return "bg-purple-100 text-purple-800 border-purple-200"
      case "Bancaria": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openDocViewer = (doc: DocumentoAdjunto) => {
    setSelectedDoc(doc)
    setShowDocViewer(true)
  }

  const downloadDoc = (doc: DocumentoAdjunto) => {
    // Simular descarga
    alert(`Descargando: ${doc.nombre}`)
  }

  return (
    <div className="space-y-6">
      {/* SecciÃ³n de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Adjuntos ({documentos.length})
          </CardTitle>
          <CardDescription>
            Documentos subidos por el solicitante para verificaciÃ³n
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos adjuntos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documentos.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{doc.nombre}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getTipoDocumento(doc.tipo)}</span>
                        <span>â€¢</span>
                        <span>{formatFileSize(doc.tamaÃ±o)}</span>
                        <span>â€¢</span>
                        <span>{doc.fecha_subida}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={doc.verificado ? "outline" : "secondary"}
                        className={doc.verificado ? "text-green-600 border-green-600" : "text-yellow-600 border-yellow-600"}
                      >
                        {doc.verificado ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendiente
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDocViewer(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDoc(doc)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SecciÃ³n de Referencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Referencias de Contacto ({referencias.length})
          </CardTitle>
          <CardDescription>
            Personas de referencia proporcionadas por el solicitante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referencias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay referencias de contacto</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referencias.map((ref) => (
                <div key={ref.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{ref.nombre}</h4>
                        <Badge className={getRelacionColor(ref.relacion)}>
                          {ref.relacion}
                        </Badge>
                        <Badge 
                          variant={ref.verificado ? "outline" : "secondary"}
                          className={ref.verificado ? "text-green-600 border-green-600" : "text-gray-600 border-gray-600"}
                        >
                          {ref.verificado ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificado
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Sin verificar
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{ref.telefono}</span>
                        </div>
                        {ref.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{ref.email}</span>
                          </div>
                        )}
                        {ref.empresa && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{ref.empresa}</span>
                          </div>
                        )}
                        {ref.fecha_verificacion && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Verificado: {ref.fecha_verificacion}</span>
                          </div>
                        )}
                      </div>
                      
                      {ref.comentarios && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium">Comentarios: </span>
                          {ref.comentarios}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visor de PDF Modal */}
      <Dialog open={showDocViewer} onOpenChange={setShowDocViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDoc?.nombre}
            </DialogTitle>
            <DialogDescription>
              {selectedDoc && getTipoDocumento(selectedDoc.tipo)} - {selectedDoc && formatFileSize(selectedDoc.tamaÃ±o)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
            {selectedDoc ? (
              <div className="text-center space-y-4">
                <FileText className="h-24 w-24 mx-auto text-red-500" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Vista Previa de PDF</h3>
                  <p className="text-muted-foreground mb-4">
                    SimulaciÃ³n de documento: {selectedDoc.nombre}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Tipo:</strong> {getTipoDocumento(selectedDoc.tipo)}</p>
                    <p><strong>TamaÃ±o:</strong> {formatFileSize(selectedDoc.tamaÃ±o)}</p>
                    <p><strong>Subido:</strong> {selectedDoc.fecha_subida}</p>
                    <p><strong>Estado:</strong> 
                      <Badge className={selectedDoc.verificado ? "ml-2 text-green-600 border-green-600" : "ml-2 text-yellow-600 border-yellow-600"}>
                        {selectedDoc.verificado ? "Verificado" : "Pendiente de verificaciÃ³n"}
                      </Badge>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    * Esta es una simulaciÃ³n. En un sistema real aquÃ­ se mostrarÃ­a el PDF real.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => downloadDoc(selectedDoc)}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button variant="outline" onClick={() => setShowDocViewer(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            ) : (
              <p>No se pudo cargar el documento</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
