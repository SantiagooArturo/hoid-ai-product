"use client"

import { useSearchParams } from 'next/navigation';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SubscriptionFailurePage() {
  const searchParams = useSearchParams();
  
  // Obtener información de error
  const errorCode = searchParams.get('error') || '';
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
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <CardTitle className="text-2xl">Pago no completado</CardTitle>
                <CardDescription>
                  Lo sentimos, hubo un problema con tu pago
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 mb-4">
                    <p className="font-medium">El pago no pudo ser procesado</p>
                    {errorCode && (
                      <p className="text-sm mt-2">Razón: {errorCode}</p>
                    )}
                    <p className="text-sm mt-2">ID de pago: {paymentId}</p>
                  </div>
                  
                  <p className="text-gray-700">
                    Es posible que haya habido un problema con tu método de pago o la transacción fue rechazada. 
                    Por favor, intenta nuevamente con otro método de pago.
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
                  <Link href="/dashboard/subscription?tab=upgrade">
                    Intentar nuevamente
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