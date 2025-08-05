document.addEventListener("DOMContentLoaded",async ()=>{
    indexedDB.deleteDatabase("prismacv");
    await verificarPrismacv();
})


async function verificarPrismacv() {
  const dbName = "prismacv";
  let existe = false;

  const request = indexedDB.open(dbName);

  request.onerror = function () {
    console.log(false); // erro ao abrir DB
  };

  request.onsuccess = async function (event) {
    const db = event.target.result;

    if (db.objectStoreNames.length === 0) {
      console.log(false);
      db.close();
      criarPrismacvVersao4(); // criar com versão 4
      return;
    }

    let stores = Array.from(db.objectStoreNames);
    let checks = stores.map(storeName => {
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const countRequest = store.count();

        countRequest.onsuccess = function () {
          resolve(countRequest.result > 0);
        };
        countRequest.onerror = function () {
          resolve(false);
        };
      });
    });

    Promise.all(checks).then(results => {
      const algumComDados = results.some(r => r === true);
      console.log(algumComDados, "uu");

      if (algumComDados) {
        window.location.href = "home.html";
      } else {
        criarPrismacvVersao4(); // não tem dados => recria
      }

      db.close();
    });
  };

  request.onupgradeneeded = function () {
    // DB está sendo criada pela primeira vez
    console.log(false);
    request.result.close();
    criarPrismacvVersao4(); // garante criação com versão 4
  };
}

function criarPrismacvVersao4() {
  const request = indexedDB.open("prismacv", 4);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("usuarios")) {
      db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
    }

    // pode adicionar mais stores se quiser
    console.log("DB criada com versão 4");
  };

  request.onsuccess = function () {
    request.result.close();
  };

  request.onerror = function () {
    console.error("Erro ao criar DB versão 4");
  };
}


