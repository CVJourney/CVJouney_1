async function get(url) {
  const res = await fetch(url);
  return await res.json();
}

async function lista_taxi(filtro = 'todos') {
  const container = document.getElementById("lista-taxi");

  // 1. Tenta pegar do sessionStorage
  let localData = sessionStorage.getItem("taxiData");
  let data = [];
  function getLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve([pos.coords.latitude, pos.coords.longitude]);
        },
        err => reject(err)
      );
    });
  }

  if (localData) {
    data = JSON.parse(localData);
    renderTaxiList(data, filtro, container); // Mostra logo do local
  }

  // 2. Busca nova versão atualizada da API
  try {
    let [lat,lon]=await getLocation()
    console.log(2)
    const dat = await fetch("http://localhost:4000/data_taxi",{
      method:"post",
      headers:{
        "content-type":"application/json"
      },
      body:JSON.stringify({lat,lon})
    });
    const freshData=await dat.json()
    console.log(freshData)

    sessionStorage.setItem("taxiData", JSON.stringify(freshData)); // Salva nova versão
    renderTaxiList(freshData, filtro, container); // Atualiza a lista visualmente
  } catch (error) {
    console.error("Erro ao buscar dados atualizados:", error);
  }
}

// Função para renderizar a lista com base no filtro
function renderTaxiList(data, filtro, container) {
  container.innerHTML = "";

  if (filtro === "com_guia") {
    data = data.filter(t => t.guia === true);
    alertTraduzido
    
    async function alertTraduzido(textoOriginal) {
  const resposta = await fetch("https://apiprisma.vercel.app/api_tradutor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: textoOriginal }),
  });

  const dados = await resposta.json();
  const textoTraduzido = dados.resultado;
  alert(textoTraduzido);
}("Viagem com guia selecionada.");
  } else if (filtro === "sem_guia") {
    data = data.filter(t => t.guia === false);
  }

  data.forEach(taxi => {
    const div = document.createElement("div");
    div.className = "taxi-card";
    div.id = `taxi_${taxi.id}`;
    div.onclick=()=>{
      passa(taxi.id)
    }

    div.innerHTML = `
      <img src="${taxi.perfil}" class="perfil-img" alt="Motorista ${taxi.nome}">
      <div class="taxi-info">
        <h2>${taxi.nome}</h2>
        <p><strong>Preço da guia</strong>: ${taxi.preco_dia}$ ECV</p>
        <p><strong>Estrelas:</strong><i class="estrela"> ${'⭐'.repeat(taxi.estrela)}</i></p>
      </div>
      <button class="proximo-btn">→</button>
    `;
    container.appendChild(div);
  });

  
  document.dispatchEvent(new Event("traduzir"))
}

// Evento do switch
document.getElementById("guia-switch").addEventListener("change", function () {
  if (this.checked) {
    lista_taxi("com_guia");
  } else {
    lista_taxi("todos");
  }
});

// Botão "Somente sem guia"
document.getElementById("filtro-sem-guia").addEventListener("click", function () {
  document.getElementById("guia-switch").checked = false;
  lista_taxi("sem_guia");
});

// Chamada inicial
lista_taxi();

function passa(id){
  window.location.href=`taxi_chamada.html?wwr=${id}`
}

document.addEventListener("DOMContentLoaded",()=>{
    const evento = new CustomEvent("realiza");
    document.dispatchEvent(evento);
    console.log(evento)
})

//alertTraduzido

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