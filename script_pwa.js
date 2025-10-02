let deferredPrompt;
let veja=localStorage.getItem("pwa")
const pwa = document.getElementById("pwa");

// Checa se o app já está em modo standalone (tela inicial)
function checkStandalone() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    pwa.style.display = 'none'; // botão some
    return true;
  }
  return false;
}

// Inicial
checkStandalone();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (!checkStandalone()) {
    pwa.style.display = 'block'; // mostra o botão só se não estiver instalado
  }
});

pwa.addEventListener("click", async function(){
  veja = "null"; // mantém sua lógica
  document.dispatchEvent(new Event("pwa"));

  // Agora tentamos a instalação se houver deferredPrompt
  if (deferredPrompt) {
    deferredPrompt.prompt(); // mostra o prompt de instalação
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Usuário escolheu:', outcome);
    if (outcome === 'accepted') {
      pwa.style.display = 'none'; // esconde botão se aceitou
    }
    deferredPrompt = null; // limpa para não repetir
  } else {
    console.log("Instalação não disponível no momento.");
  }
});



document.addEventListener('pwa', async () => {
    console.log(`aqui esta ${'beforeinstallprompt' in window}`)
    
    if (!checkStandalone() && veja=="null") { // só mostra alert se ainda não estiver instalado
      const texto = "Tenha Cabo Verde sempre à mão! Adicione nosso site à sua tela inicial e acesse nossas dicas e roteiros de turismo com um toque.";
      localStorage.setItem("pwa","pwa")
      const aceitou = await alertTraduzido(texto);
      if (aceitou && deferredPrompt) {
        deferredPrompt.prompt(); // mostra o prompt oficial
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Usuário escolheu:', outcome);
        if (outcome === 'accepted') {
          pwa.style.display = 'none'; // some o botão após aceitar
        }
        deferredPrompt = null;
      }
    }
});


// Função de alerta com tradução
async function alertTraduzido(texto) {
  const idiomaDestino = localStorage.getItem("idioma"); // pega o idioma
  let confirmResult = true; // padrão para aceitar

  if (!idiomaDestino) {
    return confirm(texto); // mostra texto original
  }

  try {
    const resposta = await fetch("https://apiprisma.vercel.app/api_tradutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, idiomaDestino }),
    });
    const dados = await resposta.json();
    const textoTraduzido = dados.traducao;
    confirmResult = confirm(textoTraduzido);
  } catch (err) {
    console.error("Erro na tradução:", err);
    confirmResult = confirm(texto);
  }

  return confirmResult;
}
