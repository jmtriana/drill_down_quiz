import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { SyncMessage } from '../types';
import { getFirebaseConfig } from '../config/firebase';

let db: any = null;

export async function initFirebaseSync(sessionId: string): Promise<boolean> {
  try {
    const config = getFirebaseConfig();
    if (!config) {
      console.warn('firestoreSync: Firebase config not found');
      return false;
    }

    const app = initializeApp(config);
    db = getFirestore(app);
    console.log('firestoreSync: Firebase initialized for session (write-only mode)', sessionId);
    return true;
  } catch (e) {
    console.error('firestoreSync: init failed', e);
    return false;
  }
}

export async function sendFirestoreMessage(sessionId: string, msg: SyncMessage) {
  if (!db) {
    console.warn('firestoreSync: not initialized');
    return;
  }

  try {
    const messagesRef = collection(db, 'sessions', sessionId, 'messages');
    await addDoc(messagesRef, {
      ...msg,
      timestamp: Timestamp.now(),
    });
    console.log('firestoreSync: wrote change', msg.type);
  } catch (e) {
    console.error('firestoreSync: write failed', e);
  }
}

export function subscribeFirestore(sessionId: string, onMessage: (m: SyncMessage) => void) {
  // Write-only mode: no listeners. Sync happens locally via IndexedDB/BroadcastChannel.
  // Firestore is used only for persistence and remote device access.
  return () => {};
}

export function closeFirebase() {
  db = null;
}
