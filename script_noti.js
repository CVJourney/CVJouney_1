// script_noti.js (Service Worker)
self.addEventListener("install", event => {
    console.log("Service Worker instalado");
    self.skipWaiting(); // ativa imediatamente
});

self.addEventListener("activate", event => {
    console.log("Service Worker ativo");
});

// Evento de sincronização
self.addEventListener("sync", event => {
    if (event.tag === "verificar-reservas") {
        event.waitUntil(buscarReservas());
    }
});

// Função que busca reservas e mostra notificações

async function buscarReservas() {
    console.log("notifica")
    console.log("ooooo-",ids)
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
            if (e.vista === true && e.compra !== true) {
                let td = await alertTraduzido(`Resposta sobre a reserva ||| Resposta sobre a reserva do ${e.lugar}. Consulte o site para ver a resposta completa.`)
                let sep = String(td).split("|||")
                const titulo = sep[0];
                const mensagem = sep[1];

                self.registration.showNotification(titulo, {
                    body: mensagem,
                    icon: "img/logo_2_png.png"
                });
            }
        });

    } catch (err) {
        console.error("Erro ao buscar reservas:", err);
    }
}
// /|/
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

async function alertTraduzido(texto) {
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

// Função para iniciar o IndexedDB
// Função para adicionar dados
