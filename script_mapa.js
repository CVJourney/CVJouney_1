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
                alert("❌ Permissão negada!\nPor favor, ative o acesso à localização para que possamos mostrar exatamente onde você está no mapa. 🌍")
                iframe.src="https://www.google.com/maps"
            }
        }
    )
    
    }
}

document.addEventListener("DOMContentLoaded",async function(){
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