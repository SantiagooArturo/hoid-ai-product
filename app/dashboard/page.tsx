"use client"

import React, { useEffect, useState } from 'react';
import AudioRecorder from "@/components/audio-recorder"
import Sidebar from "@/components/sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { SubscriptionStatus } from '@/lib/types';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Procesar parámetros de retorno de MercadoPago
  useEffect(() => {
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    
    if (status && plan) {
      setProcessingPayment(true);
      
      // Mostrar mensaje según el estado del pago
      setTimeout(() => {
        setProcessingPayment(false);
        
        if (status === 'success') {
          toast({
            title: "¡Pago exitoso!",
            description: `Tu suscripción al plan ${plan} ha sido activada.`,
            variant: "default",
          });
        } else if (status === 'pending') {
          toast({
            title: "Pago pendiente",
            description: "Tu pago está siendo procesado. Te notificaremos cuando se complete.",
            variant: "default",
          });
        } else if (status === 'failure') {
          toast({
            title: "Error en el pago",
            description: "Hubo un problema con tu pago. Por favor, intenta nuevamente.",
            variant: "destructive",
          });
        }
        
        // Limpiar los parámetros de la URL sin recargar la página
        const url = new URL(window.location.href);
        url.searchParams.delete('status');
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.toString());
      }, 1500);
    }
  }, [searchParams, toast]);
  
  if (loading || processingPayment) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">
          {processingPayment ? 'Procesando pago...' : 'Cargando dashboard...'}
        </h1>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold">Acceso denegado</h1>
        <p className="text-muted-foreground mt-2">
          Debes iniciar sesión para acceder a esta página.
        </p>
      </div>
    );
  }
  
  // @ts-ignore - subscription viene de la extensión de User en useAuth.ts
  const subscription = user.subscription || { plan: 'free', status: SubscriptionStatus.INACTIVE };
  const isActiveSubscription = subscription.status === SubscriptionStatus.ACTIVE;
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hoid AI</h1>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <AudioRecorder />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 