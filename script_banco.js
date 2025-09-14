const client = filestack.init('AEaLomSYhSO657Kq1lFPEz');

function apanha(id){
    return document.getElementById(id)
}

document.addEventListener("DOMContentLoaded",async function(){
    await procurar()
    document.dispatchEvent(new Event("traduzir"))
})

async function procurar(){
    let params=new URLSearchParams(window.location.search)
    let empresa=params.get("emp")
    console.log(empresa)
    let preco=Number(params.get("pr"))

    let response=await fetch("https://cvprisma.vercel.app/data_bancaria",{
        method:"post",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({empresa:empresa})
    })
    let res=await response.json()
    console.log(res)
    trabalha(res,preco)
}

function trabalha(data,preco){
    let dados=data[0]
    let {nome,nib,banco}=dados
    apanha("nib").value=nib
    apanha("bank").value=banco
    apanha("account").value=nome
    apanha("price").value=preco
}

apanha("enviar").addEventListener("click",async()=>{
    let inputFile=apanha("files_")
    let v=new URLSearchParams(window.location.search)
    let tk=v.get("tk")

    if (inputFile.files.length === 0) {
        alert('Por favor, selecione um recibo para poder confirmar o pagamento');
        return;
    }
    alert("isso pode demorar um pouco, 1m 😣")

    const file = inputFile.files[0];

    try {
        // Upload para o Filestack
        const result = await client.upload(file);

        // Link do arquivo
        console.log('Arquivo enviado com sucesso!');
        console.log('URL do arquivo:', result.url);
        await enviar(tk,result.url)
    } 
    catch (err) {
        console.error('Erro ao enviar arquivo:', err);
    }
})

async function enviar(id,link){
    await fetch("https://cvprisma.vercel.app/data_done",{
        method:"post",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({id:id,link:link})
    })
    alert("Dados enviados com sucesso")
}
