import { NextResponse } from 'next/server';

// Endpoint de prueba - NO USAR EN PRODUCCIÓN
export async function GET(req: Request) {
  try {
    // URL de la API de MercadoPago para crear preferencias
    const apiUrl = 'https://api.mercadopago.com/checkout/preferences';
    
    // Token de acceso
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
    }

    // Obtener userId de la URL si está disponible
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'test_user_123';

    // Datos básicos para una preferencia de pago de prueba
    const preference = {
      items: [
        {
          id: 'test-item-1',
          title: 'Plan Básico de Prueba',
          quantity: 1,
          unit_price: 12.00,
          currency_id: 'PEN',
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription/success?userId=${userId}`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription/failure?userId=${userId}`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription/pending?userId=${userId}`,
      },
      // Añadir metadata con el ID del usuario
      metadata: {
        user_id: userId
      },
      // Añadir referencia externa para identificar al usuario
      external_reference: `user_${userId}`,
      // Añadir información del pagador para evitar el error de "no puedes pagarte a ti mismo"
      payer: {
        name: "Test",
        surname: "User",
        email: "test_user_12345678@testuser.com", // Usa un email ficticio diferente al de tu cuenta
      },
      // Configurar notificación para actualizar estado de suscripción
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/mercadopago?userId=${userId}&planId=test-item-1`
    };

    console.log('Creando preferencia de prueba:', JSON.stringify(preference, null, 2));

    // Crear la preferencia directamente usando fetch
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });
    
    // Obtener el texto completo de la respuesta para debug
    const responseText = await response.text();
    let result;
    
    try {
      // Intentar parsear la respuesta como JSON
      result = JSON.parse(responseText);
    } catch (e) {
      // Si no es JSON, mantener como texto
      result = { raw_response: responseText };
    }
    
    if (!response.ok) {
      console.error('Error en respuesta de MercadoPago:', response.status, responseText);
      throw new Error(`Error de MercadoPago: ${response.status} - ${responseText}`);
    }
    
    console.log('Respuesta de MercadoPago:', JSON.stringify(result, null, 2));

    // Devolver un formato con información detallada para debug
    return NextResponse.json({
      success: true,
      debug: {
        preference: preference,
        mercadopagoUrl: apiUrl,
        accessTokenFirstChars: accessToken.substring(0, 10) + '...',
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      },
      result: result,
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point
    });
  } catch (error) {
    console.error('Error al crear preferencia de prueba:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear preferencia de prueba', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 