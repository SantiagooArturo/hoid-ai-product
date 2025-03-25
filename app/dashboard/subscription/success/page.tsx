"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/sidebar"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Obtener parámetros de la URL
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')
  
  useEffect(() => {
    // Simular un tiempo de carga para asegurarnos de que los webhooks se procesen
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
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
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl">¡Pago exitoso!</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-6">
                      <div className="mx-auto w-8 h-8 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Estamos activando tu suscripción...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <p className="text-green-600 dark:text-green-400 font-semibold">
                        Tu suscripción al Plan {getPlanName()} ha sido activada correctamente.
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <p>ID de Pago: {paymentId}</p>
                        <p>Estado: {status}</p>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-4">
                        ¡Ahora puedes disfrutar de todas las funcionalidades de tu plan!
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    onClick={() => router.push('/dashboard')} 
                    disabled={loading}
                    className="flex items-center"
                  >
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
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