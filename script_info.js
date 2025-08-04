document.addEventListener("DOMContentLoaded", async function () {
  const evento = new CustomEvent("realiza");
  document.dispatchEvent(evento);
  await post();
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
    console.log(hotel)
    const container = document.getElementById("app");

    const imagens = (hotel.fotos ? hotel.fotos.split('||') : hotel.imagem.split('||')).map(url => url.trim());
    let index = 0;
    
    const div = document.createElement("div");
    div.className = "hotel-card";
    hotel.info=separa_(hotel.info)
    if(bd=="estadia"){
      div.innerHTML = `
        <div class="hotel-image">
          <button class="seta esquerda">&#10094;</button>
          <img id="img-${hotel.nome.replace(/\s+/g, '')}" src="${imagens[0]}" alt="Imagem de ${hotel.nome}">
          <button class="seta direita">&#10095;</button>
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
          <div class="reserva" id="reserva_${id}">Reservar</div>
          </div>
          `;
    }
    else if(bd=="empresas"){
      div.innerHTML = `
  <div class="hotel-image">
    <button class="seta esquerda">&#10094;</button>
    <img id="img-${hotel.nome.replace(/\s+/g, '')}" src="${hotel.imagem}" alt="Imagem de ${hotel.nome}">
    <button class="seta direita">&#10095;</button>
  </div>

  <div class="hotel-info">
    <h2>${hotel.nome}</h2>
    <div class="mapa_">
      <img alt="img" class="mapa_img" src="img/mapa_2.png" id="icone_map" onclick="mapa()">
    </div>
    <div class="stars">${"★".repeat(hotel.estrela)}${"☆".repeat(5 - hotel.estrela)}</div>
    <div class="location">${hotel.localizacao}, Ilha de ${hotel.ilha}</div>
    <h6 id="local_x">${hotel.nome} ${hotel.localizacao}</h6>
    <div class="info">
      ${hotel.info}
    </div>
    <div class="price">🚖 Chamar Táxi</div>
    <div id="empresas">Empresa: <strong>${hotel.empresa}</strong></div>
  </div>
`;

    }

    container.appendChild(div);

    const imgEl = div.querySelector("img");
    const btnEsq = div.querySelector(".esquerda");
    const btnDir = div.querySelector(".direita");

    btnEsq.addEventListener("click", () => {
      index = (index - 1 + imagens.length) % imagens.length;
      imgEl.src = imagens[index];
    });

    btnDir.addEventListener("click", () => {
      index = (index + 1) % imagens.length;
      imgEl.src = imagens[index];
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

function mapa(){
  alert("Espera um pouquinho que iremos te dar o mapa⏩")
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