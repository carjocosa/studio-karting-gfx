// ═══════════════════════════════════════════════════════════
//  studio-bridge.js  — STUDIO+ Karting GFX v5 · Firebase Edition
//  Reemplaza BroadcastChannel por Firebase Realtime Database
//  Pon TU config abajo y sube este archivo junto a los HTMLs
// ═══════════════════════════════════════════════════════════

// ─── 1. PON AQUÍ TU CONFIG DE FIREBASE ────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCipAzxMkK8ADM19DSfGsH_6UlM_IFYQzk",
  authDomain: "studio-graphics-fx.firebaseapp.com",
  databaseURL: "https://studio-graphics-fx-default-rtdb.firebaseio.com",
  projectId: "studio-graphics-fx",
  storageBucket: "studio-graphics-fx.firebasestorage.app",
  messagingSenderId: "325590338335",
  appId: "1:325590338335:web:5c98059c92031c70167e2a"
};
// ──────────────────────────────────────────────────────────

firebase.initializeApp(FIREBASE_CONFIG);
const _fbDb = firebase.database();

// ── Emula la API de BroadcastChannel usando Firebase ─────
class FirebaseBroadcastChannel {
  constructor(name) {
    this.name   = name;
    this._ref   = _fbDb.ref("channels/" + name);
    this.onmessage = null;

    // Suscribirse a mensajes nuevos en tiempo real
    this._ref.on("child_added", (snap) => {
      const data = snap.val();
      if (!data) return;
      // Ignorar mensajes con más de 4 segundos (evita replay al cargar)
      if (Date.now() - data.ts > 4000) return;
      if (this.onmessage) this.onmessage({ data: data.payload });
    });
  }

  postMessage(payload) {
    // Publicar mensaje en Firebase
    this._ref.push({ payload, ts: firebase.database.ServerValue.TIMESTAMP });
    // Limpieza automática: borrar mensajes > 8 segundos
    this._ref.orderByChild("ts")
      .endAt(Date.now() - 8000)
      .once("value", snap => snap.forEach(c => c.ref.remove()));
  }

  close() {
    this._ref.off();
  }
}

// Reemplazar BroadcastChannel nativo con la versión Firebase
window.BroadcastChannel = FirebaseBroadcastChannel;
console.log("%c✅ Studio Bridge ACTIVO → Firebase Realtime DB", "color:#00ff88;font-weight:bold;");
