import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const keyPath = resolve(process.cwd(), 'serviceAccountKey.json');

if (getApps().length === 0) {
  const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();