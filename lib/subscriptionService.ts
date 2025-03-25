import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SubscriptionPlan, PLAN_LIMITS, SubscriptionInfo } from './types';

/**
 * Verifica si un usuario tiene acceso a una característica específica basado en su plan de suscripción
 */
export const hasAccess = (user: User | null, feature: keyof typeof PLAN_LIMITS[SubscriptionPlan.FREE]['features']): boolean => {
  if (!user) return false;
  
  // @ts-ignore - estamos extendiendo User en useAuth.ts
  const plan = user.subscription?.plan || SubscriptionPlan.FREE;
  return PLAN_LIMITS[plan].features[feature];
};

/**
 * Verifica si un usuario ha alcanzado un límite específico (grabaciones, duración, etc.)
 */
export const hasReachedLimit = async (
  user: User | null, 
  limitType: 'maxRecordings' | 'maxDurationMinutes' | 'maxStorageMB',
  currentValue: number
): Promise<boolean> => {
  if (!user) return true;
  
  // @ts-ignore - estamos extendiendo User en useAuth.ts
  const plan = user.subscription?.plan || SubscriptionPlan.FREE;
  const limit = PLAN_LIMITS[plan][limitType];
  
  return currentValue >= limit;
};

/**
 * Obtiene el número actual de grabaciones del usuario
 */
export const getUserRecordingCount = async (userId: string): Promise<number> => {
  try {
    // Esta implementación dependerá de cómo estés contando las grabaciones
    // Aquí hay un ejemplo básico, pero probablemente necesites adaptarlo
    const response = await fetch(`/api/recordings/count?userId=${userId}`);
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error al obtener el recuento de grabaciones:', error);
    return 0;
  }
};

/**
 * Actualiza el plan de suscripción de un usuario
 */
export const updateUserSubscription = async (
  userId: string,
  subscriptionInfo: SubscriptionInfo
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
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
    console.error('Error al actualizar la suscripción:', error);
    throw new Error('No se pudo actualizar la información de suscripción');
  }
};

/**
 * Hook para verificar límites y acceso en componentes
 */
export const useSubscription = (user: User | null) => {
  // @ts-ignore - estamos extendiendo User en useAuth.ts
  const plan = user?.subscription?.plan || SubscriptionPlan.FREE;
  const limits = PLAN_LIMITS[plan];
  
  return {
    plan,
    limits,
    hasFeatureAccess: (feature: keyof typeof limits.features) => hasAccess(user, feature),
    checkLimit: (limitType: keyof typeof limits, currentValue: number) => 
      hasReachedLimit(user, limitType as any, currentValue)
  };
}; 