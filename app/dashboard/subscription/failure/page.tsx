"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/sidebar"

export default function SubscriptionFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  // Obtener parámetros de la URL
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const errorMessage = searchParams.get('error') || 'El pago no pudo ser procesado.'
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-2xl">Error en el pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 py-4">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-red-600 dark:text-red-400 text-sm text-left">
                        {errorMessage}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mt-4">
                      {paymentId && <p>ID de Pago: {paymentId}</p>}
                      {status && <p>Estado: {status}</p>}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                      Por favor, intenta nuevamente o contacta a soporte si el problema persiste.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard')} 
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Ir al Dashboard
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard/subscription')} 
                    className="flex items-center"
                  >
                    Intentar nuevamente
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 