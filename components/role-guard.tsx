"use client"

import { useAuth } from '@/lib/auth-context-simple-fixed'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, AlertTriangle, Lock } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'resident')[]
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles = ['admin', 'resident'],
  fallbackPath = '/login' 
}: RoleGuardProps) {
  const { 
    isAuthenticated, 
    userRole, 
    loading, 
    error,
    isAdmin,
    isResident,
    isUnauthorized 
  } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(fallbackPath)
    }
  }, [loading, isAuthenticated, router, fallbackPath])

  // Mostrar cargando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Verificando acceso...</h3>
              <p className="text-sm text-muted-foreground">
                Consultando roles en blockchain
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <Lock className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Acceso requerido</h3>
              <p className="text-sm text-muted-foreground">
                Redirigiendo al login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error de autenticaciÃ³n
  if (error || userRole === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-8">
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                Error al verificar acceso: {error || 'Error desconocido'}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-primary hover:underline"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No autorizado
  if (isUnauthorized || !allowedRoles.includes(userRole as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <Shield className="h-12 w-12 text-yellow-500" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">
                Acceso no autorizado
              </h3>
              <p className="text-sm text-muted-foreground">
                Tu wallet no tiene permisos para acceder a esta secciÃ³n.
              </p>
              <p className="text-xs text-muted-foreground">
                Rol actual: {userRole || 'No definido'}
                <br />
                Roles requeridos: {allowedRoles.join(', ')}
              </p>
            </div>
            <button 
              onClick={() => router.push('/login')}
              className="text-sm text-primary hover:underline"
            >
              Volver al login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Usuario autorizado - mostrar contenido
  return <>{children}</>
}

// Componente especÃ­fico para admins
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      {children}
    </RoleGuard>
  )
}

// Componente para mostrar informaciÃ³n de role en desarrollo
export function RoleDebugInfo() {
  const { userRole, userInfo, isAdmin, isResident, isUnauthorized, isContractConnected } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') return null

  const contractAddress = process.env.NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT
  const isUsingContract = isContractConnected && contractAddress !== "0x0000000000000000000000000000000000000000"

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-black/90 text-white text-xs rounded-lg z-50 max-w-xs">
      <div className="font-bold mb-2">ðŸ” Debug Info</div>
      
      {/* Estado del Contrato */}
      <div className="mb-2 border-b border-gray-600 pb-2">
        <div className="font-semibold">ðŸ“‹ Contrato:</div>
        <div>Conectado: {isContractConnected ? 'âœ…' : 'âŒ'}</div>
        <div>Modo: {isUsingContract ? 'ðŸ”— Blockchain' : 'ðŸŽ­ Demo'}</div>
        {contractAddress && (
          <div>Addr: {contractAddress.slice(0, 8)}...</div>
        )}
      </div>

      {/* Estado del Usuario */}
      <div>
        <div className="font-semibold">ðŸ‘¤ Usuario:</div>
        <div>Role: {userRole || 'none'}</div>
        <div>Admin: {isAdmin ? 'âœ…' : 'âŒ'}</div>
        <div>Resident: {isResident ? 'âœ…' : 'âŒ'}</div>
        <div>Unauthorized: {isUnauthorized ? 'âŒ' : 'âœ…'}</div>
        {userInfo && <div>Wallet: {userInfo.wallet?.slice(0, 6)}...</div>}
      </div>
    </div>
  )
}
