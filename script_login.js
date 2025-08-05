
async function Fetch(url){

  let response=await fetch(url)
  let res=await response.json()

  return res
}

async function Fetch_post(url,option){
  await fetch(url,option)
}

function apanha(id){
  return document.getElementById(id)
}

async function chamada(tipo){
  console.log("deu")

  let nome=String(apanha("inome").value).toLowerCase()
  let senha=apanha("isenha").value
  let completo=apanha("completo").value
  let erro_senha=apanha("erro_senha")
  let load_div=apanha("div_loading")
  let centro_1=apanha("centra")
  let centro_2=apanha("centra_2")

  if(String(completo).length>25){
    alert("O teu username não pode ter mais de 25 digitos\nTente um mais pequeno")
  }

  let ver=String(nome).length>2 && String(senha).length>8 && String(completo).length>1 //ver essa parte 1º

  console.log(ver,nome,senha)

  /*pegando os dados do servidor */

  let data=await Fetch("https://cvprisma.vercel.app/data_usuarios")

  
  /*pegando os dados do servidor */
  
  let verefica=data.some(user=>{
    console.log(user.username)
    return user.username==nome
  })//vereficando se esse usuario é unico
  console.log("--",verefica,data)



  if(verefica && tipo==1){
    alert("Ja existe um usuario com esse username.\nTente outro porfavor")
  }
  
  else if(String(senha).length<8){
    erro_senha.classList.add("apareca")
    console.log("deu")
  }
  
  else if(ver==true && verefica==false){
    console.log("foi")

    // Tempos em milissegundos
    const DELAY_LOAD_SHOW = 350;
    const DELAY_CENTRO_1_SAIR = 300;
    const DELAY_CENTRO_2_APARECER = 300;
    const DELAY_CENTRO_2_APARECER_ESPERA = 40;

    function mostrarLoadDiv() {
      load_div.classList.add("show");
      console.log("load_div mostrado");
    }

    function animarCentro1() {
      centro_1.classList.add("sair");
      console.log("centro_1 saiu");
    }

    function animarCentro2() {
      centro_2.classList.remove("chaa");
      centro_2.classList.add("chama");
      console.log("centro_2 apareceu");
    }

    function removerLoadDiv() {
      load_div.classList.remove("show");
      console.log("load_div removido");
    }

    async function iniciarAnimacao() {
      await sleep(DELAY_LOAD_SHOW);
      mostrarLoadDiv();

      await sleep(DELAY_CENTRO_1_SAIR);
      animarCentro1();

      await sleep(DELAY_CENTRO_2_APARECER);
      animarCentro2();

      // Agora espera 1.5 segundos antes de continuar (div aparece visível)
      await sleep(DELAY_CENTRO_2_APARECER_ESPERA);

      removerLoadDiv();
    }

    // Função utilitária para pausar usando Promise
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Inicia a sequência
    iniciarAnimacao();

  }
}

document.getElementById("singin").addEventListener("click",()=>{chamada(1)})

document.querySelectorAll(".opt_lista").forEach(lista=>{
  lista.addEventListener("click",function(){
    console.log("ddd",window.getComputedStyle(lista).backgroundColor)
    if(String(window.getComputedStyle(lista).backgroundColor)=="rgb(255, 255, 255)"){
      this.style.backgroundColor="rgba(127, 240, 255, 0.712)"
      this.style.color="white"
    }
    else{
      this.style.backgroundColor="white"
      this.style.color="black"

    }
  })
})

document.getElementById("proximo").addEventListener("click", async function(){
  let escolha=[]
  
  document.querySelectorAll(".opt_lista").forEach(lista=>{

    let bk=window.getComputedStyle(lista).backgroundColor
    let val=""
    console.log("dja bem",bk)
    if(String(bk)=="rgba(127, 240, 255, 0.714)"){
      val=lista.innerText
      escolha.push(val)
    }
  })
  console.log(escolha)

  let chave=[]
  let len=escolha.length-1
  let tenta=true
  console.log("---f",escolha,len)

  while(len>=0){
    console.log("www")
    const valor = String(escolha[len]).toLowerCase();
    console.log("y---",valor)
    if (valor === "9".toLowerCase()) {
      chave.push( "praias");
    } else if (valor === "1".toLowerCase()) {
      chave.push( "vulcao");
    } else if (valor === "2".toLowerCase()) {
      chave.push( "cultura");
    } else if (valor === "3".toLowerCase()) {
      chave.push( "trilhas");
    } else if (valor === "4".toLowerCase()) {
      chave.push( "aquaticos");
    } else if (valor === "5".toLowerCase()) {
      chave.push( "fauna_marinha");
    } else if (valor === "6".toLowerCase()) {
      chave.push( "gastronomia");
    } else if (valor === "7".toLowerCase()) {
      chave.push( "historico");
    } else if (valor === "8".toLowerCase()) {
      chave.push( "artesanato");
    } else {
      if (tenta) {
        tenta = false;
        chave= ["praias", "cultura", "historico"];
      }
    }



    len-=1
  }

  console.log(`Escolha: ${escolha}\n${chave}`)
  let nome=String(apanha("inome").value).toLowerCase()
  let senha=String(apanha("isenha").value).toLowerCase()
  let completo=String(apanha("completo").value).toLowerCase()
  
  let obj={
    name:completo,
    username:nome,
    gosto:chave,
    password:senha
  }

  let url="https://cvprisma.vercel.app/data_usuarios_post"
  let opt={
    method:"post",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify(obj)
  }
  console.log(obj,"cuidado")

  await fetch(url,opt)
  
  try{
    await colocar({name:obj.name,username:obj.username,gosto:obj.gosto})
  }
  catch{
    console.log("erro")
  }
  






  
})


document.getElementById("perfil").addEventListener("click",async function(){
  let pegar=apanha("pegar_img")
  console.log("555")
  pegar.click()
})

apanha("pegar_img").addEventListener("change",async function(){
  const file = this.files[0];
  let img=apanha("perfil")
  let img_2=apanha("perfil_2")
  
  if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
          img.src = e.target.result; // exibe a imagem no <img>
          img_2.src = e.target.result; // exibe a imagem no <img>
      };

      reader.readAsDataURL(file); // lê o arquivo como base64
  }

  console.log("////--",file)
})

function colocar(data) {
  return new Promise((resolve, reject) => {
    console.log(data);
    let nome = data.name;
    let username = data.username;
    let gosto = data.gosto;

    const request = indexedDB.open("prismacv", 4);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("usuarios")) {
        db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = function(event) {
      const db = event.target.result;

      const tx = db.transaction("usuarios", "readwrite");
      const store = tx.objectStore("usuarios");

      const usuario = {
        perfil: apanha("perfil").src,
        nome: nome,
        username: username,
        gosto: gosto,
      };

      const addRequest = store.add(usuario);

      addRequest.onsuccess = () => {
        console.log("Usuário adicionado com sucesso!");
        resolve(); // sucesso, resolve a Promise
      };

      addRequest.onerror = (e) => {
        console.error("Erro ao adicionar usuário.", e);
        reject(e); // erro, rejeita a Promise
      };
    };

    request.onerror = function(event) {
      console.error("Erro ao abrir o banco:", event.target.error);
      reject(event.target.error);
    };

    window.location.href="home.html"
  });
}


//fundo_