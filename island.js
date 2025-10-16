document.addEventListener("DOMContentLoaded", async function () {
    await alertTraduzido("Escolha a ilha que deseja visistar")
})

document.querySelectorAll(".ilhas").forEach((e) => {
    e.addEventListener("click", async function () {
        await mostra(e.id)
    })
})

async function mostra(id) {
    let island = String(id).replaceAll("_", " ")
    console.log(island)
    localStorage.setItem("ilhas", island)
    
    await alertTraduzido("Ilha definida com sucesso")
    window.location.href="home.html"

}


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
        alert(textoTraduzido, idiomaDestino);
    } catch (err) {
        console.error("Erro na tradução:", err);
        alert(texto); // Fallback
    }
}

