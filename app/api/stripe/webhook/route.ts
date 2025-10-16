import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-config';
import { query } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log('🔔 Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Payment succeeded:', paymentIntent.id);

        // Actualizar el estado del pago en la base de datos
        const pagoId = paymentIntent.metadata.pagoId;
        
        if (pagoId && pagoId !== 'nuevo') {
          await query`
            UPDATE pagos 
            SET 
              estado = 'completado',
              metodo_pago = 'stripe',
              fecha_pago = NOW(),
              stripe_payment_intent_id = ${paymentIntent.id}
            WHERE id = ${parseInt(pagoId)}
          `;
          
          console.log(`✅ Pago ${pagoId} actualizado a completado`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', paymentIntent.id);

        // Opcional: marcar el pago como fallido
        const pagoId = paymentIntent.metadata.pagoId;
        if (pagoId && pagoId !== 'nuevo') {
          await query`
            UPDATE pagos 
            SET estado = 'pendiente'
            WHERE id = ${parseInt(pagoId)}
          `;
        }
        break;
      }

      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('💳 Charge succeeded:', charge.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
