"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SubscriptionFailure() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'rejected';
  const paymentId = searchParams.get('payment_id');

  let errorMessage = "Hubo un problema al procesar tu pago.";

  // Personalizar mensaje según el tipo de error
  switch (status) {
    case 'rejected':
      errorMessage = "Tu pago fue rechazado. Por favor, intenta con otro método de pago.";
      break;
    case 'cc_rejected_bad_filled_card_number':
      errorMessage = "El número de tarjeta ingresado es incorrecto.";
      break;
    case 'cc_rejected_bad_filled_date':
      errorMessage = "La fecha de vencimiento ingresada es incorrecta.";
      break;
    case 'cc_rejected_bad_filled_security_code':
      errorMessage = "El código de seguridad ingresado es incorrecto.";
      break;
    case 'cc_rejected_insufficient_amount':
      errorMessage = "La tarjeta no tiene fondos suficientes.";
      break;
    default:
      errorMessage = `Tu pago no pudo ser procesado. Por favor, inténtalo nuevamente. (Estado: ${status})`;
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-center text-2xl">Error en el pago</CardTitle>
          <CardDescription className="text-center">
            No se pudo completar tu suscripción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">{errorMessage}</p>
          {paymentId && (
            <p className="text-center text-sm text-gray-500 mt-2">
              ID de pago: {paymentId}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Cancelar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/pricing">
              Intentar nuevamente
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 