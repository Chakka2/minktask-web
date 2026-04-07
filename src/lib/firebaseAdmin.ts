import { getApps, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function parsePrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  return key ? key.replace(/\\n/g, '\n') : undefined;
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(),
    }),
  });
}

export const adminDb = getFirestore();
