"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@/lib/types";
import { Crown, CheckCircle, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

// Mapa de nombres legibles para los planes
const planNames: Record<string, string> = {
  [SubscriptionPlan.FREE]: "Gratuito",
  [SubscriptionPlan.BASIC]: "Básico",
  [SubscriptionPlan.PRO]: "Profesional",
  [SubscriptionPlan.ENTERPRISE]: "Empresarial"
};

export function SubscriptionStatus() {
  const { subscription, loading, error } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Estado de suscripción</CardTitle>
          <CardDescription>Cargando información...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Estado de suscripción</CardTitle>
          <CardDescription>Ocurrió un error al cargar la información</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // No hay suscripción o suscripción gratuita
  if (!subscription || subscription.planId === SubscriptionPlan.FREE || subscription.status === 'none') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Plan Gratuito</CardTitle>
          <CardDescription>Actualmente estás utilizando la versión gratuita de Hoid AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Funcionalidades limitadas</span>
          </div>
          <p className="text-sm text-gray-500">
            Actualiza a un plan premium para acceder a todas las funcionalidades y eliminar las restricciones.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/dashboard/subscription?tab=upgrade">
              Mejorar Plan
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Mostrar detalles de la suscripción activa
  const planName = planNames[subscription.planId] || "Desconocido";
  const isActive = subscription.status === 'active';
  const isPending = subscription.status === 'pending';
  const isCancelled = subscription.status === 'cancelled' || subscription.status === 'expired';
  const expiryDate = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;

  return (
    <Card className={isCancelled ? "border-red-200" : isActive ? "border-green-200" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Plan {planName}</CardTitle>
          {isActive && (
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Activo
            </span>
          )}
          {isPending && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Pendiente
            </span>
          )}
          {isCancelled && (
            <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full">
              Finalizado
            </span>
          )}
        </div>
        <CardDescription>
          {isActive && "Tu suscripción está activa"}
          {isPending && "Tu pago está siendo procesado"}
          {isCancelled && "Tu suscripción ha finalizado"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {expiryDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">
                {isActive ? "Próxima renovación" : isCancelled ? "Expiró" : "Fecha de activación"}:
              </p>
              <p className="text-sm text-gray-500">
                {expiryDate.toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        )}

        {/* Beneficios según el plan */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">Beneficios de tu plan:</h4>
          <ul className="space-y-1">
            {subscription.planId === SubscriptionPlan.BASIC && (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Hasta 10 grabaciones al mes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Transcripciones básicas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Resúmenes automáticos</span>
                </li>
              </>
            )}
            
            {subscription.planId === SubscriptionPlan.PRO && (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Hasta 50 grabaciones al mes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Transcripciones avanzadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Resúmenes detallados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Exportación en múltiples formatos</span>
                </li>
              </>
            )}
            
            {subscription.planId === SubscriptionPlan.ENTERPRISE && (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Grabaciones ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Transcripciones premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Análisis de sentimiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Soporte 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Integraciones personalizadas</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isActive && (
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/subscription?tab=upgrade">
                Cambiar Plan
              </Link>
            </Button>
            <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600">
              Cancelar Suscripción
            </Button>
          </>
        )}
        
        {(isCancelled || subscription.status === 'none') && (
          <Button asChild>
            <Link href="/dashboard/subscription?tab=upgrade">
              Renovar Suscripción
            </Link>
          </Button>
        )}
        
        {isPending && (
          <Button variant="outline" asChild>
            <Link href="/dashboard/payment/status">
              Verificar Estado
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 