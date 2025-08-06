//home----
function vai(este){
    let casa=String(window.location.href).split("/")

    let c_=casa[casa.length-1]
    let sep=String(c_).split(".")
    let e_=este[este.length-1]

    console.log(sep[0],e_)

    if(String(sep[0])!=String(e_)){
        window.location.href=`${e_}.html`
    }
}

function apanha(id){
  return document.getElementById(id)
}

function separa(id){  
  let este=String(id).split("_")
  vai(este)

}

apanha("t_home").addEventListener("click",function(){
  separa(this.id)

})


apanha("t_mapa").addEventListener("click",async function(){
  separa(this.id)
})

apanha("t_taxi").addEventListener("click",function(){
  separa(this.id)
})




async function pegadados(dbName, storeName) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName);

        openRequest.onerror = function () {
        reject("Erro ao abrir o banco de dados");
        };

        openRequest.onsuccess = function () {
        const db = openRequest.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const getRequest = store.getAll();

        getRequest.onsuccess = async function () {
            await lugar(getRequest.result)
            resolve(getRequest.result);
        };

        getRequest.onerror = function () {
            reject("Erro ao buscar dados");
        };
        };
    });
}

async function lugar(data){
    console.log("::::::",data[0].username)
    let dd=data[0]
    let response=await fetch("https://cvprisma.vercel.app/data_manda",{
        method:"post",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify({nome:String(dd.username).toLowerCase()})
    })

    let res=await response.json()
    console.log("----",res)
    let dados=res[0]
    console.log(dados)
    //let {name,username,password,pontos}=dados
    console.log(dados)
    let vem=["name","username","password","pontos"]
    let ids=["usu_nome","usu_username","usu_senha","usu_pontos"]
    ids.map((e,i)=>{
        if(dados[vem[i]]==null){
            dados[vem[i]]=0
        }
        apanha(e).innerHTML=dados[vem[i]]
        console.log(dados[vem[i]])
    })
    apanha("usuario_data").style.display="block"

}
document.addEventListener("realiza",async function(){
  console.log("deu deu")
  await verificarSeTemDadosNaBD()
})

async function verificarSeTemDadosNaBD() {
  // Verifica compatibilidade com indexedDB.databases()
  if (!('databases' in indexedDB)) {
    console.warn("Seu navegador não suporta indexedDB.databases().");
    return false;
  }

  try {
    // Lista todos os bancos existentes
    const bancos = await indexedDB.databases();
    const existe = bancos.some(b => b.name === "prismacv");

    if (!existe) {
      console.log("Banco 'prismacv' NÃO existe.");
      window.location.href = "index.html"; // Redireciona se não existir
      return false;
    }

    // Tenta abrir o banco
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("prismacv");
      request.onerror = () => reject("Erro ao abrir o banco.");
      request.onsuccess = () => resolve(request.result);
    });

    // Verifica se o objectStore 'usuarios' existe
    if (!db.objectStoreNames.contains("usuarios")) {
      console.warn("Object store 'usuarios' não existe.");
      window.location.href = "index.html";
      return false;
    }

    // Verifica se há dados no objectStore
    const resultado = await new Promise((resolve, reject) => {
      const tx = db.transaction("usuarios", "readonly");
      const store = tx.objectStore("usuarios");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const dados = getAllRequest.result;
        if (dados.length === 0) {
          console.log("Banco existe mas está vazio.");
          window.location.href = "index.html";
          resolve(false);
        } else {
          console.log("Banco e dados existentes.");
          resolve(true);
        }
      };

      getAllRequest.onerror = () => reject("Erro ao ler os dados.");
    });

    return resultado;

  } catch (erro) {
    console.error("Erro ao verificar dados:", erro);
    window.location.href = "index.html";
    return false;
  }
}



apanha("logout").addEventListener("click",function(){
    if(confirm("Deseja mesmo eleminar essa conta neste dispositivo?")){
        apagarTodosOsDadosLocais()
        window.location.href="index.html"

    }
})


apanha("sol").addEventListener("click",async function(){
    await pegadados("prismacv","usuarios")
})


async function apagarTodosOsDadosLocais() {
  try {
    // Apagar localStorage
    localStorage.clear();

    // Apagar sessionStorage
    sessionStorage.clear();

    // Apagar IndexedDB
    if ('indexedDB' in window) {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }

    // Apagar Cache Storage
    if ('caches' in window) {
      const nomes = await caches.keys();
      for (const nome of nomes) {
        await caches.delete(nome);
      }
    }

    // Remover Service Workers
    if ('serviceWorker' in navigator) {
      const registros = await navigator.serviceWorker.getRegistrations();
      for (const registro of registros) {
        await registro.unregister();
      }
    }

    console.log("🧹 Todos os dados locais do app foram apagados com sucesso!");
  } catch (erro) {
    console.error("Erro ao apagar os dados locais:", erro);
  }
}

apanha("sai").addEventListener("click",function(){
    apanha("usuario_data").style.display="none"
})

apanha("t_restaurante").addEventListener("click",async function (){
  separa(this.id)
})

//alert