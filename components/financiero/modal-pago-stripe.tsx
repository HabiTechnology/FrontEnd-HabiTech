'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import StripePaymentForm from './stripe-payment-form';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Cargar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface ModalPagoStripeProps {
  open: boolean;
  onClose: () => void;
  pagoData: {
    id?: number;
    monto: number;
    descripcion: string;
    residenteId?: number;
    departamentoId?: number;
    correo?: string;
    nombre?: string;
  };
  onSuccess?: () => void;
}

export default function ModalPagoStripe({
  open,
  onClose,
  pagoData,
  onSuccess,
}: ModalPagoStripeProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && pagoData.monto > 0) {
      createPaymentIntent();
    }
  }, [open, pagoData]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagoData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la intención de pago');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'Error al inicializar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#1e293b',
        colorText: '#f1f5f9',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
        colorTextSecondary: '#94a3b8',
        colorTextPlaceholder: '#64748b',
      },
      rules: {
        '.Input': {
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          color: '#f1f5f9',
        },
        '.Input:focus': {
          border: '1px solid #3b82f6',
          boxShadow: '0 0 0 1px #3b82f6',
        },
        '.Label': {
          color: '#cbd5e1',
        },
        '.Tab': {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          color: '#94a3b8',
        },
        '.Tab:hover': {
          backgroundColor: '#334155',
          color: '#f1f5f9',
        },
        '.Tab--selected': {
          backgroundColor: '#3b82f6',
          border: '1px solid #3b82f6',
          color: '#ffffff',
        },
        '.TabIcon--selected': {
          fill: '#ffffff',
        },
      },
    },
    locale: 'es',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Realizar Pago
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {pagoData.descripcion}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">
                Preparando formulario de pago...
              </p>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && clientSecret && (
            <Elements stripe={stripePromise} options={options}>
              <StripePaymentForm
                amount={pagoData.monto}
                onSuccess={handleSuccess}
                onError={(err) => setError(err)}
              />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
