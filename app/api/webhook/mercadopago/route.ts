import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/mercadopago';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { SubscriptionPlan } from '@/lib/types';

// Mapeo de planes de MercadoPago a planes internos
const planMapping: Record<string, SubscriptionPlan> = {
  'basic_monthly': SubscriptionPlan.BASIC,
  'pro_monthly': SubscriptionPlan.PRO,
  'enterprise_monthly': SubscriptionPlan.ENTERPRISE,
  'test-item-1': SubscriptionPlan.BASIC // Para nuestro ítem de prueba
};

// Función para determinar la duración del plan en días
const getPlanDuration = (planId: string): number => {
  // Por defecto, 30 días para todos los planes
  return 30;
};

export async function POST(req: NextRequest) {
  try {
    // Obtener parámetro paymentId de la URL
    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId') || searchParams.get('id');
    let userId = searchParams.get('userId');
    let planId = searchParams.get('planId');

    // Datos de la solicitud para casos no estándar
    const body = await req.json().catch(() => ({}));
    
    if (!paymentId && body.data?.id) {
      // Formato de notificación de MercadoPago
      console.log('Notificación recibida:', body);
      return handleMercadoPagoNotification(req, body);
    }

    if (!paymentId) {
      console.error('No se proporcionó paymentId');
      return NextResponse.json({ success: false, error: 'paymentId requerido' }, { status: 400 });
    }

    // Intentar obtener detalles del pago desde MercadoPago
    console.log(`Obteniendo detalles del pago ${paymentId}`);
    const paymentDetails = await getPaymentStatus(paymentId);
    
    // Si no hay userId en los parámetros, intentar obtenerlo de los metadatos del pago
    if (!userId && paymentDetails.metadata?.user_id) {
      userId = paymentDetails.metadata.user_id;
    }
    
    if (!userId && paymentDetails.external_reference) {
      // Formato común: user_123456
      const match = paymentDetails.external_reference.match(/user[_-](\w+)/i);
      if (match && match[1]) {
        userId = match[1];
      }
    }
    
    if (!userId) {
      console.error('No se pudo identificar al usuario para el pago', paymentId);
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo identificar al usuario',
        paymentId,
        paymentDetails
      }, { status: 400 });
    }
    
    // Si no hay planId, intentar determinarlo a partir del pago
    if (!planId) {
      const items = paymentDetails.additional_info?.items || [];
      if (items.length > 0) {
        planId = items[0].id;
      }
    }
    
    if (!planId) {
      console.error('No se pudo identificar el plan para el pago', paymentId);
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo identificar el plan',
        paymentId,
        paymentDetails
      }, { status: 400 });
    }
    
    // Mapear el ID del plan externo a nuestro sistema interno
    const internalPlanId = planMapping[planId] || SubscriptionPlan.BASIC;
    
    // Procesar el estado del pago
    const status = paymentDetails.status;
    let subscriptionStatus: string;
    
    switch (status) {
      case 'approved':
        subscriptionStatus = 'active';
        break;
      case 'pending':
      case 'in_process':
        subscriptionStatus = 'pending';
        break;
      case 'rejected':
      case 'cancelled':
      case 'refunded':
        subscriptionStatus = 'cancelled';
        break;
      default:
        subscriptionStatus = 'pending';
    }
    
    // Calcular fecha de finalización (30 días por defecto)
    const durationDays = getPlanDuration(planId);
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + durationDays);
    
    // Actualizar la información de suscripción en Firestore
    try {
      // Referencia al documento del usuario
      const userDocRef = doc(db, 'users', userId);
      
      // Comprobar si el usuario existe
      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) {
        console.error('El usuario no existe en Firestore', userId);
        return NextResponse.json({ 
          success: false, 
          error: 'El usuario no existe', 
          userId 
        }, { status: 404 });
      }
      
      // Referencia al documento de suscripción actual
      const subscriptionDocRef = doc(collection(userDocRef, 'subscriptions'), 'current');
      
      // Datos de la suscripción
      const subscriptionData = {
        planId: internalPlanId,
        status: subscriptionStatus,
        paymentId: paymentId,
        paymentMethod: 'mercadopago',
        currentPeriodEnd: Timestamp.fromDate(endDate),
        updatedAt: serverTimestamp(),
      };
      
      // Verificar si ya existe una suscripción actual
      const subscriptionSnapshot = await getDoc(subscriptionDocRef);
      
      if (subscriptionSnapshot.exists()) {
        // Actualizar suscripción existente
        await updateDoc(subscriptionDocRef, subscriptionData);
      } else {
        // Crear nueva suscripción
        await setDoc(subscriptionDocRef, {
          ...subscriptionData,
          createdAt: serverTimestamp(),
        });
      }
      
      console.log(`Suscripción actualizada para el usuario ${userId}: ${internalPlanId} (${subscriptionStatus})`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Suscripción actualizada correctamente',
        userId,
        planId: internalPlanId,
        status: subscriptionStatus,
        paymentId
      });
      
    } catch (error) {
      console.error('Error al actualizar suscripción en Firestore:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al actualizar la suscripción',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error al procesar webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar la notificación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// Función para manejar notificaciones de MercadoPago
async function handleMercadoPagoNotification(req: NextRequest, body: any) {
  try {
    const { action, type } = body;
    
    // Solo procesar notificaciones de pago
    if (type !== 'payment' || !action) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notificación recibida, pero no es de pago'
      });
    }
    
    if (action === 'payment.created' || action === 'payment.updated') {
      const paymentId = body.data.id;
      
      if (!paymentId) {
        return NextResponse.json({ 
          success: false, 
          error: 'ID de pago no proporcionado en la notificación'
        }, { status: 400 });
      }
      
      // Redirigir a la ruta principal pero con el ID del pago
      const url = new URL(req.url);
      url.searchParams.set('paymentId', paymentId);
      
      // Crear una nueva solicitud para procesar el pago
      const newRequest = new NextRequest(url, {
        method: 'POST',
        headers: req.headers
      });
      
      // Procesar el pago con la función principal
      return POST(newRequest);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notificación recibida pero no procesada',
      action,
      type
    });
    
  } catch (error) {
    console.error('Error al procesar notificación de MercadoPago:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar la notificación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// Permitir solicitudes GET para la verificación de la URL del webhook
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Webhook de MercadoPago configurado correctamente'
  });
} 