import { User } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SubscriptionPlan, SubscriptionInfo } from './types';
import { SUBSCRIPTION_PLANS, MERCADOPAGO_PUBLIC_KEY } from './mercadopago';

// Función para crear una preferencia de pago para una suscripción
export async function createSubscription(userId: string, plan: SubscriptionPlan): Promise<{ preferenceId: string, initPoint: string, sandboxInitPoint: string }> {
  try {
    // Mapear el plan de suscripción al ID del plan en MercadoPago
    let mercadoPlanId: string;
    
    switch(plan) {
      case SubscriptionPlan.BASIC:
        mercadoPlanId = SUBSCRIPTION_PLANS.basic.id;
        break;
      case SubscriptionPlan.PRO:
        mercadoPlanId = SUBSCRIPTION_PLANS.pro.id;
        break;
      case SubscriptionPlan.ENTERPRISE:
        mercadoPlanId = SUBSCRIPTION_PLANS.enterprise.id;
        break;
      default:
        throw new Error(`Plan no válido: ${plan}`);
    }
    
    // Obtener token desde la sesión actual - no usamos window.firebase
    // Cuando llamamos a esta función ya debemos tener el token disponible
    // a través del hook useAuth y user.getIdToken()
    
    // Llamar a nuestra API para crear una preferencia de pago
    const response = await fetch('/api/subscription/preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken') || ''}`
      },
      body: JSON.stringify({ planId: mercadoPlanId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear la suscripción');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    throw error;
  }
}

// Función para actualizar el estado de la suscripción del usuario después de un pago exitoso
export async function updateSubscriptionAfterPayment(
  userId: string,
  planId: string,
  paymentId: string
): Promise<void> {
  try {
    // Determinar el plan de suscripción basado en el ID del plan de MercadoPago
    let plan: SubscriptionPlan;
    
    switch(planId) {
      case SUBSCRIPTION_PLANS.basic.id:
        plan = SubscriptionPlan.BASIC;
        break;
      case SUBSCRIPTION_PLANS.pro.id:
        plan = SubscriptionPlan.PRO;
        break;
      case SUBSCRIPTION_PLANS.enterprise.id:
        plan = SubscriptionPlan.ENTERPRISE;
        break;
      default:
        throw new Error(`ID de plan no reconocido: ${planId}`);
    }
    
    // Calcular la fecha de finalización del período (30 días desde ahora)
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
    
    // Crear objeto de información de suscripción
    const subscriptionInfo: SubscriptionInfo = {
      plan,
      status: 'active',
      currentPeriodEnd,
      stripeCustomerId: 'mp_' + userId, // Prefijo para indicar que es MercadoPago
      stripeSubscriptionId: paymentId,
      cancelAtPeriodEnd: false
    };
    
    // Actualizar documento del usuario en Firestore
    const userRef = doc(db, 'users', userId);
    
    // Verificar si el usuario existe
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar suscripción
    await updateDoc(userRef, {
      subscription: {
        plan: subscriptionInfo.plan,
        status: subscriptionInfo.status,
        currentPeriodEnd: subscriptionInfo.currentPeriodEnd,
        stripeCustomerId: subscriptionInfo.stripeCustomerId,
        stripeSubscriptionId: subscriptionInfo.stripeSubscriptionId,
        cancelAtPeriodEnd: subscriptionInfo.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    throw error;
  }
}

// Función para iniciar el proceso de checkout con MercadoPago
export async function startMercadoPagoCheckout(initPoint: string): Promise<void> {
  // Redirigir al usuario a la página de pago de MercadoPago
  window.location.href = initPoint;
}

// Función para verificar si una suscripción está activa
export async function checkSubscriptionStatus(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const data = userDoc.data();
    
    // Verificar si el usuario tiene una suscripción activa
    if (data.subscription && data.subscription.status === 'active') {
      // Verificar si la suscripción no ha expirado
      const currentPeriodEnd = data.subscription.currentPeriodEnd?.toDate();
      if (currentPeriodEnd && currentPeriodEnd > new Date()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar estado de suscripción:', error);
    return false;
  }
} 