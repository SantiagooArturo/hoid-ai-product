"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubscriptionPlan } from '@/lib/types';

export interface SubscriptionData {
  id?: string;
  planId: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'pending' | 'none';
  currentPeriodEnd?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userDocRef = doc(db, 'users', user.uid);
    const subscriptionDocRef = doc(userDocRef, 'subscriptions', 'current');

    // Función para procesar los datos de la suscripción
    const processSubscriptionData = async (docSnapshot: any) => {
      try {
        if (!docSnapshot.exists()) {
          // No hay suscripción activa
          setSubscription({
            planId: SubscriptionPlan.FREE,
            status: 'none',
          });
          return;
        }

        const data = docSnapshot.data();
        
        // Procesar los timestamps de Firestore
        const currentPeriodEnd = data.currentPeriodEnd?.toDate ? 
                                data.currentPeriodEnd.toDate() : 
                                data.currentPeriodEnd;
                                
        const createdAt = data.createdAt?.toDate ? 
                          data.createdAt.toDate() : 
                          data.createdAt;
                          
        const updatedAt = data.updatedAt?.toDate ? 
                          data.updatedAt.toDate() : 
                          data.updatedAt;
        
        // Determinar si la suscripción ha expirado
        const isExpired = currentPeriodEnd && new Date() > new Date(currentPeriodEnd);
        
        // Determinar el estado real basado en la fecha de expiración
        let realStatus = data.status;
        if (isExpired && data.status === 'active') {
          realStatus = 'expired';
        }

        setSubscription({
          id: docSnapshot.id,
          planId: data.planId || SubscriptionPlan.FREE,
          status: realStatus || 'none',
          currentPeriodEnd: currentPeriodEnd,
          createdAt: createdAt,
          updatedAt: updatedAt
        });
      } catch (err) {
        console.error('Error al procesar datos de suscripción:', err);
        setError('Error al cargar la información de suscripción');
      } finally {
        setLoading(false);
      }
    };

    // Obtener datos iniciales
    getDoc(subscriptionDocRef)
      .then(processSubscriptionData)
      .catch(err => {
        console.error('Error al obtener suscripción:', err);
        setError('Error al cargar la información de suscripción');
        setLoading(false);
      });

    // Suscribirse a cambios
    const unsubscribe = onSnapshot(subscriptionDocRef, 
      processSubscriptionData, 
      err => {
        console.error('Error en listener de suscripción:', err);
        setError('Error al actualizar la información de suscripción');
        setLoading(false);
      }
    );

    // Limpiar listener al desmontar
    return () => unsubscribe();
  }, [user]);

  return { subscription, loading, error };
} 