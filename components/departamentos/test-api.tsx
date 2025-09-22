"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function TestDepartamentosAPI() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formularioSimple, setFormularioSimple] = useState({
    numero: "TEST-001",
    piso: 1,
    dormitorios: 2,
    banos: 1,
    renta_mensual: 500000,
    mantenimiento_mensual: 50000,
    estado: "disponible",
    descripcion: "Departamento de prueba"
  })

  const probarConexion = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/departamentos/test')
      const data = await response.json()
      setResultado(data)
    } catch (error) {
      setResultado({
        status: 'error',
        error: 'Error de conexión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  const probarCreacion = async () => {
    setLoading(true)
    try {
      console.log('🧪 Probando creación con datos:', formularioSimple)
      
      const response = await fetch('/api/departamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formularioSimple)
      })

      const data = await response.json()
      
      setResultado({
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        data: data
      })
      
    } catch (error) {
      setResultado({
        status: 'error',
        error: 'Error en creación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Test - API Departamentos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test de Conexión */}
        <Card>
          <CardHeader>
            <CardTitle>1. Test de Conexión</CardTitle>
            <CardDescription>
              Verifica la conexión con la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={probarConexion} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </Button>
          </CardContent>
        </Card>

        {/* Test de Creación */}
        <Card>
          <CardHeader>
            <CardTitle>2. Test de Creación</CardTitle>
            <CardDescription>
              Prueba crear un departamento simple
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formularioSimple.numero}
                  onChange={(e) => setFormularioSimple(prev => ({
                    ...prev,
                    numero: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="piso">Piso</Label>
                <Input
                  id="piso"
                  type="number"
                  value={formularioSimple.piso}
                  onChange={(e) => setFormularioSimple(prev => ({
                    ...prev,
                    piso: parseInt(e.target.value) || 1
                  }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="renta">Renta</Label>
                <Input
                  id="renta"
                  type="number"
                  value={formularioSimple.renta_mensual}
                  onChange={(e) => setFormularioSimple(prev => ({
                    ...prev,
                    renta_mensual: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="mantenimiento">Mantenimiento</Label>
                <Input
                  id="mantenimiento"
                  type="number"
                  value={formularioSimple.mantenimiento_mensual}
                  onChange={(e) => setFormularioSimple(prev => ({
                    ...prev,
                    mantenimiento_mensual: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            </div>

            <Button 
              onClick={probarCreacion} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creando...' : 'Crear Departamento'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {resultado && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resultado.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={resultado.status === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(resultado, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}