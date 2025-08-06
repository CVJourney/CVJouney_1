document.addEventListener("DOMContentLoaded", async () => {
  await verificarOuCriarPrismacvVersao4();
});

async function verificarOuCriarPrismacvVersao4() {
  const dbName = "prismacv";

  const request = indexedDB.open(dbName, 4); // força abrir ou atualizar para versão 4

  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("usuarios")) {
      db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
    }

    console.log("Banco criado ou atualizado para versão 4.");
  };

  request.onsuccess = function (event) {
    const db = event.target.result;

    if (db.objectStoreNames.length === 0) {
      console.log("Banco sem objectStores, recriando...");
      db.close();
      indexedDB.deleteDatabase(dbName).onsuccess = criarPrismacvVersao4;
      return;
    }

    const storeNames = Array.from(db.objectStoreNames);
    const checks = storeNames.map(storeName => {
      return new Promise(resolve => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const countReq = store.count();

        countReq.onsuccess = () => resolve(countReq.result > 0);
        countReq.onerror = () => resolve(false);
      });
    });

    Promise.all(checks).then(results => {
      const temDados = results.some(r => r === true);
      db.close();

      if (temDados) {
        window.location.href = "home.html";
      } else {
        console.log("Banco estava vazio, recriando com versão 4...");
        indexedDB.deleteDatabase(dbName).onsuccess = criarPrismacvVersao4;
      }
    });
  };

  request.onerror = function () {
    console.error("Erro ao abrir/criar o banco de dados.");
  };
}

function criarPrismacvVersao4() {
  const request = indexedDB.open("prismacv", 4);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("usuarios")) {
      db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
    }

    console.log("Banco recriado com versão 4.");
  };

  request.onsuccess = function () {
    request.result.close();
  };

  request.onerror = function () {
    console.error("Erro ao criar banco com versão 4.");
  };
}



//alert