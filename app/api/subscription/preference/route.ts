import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { createSubscriptionPreference } from '@/lib/mercadopago';
import { SUBSCRIPTION_PLANS } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener y verificar el token de autenticación
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email || 'usuario@example.com';
    
    // 2. Parsear la solicitud
    const body = await req.json();
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json({ error: 'Se requiere un planId' }, { status: 400 });
    }
    
    // 3. Verificar que exista el plan
    let plan;
    if (planId === SUBSCRIPTION_PLANS.basic.id) {
      plan = SUBSCRIPTION_PLANS.basic;
    } else if (planId === SUBSCRIPTION_PLANS.pro.id) {
      plan = SUBSCRIPTION_PLANS.pro;
    } else if (planId === SUBSCRIPTION_PLANS.enterprise.id) {
      plan = SUBSCRIPTION_PLANS.enterprise;
    } else {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }
    
    // 4. Construir los datos para MercadoPago
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const preferenceData = {
      items: [
        {
          id: plan.id,
          title: plan.title || plan.name,
          quantity: 1,
          unit_price: plan.price,
          currency_id: plan.currency,
          description: plan.description
        }
      ],
      payer: {
        email: userEmail,
        name: decodedToken.name?.split(' ')[0] || 'Usuario',
        surname: decodedToken.name?.split(' ').slice(1).join(' ') || 'Hoid AI'
      },
      back_urls: {
        success: `${baseUrl}/dashboard?status=success&plan=${plan.internalName}`,
        failure: `${baseUrl}/dashboard?status=failure&plan=${plan.internalName}`,
        pending: `${baseUrl}/dashboard?status=pending&plan=${plan.internalName}`
      },
      external_reference: `user_${userId}_${Date.now()}`
    };
    
    // 5. Crear la preferencia de pago en MercadoPago
    const preference = await createSubscriptionPreference(preferenceData);
    
    // 6. Devolver respuesta con los datos necesarios para el checkout
    return NextResponse.json({
      preferenceId: preference.id,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point
    });
    
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    
    // Devolver un objeto de error limpio
    return NextResponse.json({
      error: 'Error al crear la preferencia de pago',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 