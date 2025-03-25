import { PricingPlansTest } from '@/components/pricing-plans-test';

export default function TestMercadoPagoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Prueba de Integración con MercadoPago
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          <p className="text-sm">
            <strong>Esta es una página de prueba.</strong> Utiliza una integración simplificada con MercadoPago 
            sin requerir autenticación. Los pagos realizados aquí son solo para probar la integración.
          </p>
        </div>
        
        <PricingPlansTest />
      </div>
    </div>
  );
} 