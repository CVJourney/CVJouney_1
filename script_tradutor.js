let star="★"
document.addEventListener("DOMContentLoaded",async ()=>{
    await verificarSeTemDadosNaBD()
    await campo_1()
    lerdadosempresas()
    document.dispatchEvent(new Event("traduzir"))
})


async function verificarSeTemDadosNaBD() {
  if (!('databases' in indexedDB)) {
    console.warn("Seu navegador não suporta indexedDB.databases()");
    return false;
  }

  try {
    const bancos = await indexedDB.databases();
    const existe = bancos.some(b => b.name === "prismacv");

    if (!existe) {
      console.log("Banco 'prismacv' NÃO existe.");
      window.location.href="index.html"
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
      return false;
    }

    const resultado = await new Promise((resolve, reject) => {
      const tx = db.transaction("usuarios", "readonly");
      const store = tx.objectStore("usuarios");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const dados = getAllRequest.result;
        resolve(dados.length > 0);
      };

      getAllRequest.onerror = () => reject("Erro ao ler os dados.");
    });

    return resultado;

  } catch (erro) {
    console.error("Erro ao verificar dados:", erro);
    return false;
  }
}

function apanha(id){
    return document.getElementById(id)
}
//essa função manda e apanha dados no banco de dados
async function post(tema, cache) {
    const cacheString = sessionStorage.getItem(cache);

    if (cacheString) {
        console.log("🔁 Cache encontrado:", cache);
        return JSON.parse(cacheString);
    }

    console.log("🌐 Nenhum cache. Fazendo requisição POST...");

    const resposta = await fetch("https://cvprisma.vercel.app/data_empresas", {
        method: "post",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({ tema })
    });

    const res = await resposta.json();

    // Salva no cache
    sessionStorage.setItem(cache, JSON.stringify(res));
    console.log("✅ Cache salvo:", cache);

    return res;
}

//esse é a função de pegar dados, o get
async function get(url) {
    const cacheKey = `cache_estadia`;
    const cacheData = sessionStorage.getItem(cacheKey);

    if (cacheData) {
        console.log("🔁 Cache encontrado:", cacheKey);
        return JSON.parse(cacheData);
    }

    console.log("🌐 Nenhum cache. Fazendo requisição GET...");

    const resposta = await fetch(url);
    const res = await resposta.json();

    sessionStorage.setItem(cacheKey, JSON.stringify(res));
    console.log("✅ Cache salvo:", cacheKey);

    return res;
}



function lerdadosempresas() {
  // Abrir a base de dados chamada "MeuBanco"
  const request = indexedDB.open("prismacv", 4);

  request.onsuccess = function (event) {
    const db = event.target.result;

    // Abrir uma transação para leitura
    const transaction = db.transaction(["usuarios"], "readonly");
    const store = transaction.objectStore("usuarios");

    // Pegar todos os dados
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function () {
      const dados = getAllRequest.result;
      console.log("Dados encontrados:", dados[0].gosto);
      let gosto=dados[0].gosto
      campo_2(gosto)

      // Aqui você pode trabalhar com os dados (exibir, filtrar, etc)
    };

    getAllRequest.onerror = function () {
      console.error("Erro ao buscar os dados");
    };
  };

  request.onerror = function () {
    console.error("Erro ao abrir a base de dados");
  };
}

function criar(tag){
    return document.createElement(tag)
}

async function campo_1(){
    let dados=await get("https://cvprisma.vercel.app/data_estadia")
    console.log("dados estão vindos: ", dados)

    function separa(fotos){
        let sepa=String(fotos).trim().split('||')
        let init=sepa[0]
        return init

    }
    let estadia=apanha("estadia")
    dados.map((e)=>{
        let i=e.id
        let div=criar("div")
        div.className="div_estadia"
        div.id=`estadia-${i}`
        div.onclick=()=>{
            envia(div.id)
        }

        let img_=separa(e.fotos)
        let img=criar("img")
        img.src=img_
        img.className="img_estadia"


        let nome_=e.nome
        let nome=criar("h6")
        nome.innerText=nome_
        nome.className="nome_estadia"


        let estrela_=e.estrela
        let estrela=criar("h6")
        estrela.id="star_x"
        estrela.innerText=star.repeat(estrela_)
        estrela.className="estrela_estadia"

        let local_=e.local
        let local=criar("h6")
        local.innerText=local_
        local.className="local_estadia"

        let ilha_=e.ilha
        let ilha=criar("h6")
        ilha.innerText=ilha_
        ilha.className="ilhas_estadia"

        let div_2=criar("div")
        div_2.className="div_2_estadia"
        div_2.appendChild(ilha)

        div.appendChild(img)
        div.appendChild(nome)
        div.appendChild(local)
        div.appendChild(estrela)
        div.appendChild(div_2)

        estadia.appendChild(div)


    })

}

async function campo_2(gosto){

    console.log("dados_recebidos_xx: ",gosto)

    let destaque=apanha("destaque")

    let data=await post(gosto,"gosto")
    data=data.reverse()
    console.log(data)
    let i=""

    data.map((e)=>{
        i=e.id
        let div=document.createElement("div")
        div.className="div_imagens_campos"
        div.id=`empresas-${i}`
        div.onclick=()=>{envia(div.id)}
        let img_=e.imagem
        let ilha_=e.ilha
        let estrela_=e.estrela
        let nome_des_=e.nome
    
        console.log("---->zzz",img_)

        let campo=String(img_).trim().split("||")
        let len=campo.length-1

        while(len>=0){
            let img=criar("img")
            img.src=campo[len]
            img.className="img_empresas"


            let ilha=criar("h6")
            ilha.className="ilhas_"
            ilha.innerText=ilha_

            let estrela=criar("h6")
            estrela.className="estrela"
            estrela.innerText=star.repeat(estrela_)

            let div_2=criar("div")
            div_2.className="div_2"
            div_2.appendChild(ilha)

            let nome_des=criar("h5")
            nome_des.className="nome_des"
            nome_des.innerText=nome_des_

            div.appendChild(img)
            div.appendChild(div_2)
            div.appendChild(nome_des)
            div.appendChild(estrela)
            len-=1
        }

        destaque.appendChild(div)
        document.dispatchEvent(new Event("dadosCarregados"));
        
    })
}

    
function envia(id){
    console.log("foi foi")
    let master=String(id).trim().split("-")
    let metodo=master[0]
    let campo=master[1]
    console.log(metodo,"***",campo)
    window.location.href=`info.html?id=${campo}&url=${metodo}`

}

//data_info

//empresa session
//alert