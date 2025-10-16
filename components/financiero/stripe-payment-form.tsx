'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StripePaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripePaymentForm({
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/financiamiento?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Error al procesar el pago');
        onError?.(error.message || 'Error al procesar el pago');
      } else {
        setPaymentStatus('success');
        onSuccess?.();
      }
    } catch (err) {
      setPaymentStatus('error');
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Monto a pagar */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total a pagar</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${amount.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} $
            </p>
          </div>
          <CreditCard className="h-12 w-12 text-blue-500 dark:text-blue-400" />
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Información de pago
        </h3>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Mensajes de estado */}
      {paymentStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ¡Pago procesado exitosamente! El recibo se enviará a tu correo.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Botón de pago */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pagar ${amount.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} $
          </>
        )}
      </Button>

      {/* Nota de seguridad */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        🔒 Pagos seguros procesados por Stripe. Tus datos están protegidos con encriptación de nivel bancario.
      </p>
    </form>
  );
}
