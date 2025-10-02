document.addEventListener("notifica_in",async function(){
    await buscarReservas()
})

async function buscarReservas() {
    console.log("notifica")
    try {
        const username = await pegarUltimoUsuario();
        if (!username) return;

        const response = await fetch("https://cvprisma.vercel.app/data_reserva", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ usuario: username})
        });

        const data = await response.json();

        data.forEach(async (e) => {
            if (e.vista == true && e.compra != true) {
                let td = await alertTraduzido2(`Resposta sobre a reserva ||| Resposta sobre a reserva do ${e.lugar}. Consulte o site para ver a resposta completa.`)
                let sep = String(td).split("|||")
                const titulo = sep[0];
                const mensagem = sep[1];
                showNotification(titulo, mensagem, "info", 5000);
            }
        });

    } catch (err) {
        console.error("Erro ao buscar reservas:", err);
    }
}
// Pega último usuário salvo no IndexedDB
async function pegarUltimoUsuario() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("prismacv");
        request.onsuccess = e => {
            const db = e.target.result;
            const tx = db.transaction("usuarios", "readonly");
            const store = tx.objectStore("usuarios");
            const getAll = store.getAll();

            getAll.onsuccess = () => {
                const arr = getAll.result;
                if (arr.length > 0) resolve(arr[arr.length - 1].username);
                else resolve(null);
            };
            getAll.onerror = err => reject(err);
        };
        request.onerror = err => reject(err);
    });
}

// Pega o idioma do último usuário salvo no IndexedDB
async function pegarIdioma() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("idiomas", 1);

        request.onsuccess = e => {
            const db = e.target.result;

            // Verifica se existe o objectStore
            if (!db.objectStoreNames.contains("usuarios")) {
                resolve(null);
                return;
            }

            const tx = db.transaction("usuarios", "readonly");
            const store = tx.objectStore("usuarios");

            const getAll = store.getAll();

            getAll.onsuccess = () => {
                const arr = getAll.result;
                if (arr.length > 0) {
                    // Pega o último registro e retorna o campo idioma
                    resolve(arr[arr.length - 1].idioma);
                } else {
                    resolve(null);
                }
            };

            getAll.onerror = err => reject(err);
        };

        request.onerror = err => reject(err);
    });
}
//|||
async function alertTraduzido2(texto) {
    const idiomaDestino = await pegarIdioma(); // ✅ pega do IndexedDB

    if (!idiomaDestino) {
        console.warn("Idioma não encontrado. Mostrando texto original.");
        return texto;
    }

    try {
        const resposta = await fetch("https://apiprisma.vercel.app/api_tradutor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto, idiomaDestino })
        });

        const dados = await resposta.json();
        return dados.traducao;
    } catch (err) {
        console.error("Erro na tradução:", err);
        return texto; // fallback
    }
}

// --- SISTEMA DE NOTIFICAÇÕES ---
(function () {
    let container = document.querySelector('.nv-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'nv-container';
        document.body.appendChild(container);
    }

    const cores = ['#fdc04d', '#f5d291ff', '#ffad6aff', '#fca400', '#fcbc73ff'];
    let indiceCor = 0;

    let fila = [];
    let exibindo = false;

    window.showNotification = function (titulo, mensagem, type = "info", timeout = 6000) {
        fila.push({ titulo, mensagem, type, timeout });
        exibirProxima();
    };

    function exibirProxima() {
        if (exibindo || fila.length === 0) return;

        exibindo = true;
        const { titulo, mensagem, type, timeout } = fila.shift();

        const el = document.createElement('div');
        el.className = `nv-notification nv-${type}`;
        // muda a cor de fundo da notificação
        el.style.backgroundColor = cores[indiceCor];
        indiceCor = (indiceCor + 1) % cores.length; // próxima cor da lista

        // ação de clique
        el.onclick = () => {
            gomail();
        };

        // botão de fechar
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.className = "nv-close";
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            fecharNotificacao(el);
        };

        // conteúdo
        const titleEl = document.createElement("div");
        titleEl.style.fontWeight = "bold";
        titleEl.style.marginBottom = "6px";
        titleEl.textContent = titulo;

        const msgEl = document.createElement("div");
        msgEl.textContent = mensagem;

        el.appendChild(titleEl);
        el.appendChild(msgEl);
        el.appendChild(closeBtn);
        container.appendChild(el);

        // animação de entrada
        requestAnimationFrame(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        });

        // tocar som
        tocarSom();

        // remover depois do timeout
        const timer = setTimeout(() => fecharNotificacao(el), timeout);

        function fecharNotificacao(el) {
            clearTimeout(timer);
            el.style.opacity = "0";
            el.style.transform = "translateY(-10px)";
            setTimeout(() => {
                el.remove();
                exibindo = false;
                exibirProxima();
            }, 300);
        }
    }

    function tocarSom() {
        const audio = new Audio('notification.wav');
        audio.play().catch(err => console.warn("Som bloqueado pelo navegador", err));
    }

})();

function gomail() {
    window.location.href = "mail.html";
}

