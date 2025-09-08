"use client"

import { useState } from 'react'
import { useHabiTechContract } from '@/hooks/use-habitech-contract'
import { useAuth } from '@/lib/auth-context-simple-fixed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminGuard } from '@/components/role-guard'
import { Settings, Users, Plus, List, CheckCircle } from 'lucide-react'

export default function ContractAdmin() {
  const { contract, isContractConnected } = useHabiTechContract()
  const { userAddress, isAdmin } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newUserAddress, setNewUserAddress] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [userType, setUserType] = useState<'admin' | 'resident'>('resident')

  const loadContractData = async () => {
    if (!contract || !isContractConnected) return
    
    setLoading(true)
    try {
      // Obtener estadísticas
      const contractStats = await contract.read.getStats()
      setStats({
        totalAdmins: contractStats[0].toString(),
        totalResidents: contractStats[1].toString()
      })

      // Obtener listas de usuarios
      const [admins, residents] = await Promise.all([
        contract.read.getAllAdmins(),
        contract.read.getAllResidents()
      ])

      const allUsers = []
      
      // Agregar admins
      for (const admin of admins) {
        try {
          const name = await contract.read.getUserName([admin as `0x${string}`])
          allUsers.push({ address: admin, name, type: 'admin' })
        } catch (error) {
          allUsers.push({ address: admin, name: 'Error', type: 'admin' })
        }
      }

      // Agregar residentes
      for (const resident of residents) {
        try {
          const name = await contract.read.getUserName([resident as `0x${string}`])
          allUsers.push({ address: resident, name, type: 'resident' })
        } catch (error) {
          allUsers.push({ address: resident, name: 'Error', type: 'resident' })
        }
      }

      setUsers(allUsers)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const testContractFunctions = async () => {
    if (!contract || !userAddress) return

    console.log('🧪 Probando funciones del contrato...')
    console.log('📍 Contrato:', contract.address)
    console.log('👤 Tu dirección:', userAddress)

    try {
      // Probar verificación de roles
      const isAdminCheck = await contract.read.isActiveAdmin([userAddress as `0x${string}`])
      const isResidentCheck = await contract.read.isActiveResident([userAddress as `0x${string}`])
      
      console.log('🔑 isActiveAdmin:', isAdminCheck)
      console.log('🏠 isActiveResident:', isResidentCheck)

      // Obtener nombre
      const userName = await contract.read.getUserName([userAddress as `0x${string}`])
      console.log('📝 getUserName:', userName)

      // Obtener estadísticas
      const stats = await contract.read.getStats()
      console.log('📊 getStats:', {
        admins: stats[0].toString(),
        residents: stats[1].toString()
      })

      console.log('✅ Todas las funciones funcionan correctamente!')

    } catch (error) {
      console.error('❌ Error probando funciones:', error)
    }
  }

  if (!isContractConnected) {
    return (
      <AdminGuard>
        <div className="p-6">
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertDescription>
              Contrato no conectado. Verifica la dirección en .env.local
            </AlertDescription>
          </Alert>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Administración del Contrato</h1>
        </div>

        {/* Panel de verificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Verificación del Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dirección del contrato:</p>
                <p className="font-mono text-sm break-all">0x0032163d341903eC6e38A6f4dFEc8aEe7861cd58</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado:</p>
                <p className="text-green-600 font-medium">✅ Conectado</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={loadContractData} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar Datos'}
              </Button>
              <Button variant="outline" onClick={testContractFunctions}>
                Probar Funciones
              </Button>
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{stats.totalAdmins}</p>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{stats.totalResidents}</p>
                  <p className="text-sm text-muted-foreground">Residentes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        {users.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Usuarios Registrados ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{user.address}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.type === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.type === 'admin' ? 'Admin' : 'Residente'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nota sobre agregar usuarios */}
        <Alert>
          <AlertDescription>
            <strong>Para agregar usuarios:</strong> Usa herramientas como Remix, Etherscan, o la consola del navegador.
            El contrato tiene las funciones <code>addAdmin(address, name)</code> y <code>addResident(address, name)</code>.
          </AlertDescription>
        </Alert>
      </div>
    </AdminGuard>
  )
}
