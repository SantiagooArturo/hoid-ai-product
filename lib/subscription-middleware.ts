import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { SubscriptionPlan } from './types';

// Inicializar Firebase Admin si aún no está inicializado
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );
  
  initializeApp({
    credential: cert(serviceAccount)
  });
}

// Mapeo de rutas a características requeridas
const FEATURE_REQUIREMENTS: Record<string, keyof typeof SubscriptionPlan['features']> = {
  '/api/generate-study-guide': 'studyGuides',
  '/api/generate-study-material': 'studyGuides',
  '/api/generate-quick-review': 'basicSummary',
  '/api/transcribe-audio': 'transcription',
  // Añade más mapeos según sea necesario
};

/**
 * Middleware para verificar permisos de suscripción
 */
export async function validateSubscription(req: NextRequest) {
  try {
    // 1. Extraer token de autorización
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // 2. Verificar token y obtener uid
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // 3. Obtener datos de suscripción del usuario
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // 4. Obtener plan de suscripción
    const plan = (userData.subscription?.plan || SubscriptionPlan.FREE) as SubscriptionPlan;
    
    // 5. Verificar si la ruta requiere alguna característica específica
    const path = req.nextUrl.pathname;
    const requiredFeature = FEATURE_REQUIREMENTS[path];
    
    if (requiredFeature) {
      // Obtener restricciones del plan
      const hasAccess = PLAN_LIMITS[plan].features[requiredFeature];
      
      if (!hasAccess) {
        return NextResponse.json(
          { 
            error: 'Acceso denegado',
            message: 'Esta característica requiere un plan de suscripción superior',
            requiredFeature,
            currentPlan: plan
          },
          { status: 403 }
        );
      }
    }
    
    // 6. Verificar límites específicos (ej. duración de grabación)
    // Implementa lógica específica según tus necesidades
    
    // 7. Si todo está bien, continuar con la solicitud
    return NextResponse.next();
  } catch (error) {
    console.error('Error al validar suscripción:', error);
    return NextResponse.json(
      { error: 'Error de autenticación' },
      { status: 401 }
    );
  }
} 