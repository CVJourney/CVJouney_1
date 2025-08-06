document.addEventListener("DOMContentLoaded",async function(){
    const request = indexedDB.open("prismacv", 4);
    
    request.onsuccess = function (event) {
    const db = event.target.result;
    
    const tx = db.transaction("usuarios", "readonly");
    const store = tx.objectStore("usuarios");
    
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = function () {
        const usuarios = getAllRequest.result;
        console.log("Usuários encontrados:", usuarios);
        
        // aqui você pode fazer algo com os dados, por exemplo:
            usuarios.forEach(u => {
            console.log("gosto: ",u.gosto);
            campos(u.gosto)

        });
    };
    
    getAllRequest.onerror = function () {
        console.error("Erro ao buscar os usuários.");
    };
    };
    
    request.onerror = function () {
    console.error("Erro ao abrir o banco IndexedDB.");
    };

})

function campos(gosto){
    let campos_=document.getElementById("campos_")
    let all_campo=["artesanato","historico","gastronomia","fauna_marinha","aquaticos","trilhas","cultura","vulcao","praias"]

    let first=[]
    let last=[]

    all_campo.map((e)=>{
        if(gosto.includes(e)){
            first.unshift(e)
            console.log("ddddd--",e)
        }
        else{
            last.unshift(e)
            console.log("dddddo",e)
        }
    })

    let data=first.concat(last)
    console.log("----***",data)

    function cria(e){
        let lista=document.createElement("li")
        lista.innerText=String(e).replaceAll("_"," ")
        lista.onclick=()=>{
            go(e)
        }
        campos_.appendChild(lista)

    }

    data.map((e)=>{
        cria(e)
    })
    
}

function go(id) {
    let ver=`vermais_${id}`
    console.log(ver," veja agora")
    document.getElementById(ver).scrollIntoView({
        behavior: "smooth",
        block: "center" // ou "start", "end", "nearest"
    });
}

//data_info

//alert