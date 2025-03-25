// Tipos de planes de suscripción disponibles
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// Añadir el enum SubscriptionStatus con todos los estados posibles
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  TRIAL = 'trial',
  EXPIRED = 'expired'
}

// Límites para cada plan de suscripción
export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxRecordings: 10,
    maxDurationMinutes: 10,
    maxStorageMB: 100,
    features: {
      transcription: true,
      basicSummary: true,
      mindMaps: false,
      flashcards: false,
      studyGuides: false,
      export: false,
      sharing: false
    }
  },
  [SubscriptionPlan.BASIC]: {
    maxRecordings: 50,
    maxDurationMinutes: 30,
    maxStorageMB: 500,
    features: {
      transcription: true,
      basicSummary: true,
      mindMaps: true,
      flashcards: false,
      studyGuides: false,
      export: true,
      sharing: false
    }
  },
  [SubscriptionPlan.PRO]: {
    maxRecordings: 200,
    maxDurationMinutes: 120,
    maxStorageMB: 2000,
    features: {
      transcription: true,
      basicSummary: true,
      mindMaps: true,
      flashcards: true,
      studyGuides: true,
      export: true,
      sharing: true
    }
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxRecordings: Infinity,
    maxDurationMinutes: Infinity,
    maxStorageMB: Infinity,
    features: {
      transcription: true,
      basicSummary: true,
      mindMaps: true,
      flashcards: true,
      studyGuides: true,
      export: true,
      sharing: true
    }
  }
};

// Información de precios (en USD)
export const PLAN_PRICES = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.BASIC]: 9.99,
  [SubscriptionPlan.PRO]: 19.99,
  [SubscriptionPlan.ENTERPRISE]: 49.99
};

// Interfaz para la información de suscripción de un usuario
export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
} 