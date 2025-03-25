import { db } from './firebase-admin';
import { SubscriptionStatus, SubscriptionPlan } from './types';

// Colecciones
const USERS_COLLECTION = 'users';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

// Tipos
export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  preferenceId?: string;
  paymentId?: string;
  pendingPlan?: SubscriptionPlan;
  pendingPlanId?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionUpdate {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  updatedAt: string;
  expiresAt?: string;
  preferenceId?: string;
  paymentId?: string;
  pendingPlan?: SubscriptionPlan;
  pendingPlanId?: string;
  cancelAtPeriodEnd?: boolean;
}

// Funciones para manejar suscripciones
export async function getUserSubscriptionById(userId: string): Promise<UserSubscription | null> {
  try {
    const subscriptionRef = db.collection(SUBSCRIPTIONS_COLLECTION).doc(userId);
    const snapshot = await subscriptionRef.get();
    
    if (!snapshot.exists) {
      return null;
    }
    
    return snapshot.data() as UserSubscription;
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return null;
  }
}

export async function updateUserSubscription(userId: string, update: SubscriptionUpdate): Promise<boolean> {
  try {
    const subscriptionRef = db.collection(SUBSCRIPTIONS_COLLECTION).doc(userId);
    const snapshot = await subscriptionRef.get();
    
    if (snapshot.exists) {
      // Actualizar suscripción existente
      await subscriptionRef.update(update);
    } else {
      // Crear nueva suscripción
      const newSubscription: UserSubscription = {
        userId,
        plan: update.plan || SubscriptionPlan.FREE,
        status: update.status || SubscriptionStatus.INACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: update.updatedAt,
        ...update
      };
      
      await subscriptionRef.set(newSubscription);
    }
    
    return true;
  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    return false;
  }
}

export async function getSubscriptionsByStatus(status: SubscriptionStatus): Promise<UserSubscription[]> {
  try {
    const querySnapshot = await db
      .collection(SUBSCRIPTIONS_COLLECTION)
      .where('status', '==', status)
      .get();
    
    return querySnapshot.docs.map(doc => doc.data() as UserSubscription);
  } catch (error) {
    console.error('Error al obtener suscripciones por estado:', error);
    return [];
  }
}

export async function updateUserData(userId: string, data: any): Promise<boolean> {
  try {
    await db.collection(USERS_COLLECTION).doc(userId).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar datos de usuario:', error);
    return false;
  }
} 