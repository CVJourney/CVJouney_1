document.addEventListener("DOMContentLoaded",async function(){
  await alertTraduzido("Neste espaço estão as solicitações que você realizou para os taxistas.")
    document.dispatchEvent(new Event("traduzir"))
    await procurar()
})

async function procurar(){
  let carga=document.getElementById("caregamento")
    let user=await getUsuarios()
    let len=user.length
    let username=user[len-1].username

    let response=await fetch("https://cvprisma.vercel.app/data_taxista",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({usuario:username})
    })
    let row=await response.json()
    console.log(row,username)
    trabalhar_xs(row)
    carga.style.display="none"
}

function trabalhar_xs(data){
    data=data.reverse()
    let taxi_div=document.getElementById("taxista_campo")
    data.map((e,i)=>{
        let cria=document.createElement("div")
        cria.classList.add("campo_taxi")
        let btn=document.createElement("button")
        cria.id=`${i}_campo`
        let html=
        `
<div class="taxi-container">
  <h1 class="title">Taxista:</h1>
  <h3 class="info">${e.nome}</h3>

  <h1 class="title">Local da solicitação:</h1>
  <iframe
    class="map-frame"
    width="600"
    height="450"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps?q=${e.latitude},${e.longitude}&hl=pt&z=15&output=embed">
  </iframe>

  <h1 class="title">Destino:</h1>
  <h3 class="info">${e.destino}</h3>

  <h1 class="title">${e.guia}</h1>

  ${e.confirmado==null
    ? `<h2 class="pending">Esperando a resposta do taxista</h2><button id="cancela" onclick="cancelar(${e.id})">Cancelar solicitação</button>`
    : e.confirmado==false
      ? `<h2 class="denied">Solicitação negada(ou cancelada)</h2>`
      : `<h1 class="title">Preço:</h1><h3 class="info">${e.preco} Ecv</h3><h2 class="approved">Solicitação aprovada</h2>`}

  ${e.confirmado!=false
    ? `<h1 class="title">Tempo:</h1>${e.tempo}<h3 class="info" id="tempo${i}">00:00:0 (m)</h3>`
    : ``}

  <button class="btn-details" onclick='detales_carros(${e.id_})'>Detalhes do veículo do taxista</button>
</div>

        `
        cria.innerHTML=html
        taxi_div.appendChild(cria)
          if (e.confirmado != false) {
                iniciarTempo(`tempo${i}`,e.tempo,e.id,cria.id);
            }
    })

function iniciarTempo(id, limiteStr,id_,names) {
  // Recupera segundos salvos e hora da última saída
  let tempoSalvo = localStorage.getItem(id) ? parseInt(localStorage.getItem(id)) : 0;
  let ultimaSaida = localStorage.getItem(id + "_saida");

  // Converte limite "hh:mm" para segundos
  let [limH, limM] = limiteStr.split(":").map(Number);
  let limite = limH * 3600 + limM * 60;

  // Se houve saída anterior, calcula quanto tempo passou
  if (ultimaSaida) {
    let diferenca = Math.floor((Date.now() - parseInt(ultimaSaida)) / 1000); // diferença em segundos
    tempoSalvo += diferenca;
  }

  let segundos = tempoSalvo;

  function formatarTempo(seg) {
    let h = String(Math.floor(seg / 3600)).padStart(2, "0");
    let m = String(Math.floor((seg % 3600) / 60)).padStart(2, "0");
    let s = String(seg % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // Atualizar visualmente a cada 1s
  let intervalo = setInterval(() => {
    if (segundos >= limite) {
      clearInterval(intervalo);
      document.getElementById(id).textContent = formatarTempo(limite);
      document.getElementById(id).style.color = "red";
      let elemina=document.createElement("button")
      elemina.textContent="Cancelar"
      elemina.onclick=async ()=>{
        await cancelar(id_)
      }
      elemina.classList.add("cancelado")
      let div=document.getElementById(names)
      let filho=div.children[0]
      filho.appendChild(elemina)
      return;
    }

    segundos++;
    document.getElementById(id).textContent = formatarTempo(segundos);
    localStorage.setItem(id, segundos);
  }, 1000);

  // Antes de sair, salvar hora da saída
  window.addEventListener("beforeunload", () => {
    localStorage.setItem(id + "_saida", Date.now());
  });
}


}

function detales_carros(id){
    let url=`taxi_chamada.html?wwr=${id}`
    window.location.href=url
}
//cancelar a solicitação
async function cancelar(id){
  let x=await alertTraduzido("Deseja mesmo cancelar essa solicitação",2)
  console.log(x)
  if(x==true){
    let st=document.getElementById("caregamento").style
    st.display="block"
    let response=await fetch("https://cvprisma.vercel.app/data_cancela_taxi",{
      method:"post",
      headers:{
        "content-type":"application/json"
      },
      body:JSON.stringify({id:id})
    })
    if(response.ok){
      st.display="none"
      await alertTraduzido("Vamos atualizar os dados para você")
      location.reload()
    }
    else{
      alertTraduzido("Deu um pequeno erro, tente denovo mais tarde")
      st.display="none"
    }
  }
}

async function alertTraduzido(texto,tipo) {
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
    if(tipo==2){
      return confirm(texto)
    }
    else{
      alert(textoTraduzido,idiomaDestino);
    }
  } catch (err) {
    console.error("Erro na tradução:", err);
    alert(texto); // Fallback
  }
}

async function getUsuarios() {
  for (let version = 1; version <= 10; version++) {
    try {
      const usuarios = await new Promise((resolve, reject) => {
        const request = indexedDB.open("prismacv", version);

        request.onerror = () => reject(null);

        request.onsuccess = (event) => {
          try {
            const db = event.target.result;
            const transaction = db.transaction(["usuarios"], "readonly");
            const store = transaction.objectStore("usuarios");

            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(null);
          } catch (e) {
            reject(null);
          }
        };
      });

      if (usuarios && usuarios.length >= 0) {
        console.log(`✅ Banco aberto na versão ${version}`);
        return usuarios; // retorna assim que conseguir
      }
    } catch {
      // continua tentando com a próxima versão
    }
  }

  throw new Error("❌ Não foi possível abrir o banco prismacv em nenhuma versão de 1 a 10");
}

