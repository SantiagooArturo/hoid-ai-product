import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { SubscriptionPlan, SubscriptionInfo } from '@/lib/types';

// Tipo para el usuario con datos adicionales
interface User extends FirebaseUser {
  occupation?: string;
  subscription?: SubscriptionInfo;
}

// Tipo para los datos del usuario en Firestore
interface UserData {
  email: string;
  occupation: string;
  createdAt: any;
  lastLoginAt: any;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd?: any;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    cancelAtPeriodEnd?: boolean;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Observador del estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si hay un usuario, obtener sus datos adicionales de Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data() as UserData;
          
          // Combinar datos de Auth y Firestore
          const subscription = userData?.subscription ? {
            plan: userData.subscription.plan as SubscriptionPlan,
            status: userData.subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing',
            currentPeriodEnd: userData.subscription.currentPeriodEnd?.toDate(),
            stripeCustomerId: userData.subscription.stripeCustomerId,
            stripeSubscriptionId: userData.subscription.stripeSubscriptionId,
            cancelAtPeriodEnd: userData.subscription.cancelAtPeriodEnd
          } : {
            plan: SubscriptionPlan.FREE,
            status: 'active' as const
          };
          
          setUser({
            ...firebaseUser,
            occupation: userData?.occupation,
            subscription
          });
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser(firebaseUser as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, occupation: string) => {
    try {
      setError(null);
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      // Crear documento del usuario en Firestore con plan gratuito por defecto
      const userData: UserData = {
        email,
        occupation,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        subscription: {
          plan: SubscriptionPlan.FREE,
          status: 'active'
        }
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Actualizar estado local
      setUser({
        ...firebaseUser,
        occupation,
        subscription: {
          plan: SubscriptionPlan.FREE,
          status: 'active'
        }
      });

      return firebaseUser;
    } catch (err: any) {
      console.error('Signup error:', err);
      // Manejar errores específicos de Firebase
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este email ya está registrado');
          break;
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/operation-not-allowed':
          setError('Operación no permitida');
          break;
        case 'auth/weak-password':
          setError('La contraseña es muy débil');
          break;
        default:
          setError('Error al crear la cuenta');
      }
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      // Obtener datos adicionales de Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data() as UserData;

      // Actualizar lastLoginAt
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      // Actualizar estado local
      setUser({
        ...firebaseUser,
        occupation: userData?.occupation
      });

      return firebaseUser;
    } catch (err: any) {
      console.error('Login error:', err);
      // Manejar errores específicos de Firebase
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/user-disabled':
          setError('Usuario deshabilitado');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Email o contraseña incorrectos');
          break;
        default:
          setError('Error al iniciar sesión');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Error al cerrar sesión');
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout
  };
} 