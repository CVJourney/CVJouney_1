document.addEventListener("DOMContentLoaded", async function () {
  const evento = new CustomEvent("realiza");
  document.dispatchEvent(evento);
  await post();
  document.dispatchEvent(new Event("traduzir"))
  console.log("45")
});


async function post() {
  const params = new URLSearchParams(window.location.search);
  let id = params.get("id");
  let bd = params.get("url");

  let resposta = await fetch(`https://cvprisma.vercel.app/data_info`, {
    method: "post",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ id, bd })
  });

  let res = await resposta.json();
  const dados = res;

  function criarCard(hotel) {
    console.log(hotel);
    const container = document.getElementById("app");

    const imagens = (hotel.fotos ? hotel.fotos.split('||') : hotel.imagem.split('||')).map(url => url.trim());
    
    const div = document.createElement("div");
    div.className = "hotel-card";
    hotel.info = separa_(hotel.info);

    if (bd === "estadia") {
      div.innerHTML = `
        <div class="hotel-image">
          <img class="imagem-principal" id="img-${hotel.nome.replace(/\s+/g, '')}" src="${imagens[0]}" alt="Imagem de ${hotel.nome}">
          <div class="thumbnails">
            ${imagens.map((img, i) => `<img class="miniatura" src="${img}" data-index="${i}" alt="mini-${i}">`).join('')}
          </div>
        </div>
        <div class="hotel-info">
          <h2>${hotel.nome}</h2>
          <div class="mapa_"><img alt="img" class="mapa_img" src="img/mapa_2.png" id="icone_map" onclick="mapa()"></div>
          <div class="stars">${"★".repeat(hotel.estrela)}${"☆".repeat(5 - hotel.estrela)}</div>
          <div class="location">${hotel.local}, Ilha de ${hotel.ilha}</div>
          <h6 id="local_x">${hotel.nome} ${hotel.local}</h6>
          <div class="info">${hotel.info}</div>
          <div class="price">Preço: ${hotel.custo.toLocaleString()} CVE</div>
          <div id="empresas">Empresa: <strong>${hotel.empresa}</strong></div>
          <div class="reserva" id="reserva_${id}" onclick="reservar('${hotel.empresa}',${hotel.custo},'estadia','${hotel.nome}')">Reservar</div>
        </div>
      `;
    } else if (bd === "empresas") {
      div.innerHTML = `
        <div class="hotel-image">
          <img class="imagem-principal" id="img-${hotel.nome.replace(/\s+/g, '')}" src="${imagens[0]}" alt="Imagem de ${hotel.nome}">
          <div class="thumbnails">
            ${imagens.map((img, i) => `<img class="miniatura" src="${img}" data-index="${i}" alt="mini-${i}">`).join('')}
          </div>
        </div>
        <div class="hotel-info">
          <h2>${hotel.nome}</h2>
          <div class="mapa_"><img alt="img" class="mapa_img" src="img/mapa_2.png" id="icone_map" onclick="mapa()"></div>
          <div class="stars">${"★".repeat(hotel.estrela)}${"☆".repeat(5 - hotel.estrela)}</div>
          <div class="location">${hotel.localizacao}, Ilha de ${hotel.ilha}</div>
          <h6 id="local_x">${hotel.nome} ${hotel.localizacao}</h6>
          <div class="info">${hotel.info}</div>
          <div id="empresas">Empresa:<strong> ${hotel.empresa}</strong></div>
          <div id="agendar" class="reserva" onclick="reservar('${hotel.empresa}','${hotel.custo}','empresa','${hotel.nome}')">Agendar visita</strong></div>
          <div class="price">🚖 Chamar Táxi</div>
        </div>
      `;
    }

    container.appendChild(div);

    const imgEl = div.querySelector(".imagem-principal");
    const miniaturas = div.querySelectorAll(".miniatura");

    miniaturas.forEach(mini => {
      mini.addEventListener("click", () => {
        imgEl.src = mini.src;

        miniaturas.forEach(m => m.classList.remove("ativa"));
        mini.classList.add("ativa");
      });
    });
  }

  dados.forEach(criarCard);
  
}


function separa_(texto){
  let sep=String(texto).split(" ")
  let len=sep.length-1
  let lei=len
  console.log("hotel ",len)
  let num=0
  while(len>0){

    num+=String(sep[len]).length
    console.log(num)
    if(num>=200){
      break
    }
    len-=1
  }
  console.log("--->",sep[len])
  let inicio=sep.slice(0,len).join(" ")
  let fim=sep.slice(len, lei+1).join(" ")
  console.log(inicio,fim)
  let text=`<details><summary>${inicio}...</summary><p>${fim}</p></details>`

  return text

}

async function mapa(){
  await alertTraduzido("Espera um pouquinho que iremos te dar o mapa ⏩")
  let iframe=document.getElementById("map")
  let local=String(document.getElementById("local_x").innerText).replace(" ","+")
  let url=`https://www.google.com/maps?q=${local},+Cabo+Verde&output=embed`

  iframe.src=url
  console.log(url)
  document.getElementById("mapas").style.display="block"
}

document.getElementById("close_map").addEventListener("click",function(){
  document.getElementById("mapas").style.display="none"
})
/*https://cvprisma.vercel.app */
//alert

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

function reservar(empresa,preco,tipo,nome){
  console.log(empresa,preco)
  if(String(empresa).toLowerCase()=="sem empresa"){
    alertTraduzido("Não há visitas disponíveis, mas é fácil chegar de táxi. Solicite o seu aqui!")
  }
  else{
    if(empresa=="empresa"){
      alertTraduzido("Para solicitar a visita, você será redirecionado para a página de solicitação.")
    }
    else{
      alertTraduzido("Para reservar a estadia, você será redirecionado para a página de reservas.")
    }
    window.location.href=`mail.html?valida=1&empresa=${empresa}&preco=${preco}&nome=${nome}`
  }
}


//http://localhost