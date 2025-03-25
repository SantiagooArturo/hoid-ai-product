import { SubscriptionPlan } from './types';

// Credenciales
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-2545724410031502-032418-952b533e4da698a363f1ccafe07a4c88-761128084';
export const MERCADOPAGO_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY || 'TEST-fd6bd045-531f-44a9-a3fa-d04e979a83af';

// Definir planes de suscripción
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic_monthly',
    title: 'Plan Básico',
    name: 'Plan Básico Mensual',
    description: 'Acceso a funciones básicas de Hoid AI',
    price: 12.00,
    currency: 'PEN',
    interval: 'month',
    frequency: 1,
    internalName: SubscriptionPlan.BASIC
  },
  pro: {
    id: 'pro_monthly',
    title: 'Plan Pro',
    name: 'Plan Pro Mensual',
    description: 'Acceso a funciones avanzadas y mayor capacidad',
    price: 35.00,
    currency: 'PEN',
    interval: 'month',
    frequency: 1,
    internalName: SubscriptionPlan.PRO
  },
  enterprise: {
    id: 'enterprise_monthly',
    title: 'Plan Empresarial',
    name: 'Plan Empresarial Mensual',
    description: 'Acceso ilimitado para equipos y empresas',
    price: 80.00,
    currency: 'PEN',
    interval: 'month',
    frequency: 1,
    internalName: SubscriptionPlan.ENTERPRISE
  }
};

// Tipo básico para la respuesta de MercadoPago
export interface MercadoPagoResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

// Función para crear preferencia directamente usando fetch
export async function createSubscriptionPreference(preferenceData: any): Promise<MercadoPagoResponse> {
  try {
    console.log('Creando preferencia con datos:', JSON.stringify(preferenceData));
    
    // Verificar que hay ítems
    if (!preferenceData.items || preferenceData.items.length === 0) {
      throw new Error('La preferencia debe incluir al menos un ítem');
    }
    
    // Hacer la petición a MercadoPago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData),
    });
    
    // Verificar si hay error en la respuesta
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta de MercadoPago:', response.status, errorText);
      throw new Error(`Error en API de MercadoPago: ${response.status} - ${errorText}`);
    }
    
    // Procesar respuesta exitosa
    const data = await response.json();
    console.log('Respuesta de MercadoPago:', JSON.stringify(data));
    
    // Devolver solo los datos necesarios
    return {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    };
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    throw error;
  }
}

// Función para obtener estado de un pago
export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener estado del pago:', response.status, errorText);
      throw new Error(`Error al obtener pago: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener estado del pago:', error);
    throw error;
  }
} 