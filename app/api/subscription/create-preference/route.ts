import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createSubscriptionPreference } from '@/lib/mercadopago';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin si aún no está inicializado
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );
    
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;
    
    if (!email) {
      return NextResponse.json(
        { error: 'No se pudo obtener el email del usuario' },
        { status: 400 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const { planId } = await req.json();
    
    if (!planId) {
      return NextResponse.json(
        { error: 'Falta el ID del plan' },
        { status: 400 }
      );
    }
    
    // Crear preferencia de pago en MercadoPago
    const preference = await createSubscriptionPreference(planId, email, userId);
    
    // Guardar la referencia en Firestore para seguimiento
    const db = getFirestore();
    await db.collection('payment_intents').doc(preference.id).set({
      userId,
      planId,
      email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      preferenceId: preference.id
    });
    
    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point
    });
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    return NextResponse.json(
      {
        error: 'Error al crear preferencia de pago',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
} 