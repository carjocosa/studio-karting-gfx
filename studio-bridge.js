// ═══════════════════════════════════════════════════════════
//  studio-bridge.js  — PMV Karting GFX v5 · Firebase Edition
//  ⚠ EDITA SOLO el bloque FIREBASE_CONFIG con tus datos
// ═══════════════════════════════════════════════════════════

(function () {   // IIFE: evita colisiones de variables globales

  // ─── 1. TU CONFIG DE FIREBASE ────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCipAzxMkK8ADM19DSfGsH_6UlM_IFYQzk",
  authDomain: "studio-graphics-fx.firebaseapp.com",
  databaseURL: "https://studio-graphics-fx-default-rtdb.firebaseio.com",
  projectId: "studio-graphics-fx",
  storageBucket: "studio-graphics-fx.firebasestorage.app",
  messagingSenderId: "325590338335",
  appId: "1:325590338335:web:5c98059c92031c70167e2a"
};
  // ─────────────────────────────────────────────────────────

  // Esperar a que Firebase SDK esté disponible
  function waitForFirebase(cb, tries = 0) {
    if (typeof firebase !== "undefined" && firebase.database) {
      cb();
    } else if (tries < 40) {
      setTimeout(() => waitForFirebase(cb, tries + 1), 100);
    } else {
      console.error("❌ Firebase SDK no cargó. Verifica los <script> en el <head>.");
    }
  }

  waitForFirebase(function () {

    // Inicializar solo si no hay apps ya cargadas
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    const _fbDb = firebase.database();

    // ── Emula BroadcastChannel con Firebase ───────────────
    class FirebaseBroadcastChannel {
      constructor(name) {
        this.name      = name;
        this._ref      = _fbDb.ref("channels/" + name);
        this.onmessage = null;

        // Marcar tiempo de inicio para ignorar mensajes viejos
        this._startTs = Date.now();

        this._ref.on("child_added", (snap) => {
          const data = snap.val();
          if (!data || !data.ts) return;
          // Ignorar mensajes anteriores a cuando se cargó la página
          if (data.ts < this._startTs) return;
          if (this.onmessage) this.onmessage({ data: data.payload });
        });
      }

      postMessage(payload) {
        this._ref.push({
          payload,
          ts: firebase.database.ServerValue.TIMESTAMP
        });
        // Limpieza: borrar mensajes > 10 segundos
        this._ref.orderByChild("ts")
          .endAt(Date.now() - 10000)
          .once("value", snap => snap.forEach(c => c.ref.remove()));
      }

      close() { this._ref.off(); }
    }

    // Reemplazar BroadcastChannel nativo
    window.BroadcastChannel = FirebaseBroadcastChannel;

    console.log(
      "%c✅ Studio Bridge ACTIVO → Firebase OK",
      "color:#00ff88;font-weight:bold;font-size:13px;"
    );

    // Disparar evento para que el HTML sepa que el canal está listo
    window.dispatchEvent(new Event("pmv-bridge-ready"));
  });

})();
