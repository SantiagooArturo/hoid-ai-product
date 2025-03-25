"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Clock, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/sidebar"

export default function SubscriptionPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  // Obtener parámetros de la URL
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')
  
  // Extraer información del plan del external_reference
  const getPlanName = () => {
    if (!externalReference) return "seleccionado"
    
    if (externalReference.includes('basic')) {
      return "Básico"
    } else if (externalReference.includes('pro')) {
      return "Pro"
    } else if (externalReference.includes('enterprise')) {
      return "Empresarial"
    }
    
    return "seleccionado"
  }
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle className="text-2xl">Pago pendiente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 py-4">
                    <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                      Tu pago para el Plan {getPlanName()} está siendo procesado.
                    </p>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mt-4">
                      {paymentId && <p>ID de Pago: {paymentId}</p>}
                      {status && <p>Estado: {status}</p>}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                      El pago está pendiente de confirmación. Una vez confirmado, tu suscripción se activará automáticamente.
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
                    onClick={() => window.location.reload()} 
                    className="flex items-center"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar estado
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