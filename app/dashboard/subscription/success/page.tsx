"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  
  useEffect(() => {
    async function verifyPayment() {
      try {
        // Obtener información de la URL
        const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id')
        const userId = searchParams.get('userId')
        
        if (!paymentId) {
          setError('No se pudo identificar el pago')
          setLoading(false)
          return
        }

        // Llamar a nuestro webhook para procesar el pago (solo si no se recibió notificación directa)
        const response = await fetch(`/api/webhook/mercadopago?paymentId=${paymentId}&userId=${userId}`, {
          method: 'POST'
        })

        const data = await response.json()
        
        if (data.success) {
          setPaymentStatus('success')
        } else {
          setError(data.error || 'No se pudo verificar el estado del pago')
        }
      } catch (err) {
        console.error('Error al verificar pago:', err)
        setError('Ocurrió un error al verificar el estado de tu pago')
      } finally {
        setLoading(false)
      }
    }
    
    // Verificar después de un breve retraso para dar tiempo a MercadoPago
    const timer = setTimeout(() => {
      verifyPayment()
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [searchParams, router])
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader className="pb-3 text-center">
                <div className="flex justify-center mb-4">
                  {loading ? (
                    <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
                  ) : (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  )}
                </div>
                <CardTitle className="text-2xl">¡Pago exitoso!</CardTitle>
                <CardDescription>
                  {loading 
                    ? 'Estamos procesando tu pago...' 
                    : 'Tu suscripción ha sido activada correctamente'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                {loading ? (
                  <p className="text-gray-500">Este proceso puede tardar unos momentos, no cierres esta ventana.</p>
                ) : error ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 mb-4">
                    <p className="font-medium">Atención:</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-sm mt-2">El pago ha sido recibido, pero puede tomar unos minutos en reflejarse en tu cuenta.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      ¡Gracias por tu suscripción! Ahora tienes acceso a todas las funcionalidades premium de Hoid AI.
                    </p>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                      <p>Tu suscripción está activa. ¡Disfruta de todos los beneficios!</p>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-center pt-2">
                <Button asChild className="min-w-32">
                  <Link href="/dashboard">
                    Ir al Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 