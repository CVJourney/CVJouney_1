async function taxista() {
  const params = new URLSearchParams(window.location.search);
  let id = params.get("wwr");
  const data = await post("http://localhost:4000/data_chama", id);
  const dados = data[0];
  console.log("--->", dados);

  function montarPerfil() {
    document.getElementById("perfil-img").src = dados.perfil;
    const info = `
      <h2>${dados.nome}</h2>
      <p><b>Marca:</b> ${dados.marca}</p>
      <p><b>Modelo:</b> ${dados.modelo}</p>
      <p><b>Chapa:</b> ${dados.chapa}</p>
      <p><b>Telefone:</b> ${dados.telefone}</p>
      <p><b>Estrela:</b> ${"⭐".repeat(dados.estrela)}</p>`;
    document.getElementById("info-text").innerHTML = info;

    const arr = dados.carro.split("[]");
    const carrossel = document.getElementById("carrossel");
    carrossel.innerHTML = "";

    const indicadores = document.getElementById("indicadores");
    indicadores.innerHTML = "";

    arr.forEach((url, index) => {
      const img = document.createElement("img");
      img.src = url;
      img.style.width = "300px";
      img.style.flexShrink = "0";
      img.style.scrollSnapAlign = "start";
      img.style.marginRight = "10px";
      carrossel.appendChild(img);

      const btn = document.createElement("button");
      btn.textContent = index + 1;
      btn.classList.add("btn-numero");
      btn.addEventListener("click", () => {
        img.scrollIntoView({ behavior: "smooth", inline: "start" });
      });
      indicadores.appendChild(btn);
    });

    function destacarIndicador() {
      const scrollLeft = carrossel.scrollLeft;
      const larguraImg = carrossel.firstChild.clientWidth + 10; // imagem + margem
      const indexAtivo = Math.round(scrollLeft / larguraImg);

      Array.from(indicadores.children).forEach((btn, i) => {
        btn.classList.toggle("ativo", i === indexAtivo);
      });
    }

    carrossel.addEventListener("scroll", destacarIndicador);

    destacarIndicador();
  }

  function montarFormulario() {
    const container = document.createElement("div");
    container.innerHTML = `
      <h3>Solicitar corrida</h3>
      <input type="text" id="destino" placeholder="Onde quero ir" />
      <input type="text" id="tempo" placeholder="Tempo para o táxi chegar até mim" />
      <select id="tipo" class="opt_">
        <option value="turrista">Turrista</option>
        <option value="morrador">Morrador</option>
      </select>
      <select id="guia_" class="opt_">
        <option value="Com guia">Com guia</option>
        <option value="Sem guia">Sem guia</option>
      </select>
      <button id="btnChamar">Prosseguir</button>
    `;
    document.querySelector(".container").appendChild(container);

    document.getElementById("btnChamar").addEventListener("click", async () => {
      const destino = document.getElementById("destino").value;
      const tempo = document.getElementById("tempo").value;
      const guia=document.getElementById("guia_").value
      const tipo=document.getElementById("tipo").value

      if (!destino || !tempo) {
        alert("Preencha todos os campos.");
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        console.log("Nome: ",dados.nome)
        console.log("id: ", dados.id)
        console.log("Destino:", destino);
        console.log("Tempo estimado:", tempo);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        console.log("Tipo: ",tipo)
        console.log("Guia: ",guia)
        let obj={
          id:dados.id,
          nome:dados.nome,
          destino:destino,
          tempo:tempo,
          lat:latitude,
          long:longitude,
          tipo:tipo,
          guia:guia
        }

        alert("Solicitação de corrida feito")
        await corida("http://localhost:4000/data_corrida",obj)
        
        

      }, err => alert("Erro ao obter localização: " + err.message));
    });
  }

  montarPerfil();
  montarFormulario();
}

async function post(url, id) {
  let response = await fetch(url, {
    method: "post",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ id: id })
  });

  let res = await response.json();
  return res;
}

document.addEventListener("DOMContentLoaded", async function() {
  await taxista();
});

async function corida(url,data){
  console.log("*999*",data)
  await fetch(url,{
    method:"post",
    headers:{
      "Content-type":"application/json"
    },
    body:JSON.stringify(data)
  })
}