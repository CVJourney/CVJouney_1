document.addEventListener("DOMContentLoaded",()=>{
    verificarPrismacv();
})

function verificarPrismacv() {
  const dbName = "prismacv";
  const request = indexedDB.open(dbName);

  request.onerror = function() {
    console.log(false); // erro ao abrir DB (provavelmente não existe)
  };

  request.onsuccess = function(event) {
    const db = event.target.result;

    if (db.objectStoreNames.length === 0) {
      // não tem tabelas
      console.log(false);
      db.close();
      return;
    }

    // verificar se alguma tabela tem dados
    let stores = Array.from(db.objectStoreNames);
    let checks = stores.map(storeName => {
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const countRequest = store.count();

        countRequest.onsuccess = function() {
          resolve(countRequest.result > 0);
        };
        countRequest.onerror = function() {
          resolve(false);
        };
      });
    });

    Promise.all(checks).then(results => {
      const algumComDados = results.some(r => r === true);
      console.log(algumComDados,"uu");
      if(algumComDados==true){
        window.location.href="home.html"
      }
      db.close();
    });
  };

  request.onupgradeneeded = function() {
    // base de dados não existe, onupgradeneeded é chamado na criação
    // se foi chamado, a DB não existia antes, logo retorna false
    console.log(false);
  };
}

