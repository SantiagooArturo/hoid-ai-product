"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Este es un componente de prueba simplificado para verificar MercadoPago
// NO USAR EN PRODUCCIÓN
export function PricingPlansTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleTestCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al endpoint de prueba
      const response = await fetch('/api/subscription/test');
      
      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Datos de prueba:', data);
      
      // Verificar que hay URL de checkout
      const checkoutUrl = data.initPoint || data.sandboxInitPoint;
      
      if (checkoutUrl) {
        // Redireccionar a MercadoPago
        console.log('Redirigiendo a:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No se recibió una URL válida para el checkout');
      }
      
    } catch (error) {
      console.error('Error en prueba de MercadoPago:', error);
      toast({
        title: "Error en la prueba",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Prueba de MercadoPago</CardTitle>
          <CardDescription>Prueba rápida de integración con MercadoPago</CardDescription>
        </CardHeader>
        
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span>Plan Básico de prueba</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span>$9.99 USD</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span>Sin autenticación</span>
            </li>
          </ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleTestCheckout}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : "Probar Checkout"}
          </Button>
        </CardFooter>
      </Card>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md max-w-md mx-auto">
          <h3 className="text-red-700 font-medium mb-2">Error:</h3>
          <pre className="text-xs overflow-auto max-h-40 p-2 bg-red-100 rounded">
            {error}
          </pre>
        </div>
      )}
    </div>
  );
} 