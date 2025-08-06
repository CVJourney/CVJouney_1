document.addEventListener("DOMContentLoaded",async function(){
  const evento = new CustomEvent("realiza");
  document.dispatchEvent(evento);
    function getParam(nome) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(nome);
    }

    async function mostrarDetalhes(rest) {
      const container = document.getElementById("conteudo");
      let estrelas = "★".repeat(Number(rest.estrela));

      const fotos = (rest.fotos || "")
        .replace(/\[|\]/g, "")
        .split("{}")
        .map(f => f.trim())
        .filter(f => f);

      // Cria imagens do carrossel
      const imagensHTML = fotos.map((f, i) => `
        <img src="${f}" alt="Foto ${i+1}" class="${i === 0 ? 'ativo' : ''}" />
      `).join("");

      // Cria indicadores do carrossel
      const indicadoresHTML = fotos.map((_, i) => `
        <span class="${i === 0 ? 'ativo' : ''}"></span>
      `).join("");

      const carrosselHTML = `
        <div class="carrossel" id="carrossel">
          ${imagensHTML}
        </div>
        <div class="indicadores" id="indicadores">
          ${indicadoresHTML}
        </div>
      `;

      
      const infoHTML = `
      <h1>${rest.nome}</h1>
      <p style="text-align:center;">${rest.info}</p>
      <p class="estrelas" style="text-align:center;">${estrelas}</p>
      ${carrosselHTML}
      <p id="ilha_2">Ilha: <strong class="ilha_3">${rest.ilha}</strong></p>
      <img src="img/mapa_3.png" id="mapa_res"/>
      <h6 id="nome_sai">${rest.nome}</h6>
      `;




      const pratosHTML = `
        <h1 id="titulo_prato">Aqui estão os melhores pratos do(a) ${rest.nome}</h1>
        <div class="pratos-container">
          ${rest._pratos.map(p => `
            <div class="prato">
              <img src="${p.imagem}" alt="${p.nome}" />
              <p><strong>${p.nome}</strong></p>
              <p class="estrelas">${"★".repeat(Number(p.estrelas))}</p>
              <p class="dinheiro">${p.dinheiro}$ECV</p>
            </div>
          `).join("")}
        </div>
      `;

      container.innerHTML = infoHTML + pratosHTML;

      iniciarCarrossel(); // Inicia após inserir no DOM
    }

    function iniciarCarrossel() {
      const imagens = document.querySelectorAll('#carrossel img');
      const indicadores = document.querySelectorAll('#indicadores span');
      let index = 0;

      setInterval(() => {
        imagens[index].classList.remove('ativo');
        indicadores[index].classList.remove('ativo');

        index = (index + 1) % imagens.length;

        imagens[index].classList.add('ativo');
        indicadores[index].classList.add('ativo');
      }, 3000); // 3 segundos
    }

    const id = parseInt(getParam("id"));
    const raw = sessionStorage.getItem("dadosRestaurante");

    if (raw) {
      try {
        const dados = JSON.parse(raw);
        const restaurante = dados.find(r => r.id === id);

        if (restaurante) {
          mostrarDetalhes(restaurante);
        } else {
          document.body.innerHTML = "<p>Restaurante não encontrado.</p>";
        }
      } catch (e) {
        console.error("Erro ao processar dados:", e);
      }
    } else {
      document.body.innerHTML = "<p>Nenhum dado em cache.</p>";
    }

    document.getElementById("back").addEventListener("click",function(){
        window.location.href="restaurante.html"
    })

    document.getElementById("mapa_res").addEventListener("click",async function(){   
        let apa=document.getElementById("mapa_fim")
        apa.classList.remove("desaparece")
        let veja=document.getElementById("nome_sai").innerText
        let iframe=document.getElementById("mapa_show")
        let muda=String(veja).replaceAll(" ","+")
        iframe.src=`https://www.google.com/maps?q=${muda},+Cabo+Verde&output=embed`
        console.log(muda)
    })

    document.getElementById("sai_mapa").addEventListener("click",function(){
        document.getElementById("mapa_fim").className="desaparece"
    })

})


