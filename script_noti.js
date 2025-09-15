let time=0
function apanha(id){
    return document.getElementById(id)
}

document.addEventListener("verifica_data",async function(){
    await apanha_sol()
})

async function apanha_sol(){
    let user=await getData("prismacv","usuarios","username")
    console.log(user)
    let len=user.length
    let username=user[len-1]

    let response=await fetch("https://cvprisma.vercel.app/data_reserva",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({usuario:username})
    })

    let res=await response.json()
    await chamamento(res)

}

async function chamamento(data){
    if(time==0){
        data.map((e)=>{
            let {compra,vista,lugar}=e
            console.log(compra,vista,lugar,e)
            if(compra!=true && vista==true){
              alertTraduzido(`Já recebeste uma resposta sobre ${lugar}. Clica no botão com o ícone de mensagem para ver.`)
              let mail=apanha("t_mail")
              mail.style.boxShadow="0 0 10px black"
            }
        })
        time=1
    }
}

function getData(dbName, storeName, columnName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onerror = (event) => {
      reject("Erro ao abrir o banco: " + event.target.errorCode);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);

      const result = [];

      // abrir cursor para percorrer todos os dados
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          // pega só o campo que você pediu (coluna)
          result.push(cursor.value[columnName]);
          cursor.continue();
        } else {
          resolve(result); // terminou de ler todos
        }
      };

      cursorRequest.onerror = (e) => {
        reject("Erro ao ler os dados: " + e.target.errorCode);
      };
    };
  });
}

async function alertTraduzido(texto) {
  const idiomaDestino = localStorage.getItem("idioma") // Pega o idioma do IndexedDB

  if (!idiomaDestino) {
    console.warn("Idioma não encontrado. Mostrando texto original.");
    alert(texto);
    return;
  }

  try {
    const resposta = await fetch("https://apiprisma.vercel.app/api_tradutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texto,
        idiomaDestino
      }),
    });

    const dados = await resposta.json();
    const textoTraduzido = dados.traducao
    alert(textoTraduzido,idiomaDestino);
  } catch (err) {
    console.error("Erro na tradução:", err);
    alert(texto); // Fallback
  }
}
