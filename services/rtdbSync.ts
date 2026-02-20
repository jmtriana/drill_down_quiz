import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, get, update } from 'firebase/database';
import { SyncMessage, Player, PlayerAnswer } from '../types';
import { getFirebaseConfig } from '../config/firebase';

let db: any = null;
let unsubscribers: Array<() => void> = [];

interface SessionData {
  Players: Array<{ id: string; name: string }>;
  Questions: Array<{
    questionNumber: number;
    responses: Array<{ playerId: string; optionIndex: number }>;
    result?: { correctIndex: number; explanation: string };
  }>;
}

export async function initRTDBSync(rtdbUrl: string): Promise<boolean> {
  try {
    const config = getFirebaseConfig();
    if (!config) {
      console.warn('rtdbSync: Firebase config not found');
      return false;
    }

    const app = initializeApp(config);
    db = getDatabase(app, rtdbUrl);
    console.log('rtdbSync: Firebase Realtime DB initialized', rtdbUrl);
    return true;
  } catch (e) {
    console.error('rtdbSync: init failed', e);
    return false;
  }
}

export async function addPlayerToSession(sessionId: string, player: Player) {
  if (!db) {
    console.warn('rtdbSync: not initialized');
    return;
  }

  try {
    const playersRef = ref(db, `${sessionId}/Players`);
    const snapshot = await get(playersRef);
    let players = snapshot.val() || [];
    if (!Array.isArray(players)) players = [];
    
    // Check if player already exists
    if (!players.find((p: any) => p.id === player.id)) {
      players.push({ id: player.id, name: player.name });
      await set(playersRef, players);
      console.log('rtdbSync: added player', player.name);
    }
  } catch (e) {
    console.error('rtdbSync: add player failed', e);
  }
}

export async function recordResponse(sessionId: string, answer: PlayerAnswer, questionNumber: number) {
  if (!db) {
    console.warn('rtdbSync: not initialized');
    return;
  }

  try {
    const questionsRef = ref(db, `${sessionId}/Questions`);
    const snapshot = await get(questionsRef);
    let questions = snapshot.val() || [];
    if (!Array.isArray(questions)) questions = [];

    // Find or create question entry
    let questionEntry = questions.find((q: any) => q.questionNumber === questionNumber);
    if (!questionEntry) {
      questionEntry = { questionNumber, responses: [] };
      questions.push(questionEntry);
    }

    // Add response if not already there
    if (!questionEntry.responses.find((r: any) => r.playerId === answer.playerId)) {
      questionEntry.responses.push({
        playerId: answer.playerId,
        optionIndex: answer.optionIndex
      });
    }

    await set(questionsRef, questions);
    console.log('rtdbSync: recorded response for question', questionNumber);
  } catch (e) {
    console.error('rtdbSync: record response failed', e);
  }
}

export async function setQuestionResult(sessionId: string, questionNumber: number, correctIndex: number, explanation: string) {
  if (!db) {
    console.warn('rtdbSync: not initialized');
    return;
  }

  try {
    const questionsRef = ref(db, `${sessionId}/Questions`);
    const snapshot = await get(questionsRef);
    let questions = snapshot.val() || [];
    if (!Array.isArray(questions)) questions = [];

    const questionEntry = questions.find((q: any) => q.questionNumber === questionNumber);
    if (questionEntry) {
      questionEntry.result = { correctIndex, explanation };
      await set(questionsRef, questions);
      console.log('rtdbSync: set result for question', questionNumber);
    }
  } catch (e) {
    console.error('rtdbSync: set result failed', e);
  }
}

export async function setGameState(sessionId: string, gameState: { status: string; currentIndex: number; revealedQuestions: number[] }) {
  if (!db) {
    console.warn('rtdbSync: not initialized');
    return;
  }

  try {
    const stateRef = ref(db, `${sessionId}/GameState`);
    await set(stateRef, gameState);
    console.log('rtdbSync: game state updated', gameState);
  } catch (e) {
    console.error('rtdbSync: set game state failed', e);
  }
}

export function subscribeRTDB(sessionId: string, onUpdate: (data: SessionData & { GameState?: any }) => void) {
  if (!db) {
    console.warn('rtdbSync: not initialized, cannot subscribe');
    return () => {};
  }

  try {
    const sessionRef = ref(db, sessionId);

    const unsubscribe = onValue(
      sessionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('rtdbSync: session updated', data);
          onUpdate(data);
        }
      },
      (error) => {
        console.error('rtdbSync: listener error', error);
      }
    );

    unsubscribers.push(unsubscribe);
    return unsubscribe;
  } catch (e) {
    console.error('rtdbSync: subscribe failed', e);
    return () => {};
  }
}

export function closeRTDB() {
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];
  db = null;
}

