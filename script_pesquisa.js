// Extrai nomes, agora com origem e índice para cada item
function extrairNomesComOrigem(obj, origemNome) {
  let nomes = [];

  function buscaNome(o) {
    if (!o || typeof o !== 'object') return;

    if ('nome' in o && typeof o.nome === 'string') {
      nomes.push({ nome: o.nome, obj: o, origem: origemNome, id: o.id });
    }

    for (const key in o) {
      if (typeof o[key] === 'object') {
        buscaNome(o[key]);
      }
    }
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => buscaNome(item, index));
  } else {
    buscaNome(obj, null);
  }

  return nomes;
}

// Calcula pontos entre termo buscado e texto alvo
function calculaPontos(busca, texto) {
  let pontos = 0;
  busca = busca.toLowerCase();
  texto = texto.toLowerCase();

  for (let i = 0; i < busca.length; i++) {
    let letraBusca = busca[i];
    let achou = false;

    for (let j = 0; j < texto.length; j++) {
      if (letraBusca === texto[j]) {
        pontos += 10;
        achou = true;
        break;
      }
    }

    if (!achou) {
      pontos -= 1;
    }
  }

  return pontos;
}

// Função principal de busca e exibição
function buscarEExibirComPontos(texto) {
  const container = document.getElementById('temas_pes');
  container.innerHTML = '';

  if (!texto) {
    container.innerHTML = '';
    return;
  }

  let dadosRestaurante = JSON.parse(sessionStorage.getItem('dadosRestaurante') || '[]');
  let gosto = JSON.parse(sessionStorage.getItem('gosto') || '[]');
  let cache_estadia = JSON.parse(sessionStorage.getItem('cache_estadia') || '[]');

  let listaNomes = [
    ...extrairNomesComOrigem(dadosRestaurante, 'dadosRestaurante'),
    ...extrairNomesComOrigem(gosto, 'gosto'),
    ...extrairNomesComOrigem(cache_estadia, 'cache_estadia')
  ];

  let resultadosComPontos = listaNomes.map(item => ({
    nome: item.nome,
    obj: item.obj,
    pontos: calculaPontos(texto, item.nome),
    origem: item.origem,
    id: item.id
  }));

  resultadosComPontos = resultadosComPontos.filter(r => r.pontos > 0);
  resultadosComPontos.sort((a, b) => b.pontos - a.pontos);
  resultadosComPontos = resultadosComPontos.slice(0, 10);

  if (resultadosComPontos.length === 0) {
    container.innerHTML = `<p>Nenhum resultado encontrado para: <strong>${texto}</strong></p>`;
    return;
  }

  resultadosComPontos.forEach(r => {
    let div = document.createElement('div');
    div.textContent = r.nome;
    div.style.cursor = 'pointer';
    div.style.padding = '8px';
    div.style.borderBottom = '1px solid #ddd';

    div.addEventListener('mouseenter', () => div.style.backgroundColor = '#e0f0ff');
    div.addEventListener('mouseleave', () => div.style.backgroundColor = '');

    div.addEventListener('click', () => {
      document.getElementById('pesquisa').value = r.nome;
      container.innerHTML = '';

      if (r.origem === 'cache_estadia') {
        window.location.href = `info.html?id=${r.id}&url=estadia`;
      } else if (r.origem === 'gosto') {
        window.location.href = `info.html?id=${r.id}&url=empresas`;
      } else if (r.origem === 'dadosRestaurante') {
        window.location.href = `res_destaque.html?id=${r.id}`;
      }
    });

    container.appendChild(div);
  });
}

// Escuta input para ativar busca
document.getElementById('pesquisa').addEventListener('input', e => {
  buscarEExibirComPontos(e.target.value.trim());
});

document.getElementById('pesquisa').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    const texto = e.target.value.trim().toLowerCase();

    let dadosRestaurante = JSON.parse(sessionStorage.getItem('dadosRestaurante') || '[]');
    let gosto = JSON.parse(sessionStorage.getItem('gosto') || '[]');
    let cache_estadia = JSON.parse(sessionStorage.getItem('cache_estadia') || '[]');

    let listaNomes = [
      ...extrairNomesComOrigem(dadosRestaurante, 'dadosRestaurante'),
      ...extrairNomesComOrigem(gosto, 'gosto'),
      ...extrairNomesComOrigem(cache_estadia, 'cache_estadia')
    ];

    // Verifica se o texto é igual ao nome de algum item
    const resultado = listaNomes.find(item => item.nome.toLowerCase() === texto);

    if (resultado) {
      if (resultado.origem === 'cache_estadia') {
        window.location.href = `info.html?id=${resultado.id}&url=estadia`;
      } else if (resultado.origem === 'gosto') {
        window.location.href = `info.html?id=${resultado.id}&url=empresas`;
      } else if (resultado.origem === 'dadosRestaurante') {
        window.location.href = `res_destaque.html?id=${resultado.id}`;
      }
    } else {
      alertTraduzido(`Não encontramos nada relacionado a "${e.target.value}"`);
    }
  }
});

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