import { SyncMessage } from '../types';

const DB_NAME = 'quiz_sync_db_v1';
const STORE_NAME = 'messages';
const SIGNAL_KEY = 'quiz_sync_signal_v1';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addMessage(message: SyncMessage): Promise<number> {
  const db = await openDB();
  return new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({ message, ts: Date.now() });
    req.onsuccess = () => resolve(Number(req.result));
    req.onerror = () => reject(req.error);
  });
}

async function getMessagesSince(lastId: number): Promise<Array<{ id: number; message: SyncMessage }>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const range = IDBKeyRange.lowerBound(lastId + 1);
    const req = store.openCursor(range);
    const out: Array<{ id: number; message: SyncMessage }> = [];
    req.onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor) {
        out.push({ id: cursor.key as number, message: cursor.value.message });
        cursor.continue();
      } else {
        resolve(out);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function initSyncDB() {
  await openDB();
}

export async function sendSyncMessage(msg: SyncMessage) {
  try {
    await addMessage(msg);
    try {
      localStorage.setItem(SIGNAL_KEY, String(Date.now()));
    } catch (e) {
      // localStorage may fail in some contexts; ignore so DB still stores the message
    }
  } catch (e) {
    console.error('sendSyncMessage error', e);
  }
}

export function subscribeSync(onMessage: (m: SyncMessage) => void) {
  let lastId = Number(sessionStorage.getItem('quiz_sync_lastId_v1') || '0');

  const deliverNew = async () => {
    try {
      const items = await getMessagesSince(lastId);
      if (items.length === 0) return;
      for (const it of items) {
        onMessage(it.message);
        if (it.id > lastId) lastId = it.id;
      }
      sessionStorage.setItem('quiz_sync_lastId_v1', String(lastId));
    } catch (e) {
      console.error('deliverNew error', e);
    }
  };

  const handler = (e: StorageEvent) => {
    if (e.key === SIGNAL_KEY) {
      deliverNew();
    }
  };

  window.addEventListener('storage', handler);

  // Also poll briefly on subscribe to catch messages sent without storage (same tab) or missed signals
  const poll = setTimeout(deliverNew, 50);

  return () => {
    window.removeEventListener('storage', handler);
    clearTimeout(poll);
  };
}
