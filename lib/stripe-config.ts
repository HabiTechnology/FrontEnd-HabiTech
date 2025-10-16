import Stripe from 'stripe';

// Configuración del cliente de Stripe (lado servidor)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Clave pública de Stripe (lado cliente)
export const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!;

// Configuración de moneda y región
export const STRIPE_CONFIG = {
  currency: 'MXN', // Pesos mexicanos
  country: 'MX',
  locale: 'es-MX',
};

// Tipos de pago soportados
export const PAYMENT_METHODS = ['card', 'oxxo', 'spei'] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];
