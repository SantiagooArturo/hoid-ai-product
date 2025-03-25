"use client"

import { useSearchParams } from 'next/navigation';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPendingPage() {
  const searchParams = useSearchParams();
  
  // Obtener información del pago
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || 'No disponible';
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader className="pb-3 text-center">
                <div className="flex justify-center mb-4">
                  <Clock className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">Pago pendiente</CardTitle>
                <CardDescription>
                  Tu pago está siendo procesado
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 mb-4">
                    <p className="font-medium">Tu pago está en proceso de verificación</p>
                    <p className="text-sm mt-2">ID de pago: {paymentId}</p>
                  </div>
                  
                  <p className="text-gray-700">
                    Tu pago está siendo procesado. Esto puede tardar hasta 24 horas dependiendo del método de pago seleccionado.
                    Una vez confirmado, tu suscripción se activará automáticamente.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center gap-3 pt-2">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    Ir al Dashboard
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/subscription?tab=current">
                    Ver estado actual
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 