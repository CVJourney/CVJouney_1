document.addEventListener("DOMContentLoaded", async function () {
  await Buscar();
});

async function Buscar() {
  const sessionKey = "dadosRestaurante";

  // Tenta carregar do sessionStorage
  const cached = sessionStorage.getItem(sessionKey);
  if (cached) {
    try {
      const res = JSON.parse(cached);
      if (Array.isArray(res)) {
        limparContainers();
        montarCarrossel(res);
        mostrarRestaurantes(res);
      }
    } catch (e) {
      console.warn("Erro ao usar cache do sessionStorage:", e);
    }
  }

  // Atualiza com dados mais recentes
  try {
    const response = await fetch("https://cvprisma.vercel.app/data_restaurante");
    const res = await response.json();

    if (!Array.isArray(res)) throw new Error("Dados inválidos");

    // Atualiza interface com os dados mais recentes
    limparContainers();
    montarCarrossel(res);
    mostrarRestaurantes(res);

    // Atualiza sessionStorage
    sessionStorage.setItem(sessionKey, JSON.stringify(res));
  } catch (e) {
    console.error("Erro ao buscar dados da API:", e);
  }
}

function limparContainers() {
  const carrossel = document.getElementById("carrossel");
  const container = document.getElementById("restaurantes");

  if (carrossel) carrossel.innerHTML = "";
  if (container) container.innerHTML = "";
}

function montarCarrossel(data) {
  const carrossel = document.getElementById("carrossel");
  const imagens = [];
  let ids=[]
  data.forEach(rest => {
    let foto = String(rest.fotos).split("{}");
    let img = foto[0];
    imagens.push(img);
    ids.push(rest.id)
  });

  imagens.slice(0, 10).forEach((src,i) => {

    const img = document.createElement("img");
    img.src = src;
    img.id=ids[i]
    img.onclick=()=>{
      manda(img.id)
    }
    carrossel.appendChild(img);

  });
}

function mostrarRestaurantes(data) {
  const container = document.getElementById("restaurantes");

  data.forEach((rest, index) => {
    const div = document.createElement("div");
    div.className = "restaurante";

    const fotos = (rest.fotos || "").replace(/\[|\]/g, "").split(",").map(f => f.trim());
    const pratosRaw = rest.pratos.split("[]");
    const pratos = pratosRaw.map(p => {
      const [nome, estrelas, imagem, origem, dinheiro] = p.split("{}");
      return { nome, estrelas, imagem, origem, dinheiro };
    }).filter(p => p.nome);
    
    let texto = "★";
    const pratosHTML = `
      <div class="pratos-lista">
        ${pratos.slice(0, 2).map(p => `
          <div class="prato">
            <strong>${p.nome}</strong> (${p.origem})<br>
            <img src="${p.imagem}" width="100" height="100" />
            <p style="color:gold;font-size:14px;">${texto.repeat(Number(p.estrelas))}</p>
            <p class="dinheiro">${p.dinheiro}$ECV</p>
          </div>
        `).join("")}
      </div>
      <button onclick="abrirModal(${index})">Ver mais</button>
    `;
    let sep=String(fotos).split("{}")
    div.innerHTML = `
      <h2>${rest.nome}</h2>
      <p>${rest.info}</p>
      <div class="fotos">
        <img src="${sep[0]}" />
        <p style="color:gold;font-size:11px;">${texto.repeat(Number(rest.estrela))}
        <mark onclick="manda(${rest.id})">Detalhes</mark></p>
      </div>
      ${pratosHTML}
    `;

    container.appendChild(div);

    // Salvar os pratos para o modal
    rest._pratos = pratos;
  });

  // Guardar tudo
  window._dadosRestaurante = data;
}

function abrirModal(index) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const rest = window._dadosRestaurante[index];
  let texto = "★";

  const pratosHTML = `
    <h2>Top 10 dos melhores pratos da ${rest.nome}</h2>
    <h2 id="detalhes_ini" onclick="manda(${rest.id})">Detalhes</h2>
    <div class="pratos-lista">
      ${rest._pratos.map(p => `
        <div class="prato principal_pr">
          <strong>${p.nome}</strong> (${p.origem})<br>
          <img src="${p.imagem}" width="150" height="150" />
          <p style="color:gold;font-size:15px;">${texto.repeat(p.estrelas)}</p>
          <br>
          <p class="dinheiro_pri">${p.dinheiro}$ECV</p>
        </div>
      `).join("")}
    </div>
  `;

  modalBody.innerHTML = pratosHTML;
  modal.classList.remove("hidden");
}

// Fechar modal
document.querySelector(".close").onclick = () => {
  document.getElementById("modal").classList.add("hidden");
};

document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").classList.add("hidden");
  }
};


function manda(id_){
  let id=`res_destaque.html?id=${id_}`
  window.location.href=id
}

//https://cvprisma.vercel.app