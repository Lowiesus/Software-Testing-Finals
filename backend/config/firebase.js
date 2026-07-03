import dotenv from 'dotenv';

dotenv.config();

let authInstance = null;

export async function getFirebaseAuth() {
  if (authInstance) return authInstance;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return null;
  }

  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }

    authInstance = getAuth();
    console.log('Firebase initialized successfully');
    return authInstance;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error.message);
    return null;
  }
}
