// studio-bridge.js — PMV Karting GFX · Firebase Edition
// ⚠ SOLO EDITA las 7 líneas marcadas con <-- TU DATO

(function () {

  function init() {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey:            "AIzaSyCipAzxMkK8ADM19DSfGsH_6UlM_IFYQzk",             // <-- TU DATO
        authDomain:        "studio-graphics-fx.firebaseapp.com",  // <-- TU DATO
        databaseURL:       "https://studio-graphics-fx-default-rtdb.firebaseio.com", // <-- TU DATO
        projectId:         "studio-graphics-fx",            // <-- TU DATO
        storageBucket:     "studio-graphics-fx.firebasestorage.app",// <-- TU DATO
        messagingSenderId: "325590338335",           // <-- TU DATO
        appId:             "1:325590338335:web:5c98059c92031c70167e2a"               // <-- TU DATO
      });
    }

    const db = firebase.database();

    class FirebaseBroadcastChannel {
      constructor(name) {
        this.name      = name;
        this._ref      = db.ref("channels/" + name);
        this.onmessage = null;
        this._startTs  = Date.now();

        this._ref.on("child_added", (snap) => {
          const d = snap.val();
          if (!d || d.ts < this._startTs) return;
          if (this.onmessage) this.onmessage({ data: d.payload });
        });
      }

      postMessage(payload) {
        this._ref.push({ payload, ts: firebase.database.ServerValue.TIMESTAMP });
        this._ref.orderByChild("ts").endAt(Date.now() - 10000)
          .once("value", s => s.forEach(c => c.ref.remove()));
      }

      close() { this._ref.off(); }
    }

    window.BroadcastChannel = FirebaseBroadcastChannel;
    console.log("%c✅ Studio Bridge ACTIVO", "color:#00ff88;font-weight:bold;font-size:14px;");
    window.dispatchEvent(new Event("pmv-bridge-ready"));
  }

  // Esperar SDK
  let tries = 0;
  const wait = setInterval(() => {
    tries++;
    if (typeof firebase !== "undefined" && typeof firebase.database === "function") {
      clearInterval(wait);
      init();
    } else if (tries > 50) {
      clearInterval(wait);
      console.error("❌ Firebase SDK no encontrado. Revisa los <script> del <head>.");
    }
  }, 100);

})();
