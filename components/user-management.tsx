"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context-simple-fixed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminGuard } from '@/components/role-guard'
import { Users, UserPlus, Shield, AlertCircle } from 'lucide-react'

export function UserManagement() {
  const [newUserAddress, setNewUserAddress] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [userType, setUserType] = useState<'admin' | 'resident'>('resident')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleAddUser = async () => {
    if (!newUserAddress || !newUserName) {
      setMessage({ type: 'error', text: 'Dirección y nombre son requeridos' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Aquí irían las funciones del contrato para agregar usuarios
      // Por ahora solo mostramos el mensaje de que se agregaría
      console.log(`Agregando ${userType}:`, { address: newUserAddress, name: newUserName })
      
      setMessage({ 
        type: 'success', 
        text: `${userType === 'admin' ? 'Administrador' : 'Residente'} agregado exitosamente` 
      })
      
      // Limpiar formulario
      setNewUserAddress('')
      setNewUserName('')
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error agregando usuario' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Agregar Nuevo Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert className={message.type === 'error' ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-50'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className={message.type === 'error' ? 'text-destructive' : 'text-green-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección de Wallet</Label>
                <Input
                  id="address"
                  placeholder="0x..."
                  value={newUserAddress}
                  onChange={(e) => setNewUserAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre del usuario"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Usuario</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="resident"
                    checked={userType === 'resident'}
                    onChange={(e) => setUserType(e.target.value as 'resident')}
                    className="text-primary"
                  />
                  <span>Residente</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="admin"
                    checked={userType === 'admin'}
                    onChange={(e) => setUserType(e.target.value as 'admin')}
                    className="text-primary"
                  />
                  <span>Administrador</span>
                </label>
              </div>
            </div>

            <Button 
              onClick={handleAddUser} 
              disabled={isLoading || !newUserAddress || !newUserName}
              className="w-full"
            >
              {isLoading ? 'Agregando...' : `Agregar ${userType === 'admin' ? 'Administrador' : 'Residente'}`}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Lista de usuarios disponible después del deploy del contrato</p>
              <p className="text-sm">Usa las funciones getAllAdmins() y getAllResidents()</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
