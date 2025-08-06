function apanha(id){
    return document.getElementById(id)
}

function latlog(iframe){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(pos){
            let lat=pos.coords.latitude
            let log=pos.coords.longitude
            iframe.src=`https://www.google.com/maps?q=${lat},${log}&z=15&output=embed`

            console.log("deu",iframe)
        },
        function(erro){
            if(erro.code==1){
                alertTraduzido("❌ Permissão negada!\nPor favor, ative o acesso à localização para que possamos mostrar exatamente onde você está no mapa. 🌍")
                iframe.src="https://www.google.com/maps"
            }
        }
    )
    
    }
}

document.addEventListener("DOMContentLoaded",async function(){
    const evento = new CustomEvent("realiza");
    document.dispatchEvent(evento);
    console.log(evento)

    let mapa_gg=apanha("mapa_gg")
    
    latlog(mapa_gg)
})



apanha("serch").addEventListener("input",async function(){

    let place=this.value
    let iframe_=apanha("mapa_gg")
    
    if(place==""){
        latlog(iframe_)
    }
    else{

        let url=`https://www.google.com/maps?q=${place}+cabo+verde&output=embed`
        iframe_.src=url
        console.log(url,"**---/")

    }
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