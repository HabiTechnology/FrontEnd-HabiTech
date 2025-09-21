"use client"

import { useState } from 'react'
import { useHabiTechContract } from '@/hooks/use-habitech-contract'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminGuard } from '@/components/role-guard'
import { Settings, Users, Plus, List, CheckCircle } from 'lucide-react'
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth-integrated'
import React from 'react'
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import AnimatedButton from "@/components/animations/animated-button"
import FloatingElement from "@/components/animations/floating-element"

export default function ContractAdmin() {
  const { contract, isContractConnected, addAdmin, addResident, removeUser } = useHabiTechContract();
  const { userAddress, isAdmin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const loadContractData = async () => {
    if (!contract || !isContractConnected) return;
    setLoading(true);
    try {
      const contractStats = await contract.read.getStats();
      setStats({
        totalAdmins: contractStats[0].toString(),
        totalResidents: contractStats[1].toString(),
      });
      const [admins, residents] = await Promise.all([
        contract.read.getAllAdmins(),
        contract.read.getAllResidents(),
      ]);
      const allUsers = [];
      for (const admin of admins) {
        try {
          const name = await contract.read.getUserName([admin as `0x${string}`]);
          allUsers.push({ address: admin, name, type: 'admin' });
        } catch {
          allUsers.push({ address: admin, name: 'Error', type: 'admin' });
        }
      }
      for (const resident of residents) {
        try {
          const name = await contract.read.getUserName([resident as `0x${string}`]);
          allUsers.push({ address: resident, name, type: 'resident' });
        } catch {
          allUsers.push({ address: resident, name: 'Error', type: 'resident' });
        }
      }
      setUsers(allUsers);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const testContractFunctions = async () => {
    if (!contract || !userAddress) return;
    try {
      await contract.read.isActiveAdmin([userAddress as `0x${string}`]);
      await contract.read.isActiveResident([userAddress as `0x${string}`]);
      await contract.read.getUserName([userAddress as `0x${string}`]);
      await contract.read.getStats();
    } catch (error) {
      console.error('❌ Error probando funciones:', error);
    }
  };

  // Cargar datos al montar
  React.useEffect(() => {
    if (isContractConnected) loadContractData();
  }, [isContractConnected]);

  if (!isAdmin) {
    return (
      <AdminGuard>
        <div className="p-6">
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertDescription>
              Acceso solo para administradores.
            </AlertDescription>
          </Alert>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <PageTransition>
        <div className="space-y-6 p-6 relative">
          {/* Floating background elements */}
          <div className="fixed inset-0 pointer-events-none -z-10">
            {[...Array(3)].map((_, i) => {
              const positions = [
                { top: '18%', right: '15%' },
                { top: '45%', left: '10%' },
                { bottom: '25%', right: '8%' }
              ];
              
              return (
                <FloatingElement key={i} intensity={5} duration={2600 + (i * 500)}>
                  <div
                    className="absolute w-16 h-16 bg-red-500/10 dark:bg-red-400/15 rounded-full backdrop-blur-sm"
                    style={positions[i]}
                  />
                </FloatingElement>
              );
            })}
          </div>

          <div className="relative z-1">
            {/* Eliminada advertencia de red Sepolia */}
            <StaggerAnimation delay={200} staggerDelay={150}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Agregar Administrador
                    </CardTitle>
                  </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!isContractConnected) return alert('Debes conectar tu wallet');
                  if (!newUserAddress || !newUserName) return alert('Completa todos los campos');
                  setLoading(true);
                  try {
                    const tx = await addAdmin(newUserAddress, newUserName);
                    alert('Transacción enviada: ' + tx);
                    setNewUserAddress('');
                    setNewUserName('');
                    await loadContractData();
                  } catch (err: any) {
                    alert('Error: ' + (err?.message || err));
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div>
                  <Label htmlFor="admin-address">Dirección (wallet) del nuevo admin</Label>
                  <Input
                    id="admin-address"
                    type="text"
                    placeholder="0x..."
                    value={newUserAddress}
                    onChange={e => setNewUserAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admin-name">Nombre del nuevo admin</Label>
                  <Input
                    id="admin-name"
                    type="text"
                    placeholder="Nombre completo"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    required
                  />
                </div>
                <AnimatedButton variant="hover">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Agregando...' : 'Agregar Admin'}
                  </Button>
                </AnimatedButton>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Residente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!isContractConnected) return alert('Debes conectar tu wallet');
                  if (!newUserAddress || !newUserName) return alert('Completa todos los campos');
                  setLoading(true);
                  try {
                    const tx = await addResident(newUserAddress, newUserName);
                    alert('Transacción enviada: ' + tx);
                    setNewUserAddress('');
                    setNewUserName('');
                    await loadContractData();
                  } catch (err: any) {
                    alert('Error: ' + (err?.message || err));
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div>
                  <Label htmlFor="resident-address">Dirección (wallet) del nuevo residente</Label>
                  <Input
                    id="resident-address"
                    type="text"
                    placeholder="0x..."
                    value={newUserAddress}
                    onChange={e => setNewUserAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="resident-name">Nombre del nuevo residente</Label>
                  <Input
                    id="resident-name"
                    type="text"
                    placeholder="Nombre completo"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    required
                  />
                </div>
                <AnimatedButton variant="hover">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Agregando...' : 'Agregar Residente'}
                  </Button>
                </AnimatedButton>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {users.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Usuarios Registrados ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg gap-2">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{user.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.type === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.type === 'admin' ? 'Admin' : 'Residente'}
                      </span>
                      {isAdmin && (
                        <AnimatedButton variant="hover">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!isContractConnected) return alert('Debes conectar tu wallet');
                              if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
                              setLoading(true);
                              try {
                                await removeUser(user.address);
                                alert('Usuario eliminado');
                                await loadContractData();
                              } catch (err: any) {
                                alert('Error: ' + (err?.message || err));
                              } finally {
                                setLoading(false);
                              }
                            }}
                            disabled={loading}
                          >
                            Eliminar
                          </Button>
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Alert className="mt-6">
          <AlertDescription>
            <strong>Para agregar usuarios:</strong> Usa herramientas como Remix, Etherscan, o la consola del navegador.<br/>
            El contrato tiene las funciones <code>addAdmin(address, name)</code> y <code>addResident(address, name)</code>.
          </AlertDescription>
        </Alert>
      </StaggerAnimation>
    </div>
  </div>
</PageTransition>
    </AdminGuard>
  );
}
