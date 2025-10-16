import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe-config';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      pagoId, 
      monto, 
      descripcion, 
      residenteId,
      departamentoId,
      correo,
      nombre
    } = body;

    console.log('💳 Creando Payment Intent para pago:', { pagoId, monto, correo });

    // Validar datos
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Convertir el monto a centavos (Stripe trabaja con centavos)
    const montoCentavos = Math.round(Number(monto) * 100);

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: montoCentavos,
      currency: STRIPE_CONFIG.currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      description: descripcion || `Pago de ${nombre} - Depto ${departamentoId}`,
      metadata: {
        pagoId: pagoId?.toString() || 'nuevo',
        residenteId: residenteId?.toString() || '',
        departamentoId: departamentoId?.toString() || '',
        correo: correo || '',
        nombre: nombre || '',
      },
      receipt_email: correo,
    });

    console.log('✅ Payment Intent creado:', paymentIntent.id);

    // Si hay un pagoId existente, actualizar la referencia en la base de datos
    if (pagoId) {
      await query`
        UPDATE pagos 
        SET stripe_payment_intent_id = ${paymentIntent.id}
        WHERE id = ${pagoId}
      `;
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error al crear la intención de pago' },
      { status: 500 }
    );
  }
}
