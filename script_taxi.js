async function get(url) {
  const res = await fetch(url);
  return await res.json();
}

async function lista_taxi(filtro = 'todos') {
  const container = document.getElementById("lista-taxi");

  // 1. Tenta pegar do sessionStorage
  let localData = sessionStorage.getItem("taxiData");
  let data = [];

  if (localData) {
    data = JSON.parse(localData);
    renderTaxiList(data, filtro, container); // Mostra logo do local
  }

  // 2. Busca nova versão atualizada da API
  try {
    const freshData = await get("https://cvprisma.vercel.app/data_taxi");
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
    alert("Viagem com guia selecionada.");
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
        <p><strong>Preço da guia</strong> ${taxi.preco_dia}$</p>
        <p><strong>Estrelas:</strong> ${'⭐'.repeat(taxi.estrela)}</p>
      </div>
      <button class="proximo-btn">→</button>
    `;
    container.appendChild(div);
  });
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

