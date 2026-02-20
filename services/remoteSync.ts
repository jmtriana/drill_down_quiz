import { SyncMessage } from '../types';

let socket: WebSocket | null = null;
let handlers: Array<(m: SyncMessage) => void> = [];
let urlGlobal: string | null = null;
let reconnectTimer: any = null;

export function connectRemote(wsUrl: string) {
  urlGlobal = wsUrl;
  // Normalize common bind addresses that are not reachable from the browser.
  if (typeof window !== 'undefined') {
    try {
      const host = window.location.hostname;
      if (wsUrl.includes('0.0.0.0')) {
        console.warn('remoteSync: replacing 0.0.0.0 with current host', host);
        wsUrl = wsUrl.replace('0.0.0.0', host);
      }
      if (wsUrl.includes('127.0.0.1') && host !== 'localhost' && host !== '127.0.0.1') {
        console.warn('remoteSync: replacing 127.0.0.1 with current host', host);
        wsUrl = wsUrl.replace('127.0.0.1', host);
      }

      // If page is served over HTTPS, browsers require WSS (secure) connections.
      if (window.location.protocol === 'https:' && wsUrl.startsWith('ws://')) {
        console.warn('remoteSync: upgrading ws:// to wss:// because page is served over HTTPS');
        wsUrl = wsUrl.replace(/^ws:/, 'wss:');
      }
    } catch (e) {
      console.warn('remoteSync: normalization failed', e);
    }
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('remoteSync: connected to', wsUrl);
  };

  socket.onmessage = (ev) => {
    try {
      const parsed = JSON.parse(ev.data) as SyncMessage;
      console.log('remoteSync: received', parsed);
      handlers.forEach(h => h(parsed));
    } catch (e) {
      console.warn('remoteSync: invalid message', e);
    }
  };

  socket.onclose = () => {
    socket = null;
    // reconnect with backoff
    if (urlGlobal) {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => connectRemote(urlGlobal as string), 1000 + Math.random() * 2000);
    }
  };

  socket.onerror = (e) => {
    console.warn('remoteSync socket error', e);
    try { socket?.close(); } catch {};
  };
}

export function sendRemoteMessage(msg: SyncMessage) {
  const serialized = JSON.stringify(msg);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(serialized);
    console.log('remoteSync: sent', msg);
  } else {
    console.warn('remoteSync: socket not open, cannot send', msg);
  }
}

export function subscribeRemote(onMessage: (m: SyncMessage) => void) {
  handlers.push(onMessage);
  return () => {
    handlers = handlers.filter(h => h !== onMessage);
  };
}

export function closeRemote() {
  urlGlobal = null;
  if (socket) {
    try { socket.close(); } catch {}
    socket = null;
  }
  if (reconnectTimer) clearTimeout(reconnectTimer);
}
