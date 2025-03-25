"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase'; // Importamos auth directamente
import Script from 'next/script';

interface CheckoutFormProps {
  planId: 'basic' | 'pro' | 'enterprise';
  title: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

export default function CheckoutForm({ planId, title, price, currency, description, features }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Función para iniciar el proceso de checkout
  const handleCheckout = async () => {
    if (!user) {
      setError('Debes iniciar sesión para suscribirte');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener token de autenticación directamente desde Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No se pudo obtener el usuario actual. Por favor, inicia sesión nuevamente.");
      }
      
      const token = await currentUser.getIdToken(true);

      // Crear preferencia de pago
      const response = await fetch('/api/subscription/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la preferencia de pago');
      }

      const { preferenceId, publicKey, initPoint, sandboxInitPoint } = await response.json();

      // Determinar la URL del checkout
      const checkoutUrl = initPoint || sandboxInitPoint;
      
      if (checkoutUrl) {
        // Redireccionar directamente al checkout
        window.location.href = checkoutUrl;
      } else if (preferenceId && publicKey) {
        // Si no hay URL directa, usar el SDK de MercadoPago
        if ((window as any).MercadoPago) {
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
          throw new Error('MercadoPago SDK no está disponible');
        }
      } else {
        throw new Error('La API no devolvió una respuesta válida');
      }

    } catch (err: any) {
      console.error('Error al iniciar checkout:', err);
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="lazyOnload"
      />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="mt-2 text-3xl font-bold">
            {currency === 'PEN' ? 'S/ ' : '$'}{price.toFixed(2)}
            <span className="text-sm font-normal ml-1">/mes</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCheckout} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Suscribirse'
            )}
          </Button>
          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
} 