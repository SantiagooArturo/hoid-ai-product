import PricingPlans from '@/components/subscription/pricing-plans';

export const metadata = {
  title: 'Planes y Precios - Hoid AI',
  description: 'Elige el plan de suscripción que mejor se adapte a tus necesidades',
};

export default function PricingPage() {
  return (
    <main className="container mx-auto py-8">
      <PricingPlans />
    </main>
  );
} 