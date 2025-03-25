"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ExternalLink, CreditCard } from "lucide-react";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';

// Definición temporal de planes para testing
const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    title: 'Básico',
    price: 12.00,
    currency: 'PEN',
    description: 'Para uso personal',
    features: [
      'Hasta 10 grabaciones al mes',
      'Transcripciones básicas',
      'Resúmenes automáticos',
      'Soporte por email'
    ]
  },
  {
    id: 'pro',
    title: 'Profesional',
    price: 35.00,
    currency: 'PEN',
    description: 'Para profesionales',
    features: [
      'Hasta 50 grabaciones al mes',
      'Transcripciones avanzadas',
      'Resúmenes detallados',
      'Soporte prioritario',
      'Exportación en múltiples formatos'
    ]
  },
  {
    id: 'enterprise',
    title: 'Empresarial',
    price: 80.00,
    currency: 'PEN',
    description: 'Para equipos',
    features: [
      'Grabaciones ilimitadas',
      'Transcripciones premium',
      'Análisis de sentimiento',
      'Soporte 24/7',
      'Integraciones personalizadas',
      'Acceso API completo'
    ]
  }
];

export default function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();

  const handleSelectPlan = async (planId: string) => {
    try {
      setSelectedPlan(planId);
      setLoading(true);
      setError(null);
      setCheckoutData(null);

      if (!user) {
        throw new Error('Debes iniciar sesión para suscribirte');
      }

      // Usar el endpoint de prueba que no requiere Firebase
      const response = await fetch(`/api/subscription/test?userId=${user.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la preferencia de pago');
      }

      const data = await response.json();
      
      // Guardar la información y mostrar el diálogo
      setCheckoutData(data);
      setShowDialog(true);

    } catch (err: any) {
      console.error('Error al iniciar checkout:', err);
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToCheckout = () => {
    if (checkoutData && checkoutData.sandboxInitPoint) {
      window.open(checkoutData.sandboxInitPoint, '_blank');
    }
    setShowDialog(false);
  };

  // Encontrar el plan seleccionado
  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card key={plan.id} className="w-full">
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-2 text-3xl font-bold">
                {plan.currency === 'PEN' ? 'S/ ' : '$'}{plan.price.toFixed(2)}
                <span className="text-sm font-normal ml-1">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSelectPlan(plan.id)} 
                disabled={loading || !user} 
                className="w-full"
              >
                {loading && selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Suscribirse'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
        {error && (
          <div className="col-span-1 md:col-span-3 p-4 mt-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Diálogo con información de checkout simplificada */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar suscripción</DialogTitle>
            <DialogDescription>
              Estás a punto de suscribirte al plan {currentPlan?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentPlan && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Plan:</span>
                    <span>{currentPlan.title}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Precio:</span>
                    <span>S/ {currentPlan.price.toFixed(2)}/mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Método de pago:</span>
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" />
                      MercadoPago
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Al continuar serás redirigido a la página de pago seguro de MercadoPago para completar tu suscripción.
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContinueToCheckout}>
              Continuar al pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 