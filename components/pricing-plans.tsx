"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { SubscriptionPlan, PLAN_LIMITS, PLAN_PRICES } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { SUBSCRIPTION_PLANS } from '@/lib/mercadopago';
import { auth } from '@/lib/firebase'; // Importamos auth directamente

type PricingPlanProps = {
  currentUserId?: string;
};

export function PricingPlans({ currentUserId }: PricingPlanProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  
  // @ts-ignore - plan viene de la extensión de User en useAuth.ts
  const currentPlan = user?.subscription?.plan || SubscriptionPlan.FREE;
  
  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Debes iniciar sesión",
        description: "Inicia sesión para actualizar tu plan de suscripción",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoadingPlan(plan);
      setErrorInfo(null);
      
      // Obtener token de autenticación directamente desde Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No se pudo obtener el usuario actual. Por favor, inicia sesión nuevamente.");
      }
      
      const token = await currentUser.getIdToken(true);
      
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
      
      // Crear preferencia de pago directamente desde el componente
      console.log('Enviando solicitud para planId:', mercadoPlanId);
      
      // Simplificamos el manejo de errores para evitar problemas con body consumed
      const response = await fetch('/api/subscription/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId: mercadoPlanId })
      });
      
      // Si no es OK, leemos el texto una sola vez
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: `;
        
        try {
          const errorText = await response.text();
          setErrorInfo(errorText);
          errorMessage += errorText.substring(0, 100);
        } catch (e) {
          errorMessage += "No se pudo leer el mensaje de error";
        }
        
        throw new Error(errorMessage);
      }
      
      // Si llegamos aquí, la respuesta es exitosa, procesamos JSON una sola vez
      const responseData = await response.json();
      
      const { preferenceId, publicKey, initPoint, sandboxInitPoint } = responseData;
      console.log('Datos recibidos:', { preferenceId, publicKey, initPoint, sandboxInitPoint });
      
      // Usar el initPoint para redireccionar al checkout
      // En desarrollo usar sandboxInitPoint, en producción usar initPoint
      const checkoutUrl = initPoint || sandboxInitPoint;
      
      if (checkoutUrl) {
        // Redireccionar directamente
        console.log('Redirigiendo a:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else if (preferenceId && publicKey) {
        // Alternativamente, usar el SDK de MercadoPago si está disponible
        if ((window as any).MercadoPago) {
          console.log('Usando SDK de MercadoPago');
          const mp = new (window as any).MercadoPago(publicKey, {
            locale: 'es-PE'
          });
          
          const checkout = mp.checkout({
            preference: {
              id: preferenceId
            },
            autoOpen: true
          });
        } else {
          throw new Error('No se pudo iniciar el proceso de pago. Intenta nuevamente más tarde.');
        }
      } else {
        throw new Error('La API no devolvió una URL válida para el checkout.');
      }
      
    } catch (error) {
      console.error('Error al iniciar proceso de pago:', error);
      toast({
        title: "Error al procesar pago",
        description: error instanceof Error ? error.message : "Hubo un error al procesar tu solicitud",
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };
  
  const planConfigs = [
    {
      plan: SubscriptionPlan.FREE,
      title: "Plan Gratuito",
      description: "Para probar la plataforma",
      price: 0,
      features: ["10 grabaciones", "Máximo 10 minutos por grabación", "Transcripción básica", "Resúmenes básicos"],
      cta: "Plan Actual",
      disabled: true
    },
    {
      plan: SubscriptionPlan.BASIC,
      title: "Plan Básico",
      description: "Para uso personal",
      price: PLAN_PRICES[SubscriptionPlan.BASIC],
      features: ["50 grabaciones", "Máximo 30 minutos por grabación", "Transcripción avanzada", "Resúmenes completos", "Mapas mentales", "Exportación a PDF"],
      cta: currentPlan === SubscriptionPlan.BASIC ? "Plan Actual" : "Actualizar",
      disabled: currentPlan === SubscriptionPlan.BASIC || currentPlan === SubscriptionPlan.PRO || currentPlan === SubscriptionPlan.ENTERPRISE
    },
    {
      plan: SubscriptionPlan.PRO,
      title: "Plan Pro",
      description: "Para profesionales",
      price: PLAN_PRICES[SubscriptionPlan.PRO],
      popular: true,
      features: ["200 grabaciones", "Máximo 2 horas por grabación", "Transcripción premium", "Resúmenes detallados", "Mapas mentales interactivos", "Flashcards", "Guías de estudio completas", "Exportación multiformato", "Compartir grabaciones"],
      cta: currentPlan === SubscriptionPlan.PRO ? "Plan Actual" : "Actualizar",
      disabled: currentPlan === SubscriptionPlan.PRO || currentPlan === SubscriptionPlan.ENTERPRISE
    },
    {
      plan: SubscriptionPlan.ENTERPRISE,
      title: "Plan Empresarial",
      description: "Para equipos y organizaciones",
      price: PLAN_PRICES[SubscriptionPlan.ENTERPRISE],
      features: ["Grabaciones ilimitadas", "Duración ilimitada", "Todas las características premium", "Herramientas de colaboración", "Panel de administración", "Soporte prioritario", "API para integración"],
      cta: currentPlan === SubscriptionPlan.ENTERPRISE ? "Plan Actual" : "Contactar",
      disabled: currentPlan === SubscriptionPlan.ENTERPRISE,
      contact: true
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planConfigs.map((planConfig) => (
          <Card 
            key={planConfig.plan}
            className={cn(
              "flex flex-col relative", 
              planConfig.popular ? "border-primary shadow-lg" : ""
            )}
          >
            {planConfig.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium z-10">
                Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{planConfig.title}</CardTitle>
              <CardDescription>{planConfig.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${planConfig.price}</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 text-sm">
                {planConfig.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={planConfig.disabled ? "outline" : "default"}
                className="w-full"
                disabled={planConfig.disabled || loadingPlan !== null}
                onClick={() => {
                  if (planConfig.contact) {
                    window.location.href = "mailto:soporte@hoidai.com?subject=Interés en Plan Empresarial";
                  } else {
                    handleUpgrade(planConfig.plan);
                  }
                }}
              >
                {loadingPlan === planConfig.plan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  planConfig.cta
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {errorInfo && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-700 font-medium mb-2">Información del error:</h3>
          <pre className="text-xs overflow-auto max-h-40 p-2 bg-red-100 rounded">
            {errorInfo}
          </pre>
        </div>
      )}
    </div>
  );
} 