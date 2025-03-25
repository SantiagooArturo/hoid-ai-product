"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SubscriptionPending() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-center text-2xl">Pago en proceso</CardTitle>
          <CardDescription className="text-center">
            Tu suscripción está pendiente de confirmación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Estamos procesando tu pago. Este proceso puede tomar algunos minutos o incluso horas, 
            dependiendo del método de pago elegido.
          </p>
          <p className="text-center mt-4">
            Recibirás una notificación por correo electrónico cuando tu suscripción esté activa.
          </p>
          {paymentId && (
            <p className="text-center text-sm text-gray-500 mt-4">
              ID de pago: {paymentId}
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