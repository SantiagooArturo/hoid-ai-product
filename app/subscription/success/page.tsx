"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SubscriptionSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Verificar estado del pago al cargar la página
  useEffect(() => {
    if (!user) {
      return; // Esperar a que el usuario esté autenticado
    }

    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    if (status !== 'approved') {
      setError('El pago no ha sido aprobado. Estado: ' + status);
      setLoading(false);
      return;
    }

    // Opcionalmente, podríamos verificar el estado del pago con el servidor
    // pero ya deberíamos haber recibido la notificación por webhook
    
    setLoading(false);
  }, [searchParams, user]);

  // Redirigir a dashboard después de 5 segundos
  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loading, error, router]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">¡Pago exitoso!</CardTitle>
          <CardDescription className="text-center">
            Tu suscripción ha sido activada correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center">Verificando estado del pago...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <p className="text-center">
              Gracias por unirte a Hoid AI. Tu cuenta ha sido actualizada y ya puedes
              disfrutar de todas las funcionalidades premium.
              <br /><br />
              Serás redirigido al dashboard en unos segundos...
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">
              Ir al Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 