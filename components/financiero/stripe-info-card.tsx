'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Zap, Globe, CheckCircle } from 'lucide-react';

export default function StripeInfoCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Pagos con Stripe</CardTitle>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Seguridad */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Seguro</p>
              <p className="text-xs text-muted-foreground">
                Encriptación bancaria
              </p>
            </div>
          </div>

          {/* Rapidez */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Instantáneo</p>
              <p className="text-xs text-muted-foreground">
                Pagos en tiempo real
              </p>
            </div>
          </div>

          {/* Múltiples métodos */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Múltiples métodos</p>
              <p className="text-xs text-muted-foreground">
                Tarjetas, OXXO, SPEI
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
