async function pega(){
    let gosto=sessionStorage.getItem("gosto")
    console.log("1212",gosto)

    const data = JSON.parse(gosto);

    const grouped = {};

    data.forEach((item) => {
      if (!grouped[item.categoria]) grouped[item.categoria] = [];
      grouped[item.categoria].push(item);
    });
    
    const container = document.getElementById("container_new");
    container.innerHTML=""
    
    Object.entries(grouped).forEach(([categoria, locais]) => {

      const section = document.createElement("div");
      section.className = "categoria_new";
      section.id = categoria;

      const title = document.createElement("h2");
      title.innerText = String(categoria).replaceAll("_"," ");
      section.appendChild(title);

      const content = document.createElement("div");
      content.className = "content_new";
      
      locais.forEach(local => {
        let star=""
        let init=Number(local.estrela)
        while(init>0){
          star+="★"
          init-=1
        }
        const card = document.createElement("div");
        card.className = "card_new";
        card.id = `item_${local.id}_new`;
        card.onclick=()=>{
          procura(local.id)
        }
        card.innerHTML = `
          <img src="${local.imagem}" alt="${local.nome}">
          <h4 class="nome_x">${local.nome}</h4>
          <p class="ilha_x">${local.ilha}</p>
          <p class="star_x">${star}</p>
        `;
        content.appendChild(card);
      });

      const btn = document.createElement("button");
      btn.className = "vermais_new";
      btn.innerText = "Ver mais";
      btn.id=`vermais_${categoria}`
      btn.onclick = () => {
        vermais(categoria,`vermais_${categoria}`)
      };

      section.appendChild(content);
      section.appendChild(btn);
      container.appendChild(section);
    });
}

document.addEventListener("dadosCarregados",async function(){
  console.log("vai dar sim")
  await pega()
  document.dispatchEvent(new Event("traduzir"))
})



function vermais(div_,id) {
  const div = document.getElementById(div_);
  const btn = document.getElementById(id);

  if (div.classList.contains("area_conteudo_expandido_new")) {
    div.classList.remove("area_conteudo_expandido_new");
    btn.textContent = "Ver mais";

    document.querySelectorAll(".content_new").forEach(e=>{
      e.scrollTop=0
    })
    document.querySelectorAll(".content_new").forEach((e)=>{
      e.style.overflowY="hidden"
    })
  } 
  else {

    div.classList.add("area_conteudo_expandido_new");
    document.querySelectorAll(".content_new").forEach((e)=>{
      e.style.overflowY="auto"
    })
    btn.textContent = "Fechar";
  }
}

function procura(id){
  window.location.href=`info.html?id=${id}&url=empresas`
}

//alert