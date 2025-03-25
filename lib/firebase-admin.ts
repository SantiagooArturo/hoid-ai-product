import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin si aún no está inicializado
let app: App;

if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );
    
    app = initializeApp({
      credential: cert(serviceAccount)
    });
    
    console.log('Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
    throw new Error('No se pudo inicializar Firebase Admin. Verifica la configuración de FIREBASE_SERVICE_ACCOUNT_KEY.');
  }
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app); 