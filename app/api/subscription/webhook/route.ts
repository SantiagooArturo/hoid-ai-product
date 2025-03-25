import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getPaymentStatus } from '@/lib/mercadopago';
import { updateUserSubscription, getUserSubscriptionById } from '@/lib/db';
import { SubscriptionStatus } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // Obtener los datos de la notificación
    let data;
    try {
      data = await req.json();
      console.log('Webhook recibido:', JSON.stringify(data));
    } catch (error) {
      console.error('Error al parsear JSON del webhook:', error);
      const text = await req.text();
      console.log('Contenido texto recibido:', text);
      return NextResponse.json({ error: 'Formato de datos inválido: ' + text }, { status: 400 });
    }

    // Validar que es una notificación de MercadoPago
    if (!data.type || !data.data) {
      return NextResponse.json({ error: 'Formato de notificación inválido' }, { status: 400 });
    }

    // Procesar según el tipo de notificación
    switch (data.type) {
      case 'payment':
        // Es una notificación de pago
        const paymentId = data.data.id;
        
        if (!paymentId) {
          return NextResponse.json({ error: 'ID de pago no proporcionado' }, { status: 400 });
        }
        
        // Obtener detalles del pago
        console.log(`Obteniendo detalles del pago ${paymentId}`);
        const paymentDetails = await getPaymentStatus(paymentId);
        console.log('Detalles del pago:', JSON.stringify(paymentDetails));
        
        // Verificar el estado del pago
        if (!paymentDetails || !paymentDetails.status) {
          return NextResponse.json({ error: 'No se pudieron obtener detalles del pago' }, { status: 500 });
        }
        
        // Obtener referencia externa (userId)
        const userId = paymentDetails.external_reference;
        
        if (!userId) {
          return NextResponse.json({ error: 'Referencia de usuario no encontrada' }, { status: 400 });
        }
        
        // Obtener la preferencia de pago - manejar diferentes formatos de respuesta
        let preferenceId;
        // @ts-ignore - aceptamos diferentes formatos de respuesta de MercadoPago
        if (paymentDetails.preference_id) {
          // @ts-ignore
          preferenceId = paymentDetails.preference_id;
        } else if (paymentDetails.metadata && paymentDetails.metadata.preference_id) {
          // @ts-ignore
          preferenceId = paymentDetails.metadata.preference_id;
        } else {
          console.log('No se encontró preferenceId en la respuesta, usando external_reference');
          preferenceId = userId; // Fallback
        }
        
        // Obtener suscripción pendiente
        const subscription = await getUserSubscriptionById(userId);
        
        if (!subscription || !subscription.pendingPlanId || !subscription.pendingPlan) {
          console.log(`Suscripción no encontrada para usuario ${userId}`);
          return NextResponse.json({ error: 'Suscripción pendiente no encontrada' }, { status: 404 });
        }
        
        // Procesar basado en el estado del pago
        let newStatus: SubscriptionStatus;
        
        switch (paymentDetails.status) {
          case 'approved':
            newStatus = SubscriptionStatus.ACTIVE;
            
            // Calcular fecha de expiración (30 días desde hoy)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            
            // Actualizar suscripción en Firestore
            await updateUserSubscription(userId, {
              plan: subscription.pendingPlan,
              status: newStatus,
              paymentId,
              expiresAt: expiresAt.toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            // Registrar el pago aprobado
            await db.collection('payment_history').add({
              userId,
              paymentId,
              preferenceId,
              planId: subscription.pendingPlanId,
              plan: subscription.pendingPlan,
              status: 'approved',
              // @ts-ignore - aceptamos diferentes formatos de respuesta
              amount: paymentDetails.transaction_amount,
              // @ts-ignore
              currency: paymentDetails.currency_id,
              createdAt: new Date().toISOString()
            });
            
            console.log(`Suscripción activada para usuario ${userId}, plan ${subscription.pendingPlan}`);
            break;
            
          case 'rejected':
          case 'cancelled':
            newStatus = SubscriptionStatus.FAILED;
            
            // Actualizar suscripción en Firestore
            await updateUserSubscription(userId, {
              status: newStatus,
              paymentId,
              updatedAt: new Date().toISOString()
            });
            
            console.log(`Pago rechazado para usuario ${userId}`);
            break;
            
          case 'in_process':
          case 'pending':
            newStatus = SubscriptionStatus.PENDING;
            
            // Actualizar suscripción en Firestore
            await updateUserSubscription(userId, {
              status: newStatus,
              paymentId,
              updatedAt: new Date().toISOString()
            });
            
            console.log(`Pago pendiente para usuario ${userId}`);
            break;
            
          default:
            console.log(`Estado de pago no manejado: ${paymentDetails.status}`);
            return NextResponse.json({ error: `Estado de pago no manejado: ${paymentDetails.status}` }, { status: 400 });
        }
        
        return NextResponse.json({ success: true, status: newStatus });
        
      default:
        console.log(`Tipo de notificación no manejado: ${data.type}`);
        return NextResponse.json({ message: `Tipo de notificación no manejado: ${data.type}` });
    }
    
  } catch (error: any) {
    console.error('Error al procesar webhook:', error);
    return NextResponse.json({
      error: 'Error al procesar la notificación',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// También manejar solicitudes OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 