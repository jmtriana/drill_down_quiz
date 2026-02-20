# Firebase Realtime Database Setup

## Configuración rápida

El proyecto ahora usa **Firebase Realtime Database (RTDB)** con escucha constante de cambios en tiempo real.

### URL RTDB configurada:
```
https://firestore-juancho-default-rtdb.firebaseio.com/
```

### Credenciales Firebase requeridas (`.env.local`)
```
VITE_FB_API_KEY=YOUR_API_KEY
VITE_FB_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FB_PROJECT_ID=your-project
VITE_FB_STORAGE_BUCKET=your-project.appspot.com
VITE_FB_MESSAGING_SENDER_ID=999999999999
VITE_FB_APP_ID=1:999999999999:web:abc123
```

### Uso

**Host con RTDB:**
```
http://localhost:5173/?role=HOST&rtdb=quiz-session-1
```

**Players con RTDB:**
```
http://localhost:5173/?role=PLAYER&rtdb=quiz-session-1
```

Todos deben usar el **mismo `rtdb=sessionId`** para sincronizarse en tiempo real.

## Firebase RTDB Security Rules

Ve a Firebase Console → Realtime Database → Reglas:

```json
{
  "rules": {
    "sessions": {
      "{sessionId}": {
        ".read": true,
        ".write": true,
        "messages": {
          "$messageId": {
            ".validate": "newData.hasChildren(['type', 'payload'])"
          }
        }
      }
    }
  }
}
```

O para testing (totalmente permisivo hasta julio 31, 2026):
```json
{
  "rules": {
    ".read": "now < 1751587200000",
    ".write": "now < 1751587200000"
  }
}
```

## Prioridad de sincronización

1. **RTDB** (`?rtdb=sessionId`) — tiempo real con listeners activos
2. **WebSocket** (`?ws=wss://...`) — conexión directa
3. **IndexedDB local** — fallback sin servidor

## Diferencias vs. Firestore

| Aspecto | RTDB | Firestore |
|--------|------|-----------|
| Listeners | Activos (escucha constante) | Era write-only |
| Latencia | 50-100ms típico | 100-500ms |
| Escalabilidad | Buena hasta millones de conexiones | Excelente a escala masiva |
| Cuota | Por transferencia de datos | Por lecturas/escrituras |
| Estructura | JSON nested | Documentos/colecciones |

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Config not found" | Añade las variables de entorno en `.env.local` |
| No sincroniza entre devices | Verifica que todos usen el mismo `?rtdb=sessionId` |
| "Permission denied" | Revisa las RTDB Security Rules |
| Cambios muy lentos | Normal en RTDB remoto (50-200ms); usa WebSocket local para baja latencia |

