import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin si aún no está inicializado
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );
    
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Obtener userId de los parámetros (para casos de administradores)
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId') || uid;
    
    // Si el usuario solicita datos de otro usuario, verificar si es admin
    // (Implementación básica, mejorar según necesidades)
    if (requestedUserId !== uid) {
      // Aquí podrías agregar una verificación si el usuario tiene rol de administrador
      return NextResponse.json(
        { error: 'No autorizado para ver datos de otro usuario' },
        { status: 403 }
      );
    }
    
    // Contar documentos en la colección 'recordings' para el usuario
    const db = getFirestore();
    const recordingsSnapshot = await db
      .collection('recordings')
      .where('userId', '==', requestedUserId)
      .count()
      .get();
    
    const count = recordingsSnapshot.data().count;
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error al obtener recuento de grabaciones:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener recuento de grabaciones',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 