document.addEventListener("DOMContentLoaded",async function(){
    await Novo_registro()
    await apanha_sol()
    document.dispatchEvent(new Event("traduzir"))
})

function apanha(id){
    return document.getElementById(id)
}

async function apanha_sol(){
    let user=await getData("prismacv","usuarios","username")
    console.log(user)
    let len=user.length
    let username=user[len-1]

    let response=await fetch("https://cvprisma.vercel.app/data_reserva",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({usuario:username,ids:[]})
    })

    let res=await response.json()
    await Trabalhar_dados(res)

}

async function Trabalhar_dados(data_){
    let campo=apanha("campo_mail")
    let data=data_.reverse()
    data.map((e)=>{
        let {destinatario,autor,data,preco,vista,resposta,telefone,lugar,id,compra}=e
        let html=`
        ${vista!=null?`<p class="dias">${verificarData(resposta)=="data invalida"?"":verificarData(resposta)}</p>`:""}
        <h6>Cliente: ${autor}</h6>
        <h6>Telefoen: ${telefone}</h6>
        <h6>Destino: ${lugar}</h6>
        <h6>Empresa: ${destinatario}</h6>
        <h6>Data: ${data}</h6>
        <h6>Preço: ${preco}ECV</h6>
        ${compra==true?`<button id="aceito" style="background-color:black; border-color:black">Reserva de ${preco}Ecv concluida</button>`:
        `        
        ${
            vista==null?`<p id='aguarde'>Aguardando Resposta da empresa</p><h5 class='cancela_' onclick='cancela_(${id})'>Cancelar solicitação</h5>`:vista==true && verificarData(`${resposta}`)!="prazo expirado"?`<button id="aceito" onclick='pagamento("${destinatario}",${preco},${id})'>Efetuar reserva ${preco}$Ecv</button><h5 class='cancela_' onclick='cancela_(${id})'>Cancelar solicitação</h5>`:`<h3>Reserva não aceitada</h3>`
        }
        `
      }
        

`

        let article=document.createElement("article")
        article.innerHTML=html
        article.className="campos_mail_x"

        campo.appendChild(article)
    })
    if(data.length==0){
        let html_="<h4>Ainda nenhuma solicitação ou reserva feita</h4><h2>::>_<::</h2>"
        let nav=document.createElement("nav")
        nav.innerHTML=html_
        nav.id="saida_nada"
        campo.appendChild(nav)
    }
}


function verificarData(prazoString) {
  let prazo = null;
  let hoje = null;

  if (prazoString != null && prazoString != "") {
    console.log(prazoString);
    prazo = new Date(prazoString);
    hoje = new Date();
  }

  // Se não houver data válida, retorna aviso
  if (!prazo || !hoje) return "data invalida";

  if (hoje > prazo || hoje.getTime() === prazo.getTime()) {
    return "prazo expirado"; // já passou
  } else {
    // calcula quantos dias faltam
    const diferenca = prazo - hoje; // diferença em milissegundos
    const diasFaltando = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
    return `${diasFaltando} dia(s) para responder`;
  }
}

function getData(dbName, storeName, columnName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onerror = (event) => {
      reject("Erro ao abrir o banco: " + event.target.errorCode);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);

      const result = [];

      // abrir cursor para percorrer todos os dados
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          // pega só o campo que você pediu (coluna)
          result.push(cursor.value[columnName]);
          cursor.continue();
        } else {
          resolve(result); // terminou de ler todos
        }
      };

      cursorRequest.onerror = (e) => {
        reject("Erro ao ler os dados: " + e.target.errorCode);
      };
    };
  });
}

async function Novo_registro(){
  let params=new URLSearchParams(window.location.search)
  let valida=params.get("valida")
  let empresa=params.get("empresa")
  let preco=params.get("preco")
  let nome=params.get("nome")

  if(valida==1){
    const hoje = new Date();

    // Formato padrão (aaaa-mm-dd), usado em <input type="date">
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // meses começam em 0
    const dia = String(hoje.getDate()).padStart(2, '0');

    const dataHoje = `${ano}-${mes}-${dia}`;
    let btn=document.createElement("button")
    btn.innerText="Enviar"
    btn.id="envia_data"

    btn.onclick=async ()=>{
      await enviar(`${name}`,`${empresa}`,`${preco}`,`${nome}`)
    }

    let df=document.createElement("div")
    df.id="move_y"

    let name=await getData("prismacv","usuarios","username")
    let html=`
    <span class="material-icons" onclick="go_up()">close</span>
    <img src="img/logo_2_png.png">
    <input type="text" value="${name}"readonly>
    <input type="tel" id="telefone_novo"placeholder="Numero telefone(📞)">
    <input type="text" value="${empresa}" readonly>
    <input type="text" value="${nome}" readonly>
    <input type="date" id="data_novo" required onclick="datas_()" min="${dataHoje}">
    <input type="text" value="${preco}ECV" readonly>`



    let cria=document.createElement("div")
    cria.innerHTML=html
    cria.appendChild(btn)
    cria.appendChild(df)
    cria.id="novo_criar"
    window.document.body.appendChild(cria)
  }
}

async function go_up(){
  await alertTraduzido("Não se preocupes, temos outras opções ainda melhores para ti!")
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
    alert(textoTraduzido,idiomaDestino);
  } catch (err) {
    console.error("Erro na tradução:", err);
    alert(texto); // Fallback
  }
}

let x=1

function datas_(){
  if(x==1){
    alertTraduzido('Aqui você deve indicar a data em que pretende ao local.')
    x=2
  }
}

async function enviar(nome,empresa,preco,nome_l){
  let tel=apanha("telefone_novo").value
  let data_=String(apanha("data_novo").value).split("-")
  console.log("hhh",data_)

  if(tel.length>0 && data_.length>=2){
    alertTraduzido("Por favor, aguarde a resposta da empresa.")
    let data=`${data_[2]}-${data_[1]}-${data_[0]}`
    let obj={
      nome:nome,
      telefone:tel,
      empresa:empresa,
      data:data,
      preco:preco,
      nome_l:nome_l
  
    }
  
    await fetch("https://cvprisma.vercel.app/data_envia",{
      method:"post",
      headers:{
        "content-type":"application/json"
      },
      body:JSON.stringify(obj)
    })

    window.location.href="mail.html"
  }
  else{
    alertTraduzido("Preenche bem todos os campos!!")
  }
  
}

async function cancela_(id){
  let loading=document.getElementById("loading_").style
  loading.display="block"
  let response=await fetch("https://cvprisma.vercel.app/data_cancela_reg",{
    method:"post",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify({id:id})
  })
  if(response.ok){
    alertTraduzido("Cancelado com sucesso")
    location.reload()
    loading.display="none"
  }
  else{
    alertTraduzido("Deu erro tente denovo mais tarde")
    loading.display="none"
  }

}

function pagamento(empresa,preco,id){
  alert("Estas a um passo de consiguir o que desejas")
  window.location.href=`banco.html?emp=${empresa}&pr=${preco}&tk=${id}`
}
//https://cvprisma.vercel.app