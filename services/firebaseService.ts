import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, update, push, onValue } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import type { Player, PlayerAnswer } from '../types';

let db: ReturnType<typeof getDatabase> | null = null;
export let lastAuthError: any = null;

export function initFirebase(): boolean {
  try {
    if (getApps().length) return true;

    // support both VITE_FIREBASE_* and VITE_FB_* env var naming
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FB_API_KEY;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FB_AUTH_DOMAIN;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FB_PROJECT_ID;
    const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL || import.meta.env.VITE_FB_DATABASE_URL;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.VITE_FB_APP_ID;

    if (!apiKey || !databaseURL) {
      console.warn('Firebase env vars not provided; skipping initialization. (checked VITE_FIREBASE_* and VITE_FB_*)');
      return false;
    }

    const app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      databaseURL,
      appId,
    });

    db = getDatabase(app);
    // try anonymous sign-in so RTDB rules allowing authenticated users will work
    try {
      const auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // signed in
        }
      });
      signInAnonymously(auth).catch((e) => {
        lastAuthError = e;
        console.error('Anonymous sign-in failed', e);
      });
    } catch (e) {
      console.error('Auth initialization error', e);
    }
    return true;
  } catch (e) {
    console.error('Firebase init error', e);
    return false;
  }
}

function sessionRef(sessionId: string) {
  if (!db) throw new Error('Firebase not initialized');
  return ref(db, `sessions/${sessionId}`);
}

export async function createSession(sessionId: string, initialData: any = {}) {
  initFirebase();
  if (!db) return;
  await set(sessionRef(sessionId), initialData);
}

export function subscribeSession(sessionId: string, cb: (data: any) => void, onError?: (err: any) => void) {
  initFirebase();
  if (!db) return () => {};
  const r = sessionRef(sessionId);
  const unsubscribe = onValue(r, (snap) => cb(snap.val()), (err) => {
    console.error('RTDB subscribe error', err);
    if (onError) onError(err);
  });
  return () => unsubscribe();
}

export async function addOrUpdatePlayer(sessionId: string, player: Player) {
  initFirebase();
  if (!db) return;
  const pRef = ref(db, `sessions/${sessionId}/players/${player.id}`);
  await set(pRef, player);
}

export async function updateGameState(sessionId: string, gamestate: any) {
  initFirebase();
  if (!db) return;
  const gRef = ref(db, `sessions/${sessionId}/gamestate`);
  await set(gRef, gamestate);
}

export async function pushAnswer(sessionId: string, answer: PlayerAnswer) {
  initFirebase();
  if (!db) return;
  const answersRef = ref(db, `sessions/${sessionId}/questions/${answer.questionId}/answers`);
  await push(answersRef, answer);
}

export async function setQuestions(sessionId: string, questions: any) {
  initFirebase();
  if (!db) return;
  const qRef = ref(db, `sessions/${sessionId}/questions`);
  await set(qRef, questions);
}

export default {
  initFirebase,
  createSession,
  subscribeSession,
  addOrUpdatePlayer,
  updateGameState,
  pushAnswer,
  setQuestions,
};
