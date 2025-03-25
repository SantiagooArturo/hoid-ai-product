import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionPlan, PLAN_LIMITS, PLAN_PRICES } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function SubscriptionStatus() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // @ts-ignore - plan viene de la extensión de User en useAuth.ts
  const plan = user.subscription?.plan || SubscriptionPlan.FREE;
  const planLimits = PLAN_LIMITS[plan];
  const planPrice = PLAN_PRICES[plan];
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Tu plan actual: {capitalizeFirstLetter(plan)}</CardTitle>
        <CardDescription>
          {plan === SubscriptionPlan.FREE 
            ? 'Plan gratuito con funcionalidades básicas' 
            : `$${planPrice}/mes`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Grabaciones</span>
            <span>{planLimits.maxRecordings === Infinity ? 'Ilimitadas' : planLimits.maxRecordings}</span>
          </div>
          {planLimits.maxRecordings !== Infinity && (
            <Progress value={(0 / planLimits.maxRecordings) * 100} className="h-2" />
          )}
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Duración máxima</span>
            <span>{planLimits.maxDurationMinutes === Infinity ? 'Ilimitada' : `${planLimits.maxDurationMinutes} min`}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Almacenamiento</span>
            <span>{planLimits.maxStorageMB === Infinity ? 'Ilimitado' : `${planLimits.maxStorageMB} MB`}</span>
          </div>
        </div>
        
        <div className="pt-4">
          <h4 className="font-medium mb-2">Características incluidas:</h4>
          <ul className="space-y-1 text-sm">
            {Object.entries(planLimits.features).map(([feature, enabled]) => (
              <li key={feature} className={`flex items-center ${enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 line-through'}`}>
                {enabled ? '✓' : '✗'} {formatFeatureName(feature)}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        {plan === SubscriptionPlan.FREE && (
          <Button className="w-full">Actualizar plan</Button>
        )}
        {plan !== SubscriptionPlan.FREE && (
          <Button variant="outline" className="w-full">Gestionar suscripción</Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Función auxiliar para formatear nombres de características
function formatFeatureName(feature: string): string {
  const names: Record<string, string> = {
    transcription: 'Transcripción',
    basicSummary: 'Resumen básico',
    mindMaps: 'Mapas mentales',
    flashcards: 'Flashcards',
    studyGuides: 'Guías de estudio',
    export: 'Exportación',
    sharing: 'Compartir grabaciones'
  };
  
  return names[feature] || capitalizeFirstLetter(feature);
} 