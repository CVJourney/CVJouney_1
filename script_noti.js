// script_noti.js (Service Worker)
self.addEventListener("install", event => {
    console.log("Service Worker instalado");
    self.skipWaiting(); // ativa imediatamente
});

self.addEventListener("activate", event => {
    console.log("Service Worker ativo");
});


self.addEventListener("push", event => {
    console.log("Push recebido:", event);

    let data = {};
    try {
        data = event.data.json(); // tenta ler o JSON enviado pela API
        console.log(data)
    } catch (err) {
        data = { 
            title: "Notification", 
            body: "You have received a new message.", 
            icon: "img/logo_2_png.png" 
        };
    }

    const titulo = data.titulo || "New notification";
    const mensagem = data.mensagem || "You have received a new message.";
    const icone = data.icon || "img/logo_2_png.png";
    const url = "https://cvjourney.github.io/CVJouney_1/home.html"; // link para abrir quando clicar

    event.waitUntil(
        self.registration.showNotification(titulo, {
            body: mensagem,
            icon: icone,
            data: { url }
        })
    );
});


// Quando o usuário clica na notificação
self.addEventListener("notificationclick", event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});


