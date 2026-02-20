import { WebSocketServer } from 'ws';

const port = process.env.PORT || 4000;
const wss = new WebSocketServer({ port });

console.log(`WebSocket sync server listening on ws://0.0.0.0:${port}`);

wss.on('connection', (ws) => {
  const remote = ws._socket && ws._socket.remoteAddress ? ws._socket.remoteAddress : 'unknown';
  console.log('client connected', remote);

  ws.on('message', (data) => {
    try {
      const text = data.toString();
      console.log('received message from', remote, text);
    } catch (e) {
      console.log('received binary message from', remote);
    }

    // broadcast to all other clients
    const msg = data;
    for (const client of wss.clients) {
      // readyState 1 === OPEN
      if (client !== ws && client.readyState === 1) {
        client.send(msg);
      }
    }
  });

  ws.on('close', () => {
    console.log('client disconnected', remote);
  });
});
