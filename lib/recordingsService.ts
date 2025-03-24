import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interfaces
export interface GeneratedContent {
  transcription: string;
  summary: string;
  studyGuide: string;
  quickReview?: string;
  mindMap?: string;
  flashcards?: string;
}

export interface Recording {
  id: string;
  userId: string;
  title: string;
  date: string;
  duration: string;
  size: string;
  content: GeneratedContent;
  createdAt: any;
  updatedAt: any;
}

// Constantes
const RECORDINGS_COLLECTION = 'recordings';

/**
 * Guarda una nueva grabación en Firestore
 */
export const saveRecording = async (
  userId: string,
  title: string,
  duration: string,
  content: GeneratedContent
): Promise<Recording> => {
  try {
    // Calcular tamaño aproximado
    const contentString = JSON.stringify(content);
    const contentSize = (new Blob([contentString]).size / 1024).toFixed(1);
    
    // Crear objeto de grabación
    const recordingData = {
      userId,
      title,
      date: new Date().toISOString().split('T')[0],
      duration,
      size: `${contentSize} KB`,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Guardar en Firestore
    const docRef = await addDoc(collection(db, RECORDINGS_COLLECTION), recordingData);
    
    console.log('Grabación guardada en Firebase:', docRef.id);
    
    return {
      id: docRef.id,
      ...recordingData
    } as Recording;
  } catch (error) {
    console.error('Error al guardar la grabación en Firebase:', error);
    throw new Error('No se pudo guardar la grabación');
  }
};

/**
 * Obtiene todas las grabaciones de un usuario
 */
export const getUserRecordings = async (userId: string): Promise<Recording[]> => {
  try {
    const q = query(
      collection(db, RECORDINGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const recordings: Recording[] = [];
    
    querySnapshot.forEach((doc) => {
      recordings.push({
        id: doc.id,
        ...doc.data()
      } as Recording);
    });
    
    return recordings;
  } catch (error) {
    console.error('Error al obtener las grabaciones:', error);
    throw new Error('No se pudieron obtener las grabaciones');
  }
};

/**
 * Obtiene una grabación específica
 */
export const getRecording = async (recordingId: string): Promise<Recording | null> => {
  try {
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Recording;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener la grabación:', error);
    throw new Error('No se pudo obtener la grabación');
  }
};

/**
 * Actualiza una grabación existente
 */
export const updateRecording = async (
  recordingId: string,
  data: Partial<Omit<Recording, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar la grabación:', error);
    throw new Error('No se pudo actualizar la grabación');
  }
};

/**
 * Actualiza el contenido de una grabación 
 * (por ejemplo, para añadir flashcards o mapas mentales a una grabación existente)
 */
export const updateRecordingContent = async (
  recordingId: string,
  contentUpdates: Partial<GeneratedContent>
): Promise<void> => {
  try {
    // Primero obtener la grabación actual
    const recording = await getRecording(recordingId);
    
    if (!recording) {
      throw new Error('Grabación no encontrada');
    }
    
    // Combinar el contenido actual con las actualizaciones
    const updatedContent = {
      ...recording.content,
      ...contentUpdates
    };
    
    // Actualizar el documento
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    await updateDoc(docRef, {
      content: updatedContent,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar el contenido de la grabación:', error);
    throw new Error('No se pudo actualizar el contenido de la grabación');
  }
};

/**
 * Elimina una grabación
 */
export const deleteRecording = async (recordingId: string): Promise<void> => {
  try {
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar la grabación:', error);
    throw new Error('No se pudo eliminar la grabación');
  }
};

/**
 * Migra las grabaciones de localStorage a Firebase (solo se usa una vez por usuario)
 */
export const migrateLocalStorageToFirebase = async (userId: string): Promise<void> => {
  try {
    if (typeof window === 'undefined') return;
    
    const savedRecordings = localStorage.getItem('recordings');
    if (!savedRecordings) return;
    
    const recordings = JSON.parse(savedRecordings);
    if (!Array.isArray(recordings) || recordings.length === 0) return;
    
    // Migrar cada grabación
    for (const rec of recordings) {
      await saveRecording(
        userId,
        rec.title,
        rec.duration,
        rec.content
      );
    }
    
    console.log(`Migradas ${recordings.length} grabaciones de localStorage a Firebase`);
    
    // Opcionalmente, eliminar de localStorage después de migrar
    // localStorage.removeItem('recordings');
  } catch (error) {
    console.error('Error al migrar grabaciones a Firebase:', error);
    throw new Error('No se pudieron migrar las grabaciones');
  }
}; 