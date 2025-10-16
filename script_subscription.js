// ---------- IndexedDB: pegar último usuário ----------
async function pegarnome() {
  const request = indexedDB.open('prismacv', 4);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject('Erro ao abrir o banco prismacv');
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('usuarios', 'readonly');
      const store = tx.objectStore('usuarios');

      const cursorRequest = store.openCursor(null, 'prev'); // último registro
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        resolve(cursor ? cursor.value : null);
      };
      cursorRequest.onerror = () => reject('Erro ao ler store usuarios');
    };
  });
}

// ---------- Firebase ----------
const firebaseConfig = {
  databaseURL: "https://subscription-41d39-default-rtdb.europe-west1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('script_noti.js')
    .then(() => console.log("Service Worker registrado!"))
    .catch(err => console.error("Erro ao registrar SW:", err));
}

// ---------- Pedir permissão ----------
async function pedirPermissaoNotificacao() {
  if (!("Notification" in window)) throw "Navegador não suporta notificações.";
  if (Notification.permission === "granted") return "Permissão já concedida.";
  if (Notification.permission === "denied") throw "Permissão negada anteriormente.";

  const permission = await Notification.requestPermission();
  if (permission === "granted") return "Permissão concedida!";
  throw "Permissão não concedida.";
}

// ---------- Criar e salvar subscription ----------
async function salvarSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const data = await pegarnome();
  const nome = data?.username || "Desconhecido";
  const idioma = localStorage.getItem("idioma") || "pt";

  const swReg = await navigator.serviceWorker.ready;
  const subscription = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      "BGp2boq4FE1QyAXEA_SQxBqqXdCdakzpPmOmfo2MpxycWjDSs2LGzi6TSVrTrp4LnkwDvrm8tPqRaCatvKoKTBw"
    )
  });

  const subJSON = subscription.toJSON();
  const endpoint = subJSON.endpoint;

  subJSON.nome = nome;
  subJSON.idioma = idioma;

  const snapshot = await db.ref("subscriptions")
    .orderByChild("endpoint")
    .equalTo(endpoint)
    .once("value");

  if (snapshot.exists()) {
    console.log("Subscription já existe no Firebase:", endpoint);
    return;
  }

  await db.ref("subscriptions").push(subJSON);
  console.log("Subscription salva no Firebase:", endpoint);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// ---------- Inicialização ----------
(async () => {
  try {
    await pedirPermissaoNotificacao();
    await salvarSubscription();
    console.log("Notificação configurada com sucesso!");
  } catch (err) {
    console.warn("Erro com notificações:", err);
  }
})();
