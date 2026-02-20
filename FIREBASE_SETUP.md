# Integración Firestore en Drill Down Quiz

## Setup Rápido

### 1. Crear proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea nuevo proyecto
3. Habilita **Firestore Database** (usa modo de desarrollo para testing)

### 2. Obtener credenciales
1. Proyecto → Configuración (engranaje)
2. Copia el bloque `firebaseConfig` de la sección "Tu aplicación web"

### 3. Configurar Firestore Security Rules
En Firebase Console → Firestore → Reglas, reemplaza con:
```
rules_version = '2';
match /databases/{database}/documents {
  match /sessions/{document=**} {
    allow read, write: if true;
  }
}
```
⚠️ **Para producción**: implementa autenticación y reglas de autorización adecuadas.

### 4. Usar en tu app
Dos formas de pasar credenciales:

**Opción A: Por URL (fácil para testing)**
```
http://localhost:5173/?role=HOST&fb=quiz-session-1&fbConfig=<BASE64>
```
Donde `<BASE64>` es tu config codificado:
```javascript
// En consola del navegador:
btoa(JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "999999999999",
  appId: "1:999999999999:web:abc123"
}))
```

**Opción B: Por variables de entorno (recomendado**
Crea `.env.local` en la raíz del proyecto:
```
VITE_FB_API_KEY=YOUR_API_KEY
VITE_FB_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FB_PROJECT_ID=your-project
VITE_FB_STORAGE_BUCKET=your-project.appspot.com
VITE_FB_MESSAGING_SENDER_ID=999999999999
VITE_FB_APP_ID=1:999999999999:web:abc123
```
Luego solo necesitas el parámetro sesión:
```
http://localhost:5173/?role=HOST&fb=quiz-session-1
```

### 5. Instalar dependencia
```bash
npm install
```

### 6. Ejecutar con Firestore
```bash
npm run dev
```

## Cómo funciona

- **Prioridad de sync**: Firebase (si `?fb=`) → WebSocket (`?ws=`) → IndexedDB local
- Cada mensaJe se guarda en Firestore bajo `sessions/{sessionId}/messages/`
- Listeners en tiempo real actualizan todas las pestañas conectadas automáticamente
- Los datos persisten en Firestore (puedes revisar en la consola)

## Opciones avanzadas

### Múltiples sesiones simultáneas
Usa diferentes valores para `?fb=`:
- Host: `?role=HOST&fb=event-2025-02-19-session-1`
- Players: `?role=PLAYER&fb=event-2025-02-19-session-1`

### Migrar de WebSocket a Firebase
Simplemente añade `?fb=` y remueve `?ws=` de las URLs

### Limpiar datos
En Firestore Console, borra la colección `sessions/{sessionId}/` cuando termines

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Firebase config not found" | Verifica `.env.local` o `?fbConfig=` |
| "Permission denied" | Revisa Firestore security rules |
| Mensajes no se sincronizan | Confirma que todos usan el mismo `?fb=sessionId` |
| Latencia | Normal en Firestore (100-500ms típico); para baja latencia, usa WebSocket local |

