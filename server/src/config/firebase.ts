import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadServiceAccount(): ServiceAccount {
  // Production (Render): read from env vars
  const envProjectId = process.env.FIREBASE_PROJECT_ID;
  const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const envPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (envProjectId && envClientEmail && envPrivateKey) {
    return {
      projectId: envProjectId,
      clientEmail: envClientEmail,
      // Render/env stores literal \n — convert to real newlines
      privateKey: envPrivateKey.replace(/\\n/g, '\n'),
    };
  }

  // Local development: read from serviceAccountKey.json
  const keyPath = resolve(process.cwd(), 'serviceAccountKey.json');
  return JSON.parse(readFileSync(keyPath, 'utf-8')) as ServiceAccount;
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(loadServiceAccount()),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
