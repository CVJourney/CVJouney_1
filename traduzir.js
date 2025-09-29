const classesIgnoradas = ['material-icons', 'estrela', 'nome_estadia', "local_estadia", "nome_des","ilhas_estadia","ilhas_","ilha_3","estrelas","chapa_","star_x"];

document.addEventListener("DOMContentLoaded", async () => {
  await traduzirPagina();
});

document.addEventListener("traduzir", async () => {
  await traduzirPagina();
});

async function traduzirPagina() {
  const idiomaDestino = await obterIdiomaDoIndexedDB();
  if (!idiomaDestino || idiomaDestino === "pt") return;

  mostrarLoading(idiomaDestino);

  const textosVisiveis = obterTodosTextosVisiveis();

  // Carrega do sessionStorage
  const cacheKey = `traduzidos_${idiomaDestino}`;
  const cacheJSON = sessionStorage.getItem(cacheKey);
  const traduzidos = new Map(cacheJSON ? JSON.parse(cacheJSON) : []);

  for (const textNode of textosVisiveis) {
    const textoOriginal = textNode.nodeValue.trim();
    if (textoOriginal && !traduzidos.has(textoOriginal)) {
      try {
        const textoTraduzido = await traduzirTexto(textoOriginal, idiomaDestino);
        const capitalizado = capitalizarInicial(textoTraduzido);
        traduzidos.set(textoOriginal, capitalizado);
        textNode.nodeValue = capitalizado;
      } catch (e) {
        console.error("Erro ao traduzir:", textoOriginal, e);
      }
    } else if (traduzidos.has(textoOriginal)) {
      textNode.nodeValue = traduzidos.get(textoOriginal);
    }
  }

  // Placeholders
  const inputs = document.querySelectorAll('input[type="text"], input[type="search"]');
  for (const input of inputs) {
    if (["usu_nome", "usu_username", "usu_senha", "usu_pontos"].includes(input.id)) continue;

    const placeholder = input.placeholder?.trim();
    if (placeholder && !traduzidos.has(placeholder)) {
      try {
        const traducao = await traduzirTexto(placeholder, idiomaDestino);
        const capitalizado = capitalizarInicial(traducao);
        traduzidos.set(placeholder, capitalizado);
        input.placeholder = capitalizado;
      } catch (e) {
        console.error("Erro ao traduzir placeholder:", placeholder, e);
      }
    } else if (traduzidos.has(placeholder)) {
      input.placeholder = traduzidos.get(placeholder);
    }
  }

  // Salva no sessionStorage
  sessionStorage.setItem(cacheKey, JSON.stringify(Array.from(traduzidos.entries())));

  removerLoading();
}

function obterTodosTextosVisiveis() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        const texto = node.nodeValue.trim();
        const parent = node.parentNode;

        if (!texto) return NodeFilter.FILTER_REJECT;
        if (!parent || !parent.tagName) return NodeFilter.FILTER_REJECT;

        const tagsIgnoradas = ['SCRIPT', 'STYLE', 'IMG', 'SVG', 'NOSCRIPT', 'META', 'LINK'];
        if (tagsIgnoradas.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;

        if (parent.classList) {
          for (const classe of classesIgnoradas) {
            if (parent.classList.contains(classe)) return NodeFilter.FILTER_REJECT;
          }
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  const textos = [];
  while (walker.nextNode()) {
    textos.push(walker.currentNode);
  }
  return textos;
}

async function traduzirTexto(texto, idiomaDestino) {

  const res = await fetch("https://apiprisma.vercel.app/api_tradutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto, idiomaDestino }),
  });
  localStorage.setItem("idioma",idiomaDestino)

  if (!res.ok) throw new Error("Erro na API de tradução");

  const data = await res.json();
  return data.traducao;
}

function capitalizarInicial(frase) {
  if (!frase) return frase;
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}

async function mostrarLoading(idiomaDestino) {
  const loadingBox = document.createElement("div");
  loadingBox.id = "tela-loading-traducao";
  loadingBox.style.zIndex="999999999999999999999999999999999999999999999999999999999999999999999999999999999999"
  loadingBox.style.position = "fixed";
  loadingBox.style.top = "10px";
  loadingBox.style.right = "10px";

  loadingBox.style.padding = "10px 15px";
  loadingBox.style.fontFamily = "Arial, sans-serif";
  loadingBox.style.fontSize = "14px";
  loadingBox.style.color="white"
  loadingBox.style.display = "flex";
  loadingBox.style.alignItems = "center";
  loadingBox.style.gap = "5px";

  loadingBox.innerHTML = `
    <span><strong>pt</strong></span>
    <span class="animando-setas">&gt;&gt;</span>
    <span><strong>${idiomaDestino}</strong></span>
  `;

  document.body.appendChild(loadingBox);

  // Adiciona a animação se ainda não estiver no documento
  if (!document.getElementById("animacao-setas-style")) {
    const style = document.createElement("style");
    style.id = "animacao-setas-style";
    style.innerHTML = `
      @keyframes colorShift {
        0%   { color: #fac888ff; }
        25%  { color: #f7b35aff; }
        50%  { color: #fcc88eff; }
        75%  { color: #ff8c08ff; }
        100% { color: #dd9000ff; }
      }

      .animando-setas {
        animation: colorShift 1.5s infinite;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }
}


function removerLoading() {
  const el = document.getElementById("tela-loading-traducao");
  if (el) el.remove();
}

async function obterIdiomaDoIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("idiomas");

    request.onerror = () => reject("Erro ao abrir IndexedDB");

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("usuarios", "readonly");
      const store = tx.objectStore("usuarios");
      const getReq = store.getAll();

      getReq.onsuccess = () => {
        const data = getReq.result[0];
        resolve(data?.idioma || null);
      };

      getReq.onerror = () => reject("Erro ao ler dados");
    };
  });
}
