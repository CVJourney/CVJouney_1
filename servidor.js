const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { Pool } = require("pg");

const app = express();

// Configurações de segurança e middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors()); // ATENÇÃO: você esqueceu os parênteses aqui

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Conexão com banco Neon
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_yDUYRHsk7d0q@ep-square-violet-ab2yp0b6-pooler.eu-west-2.aws.neon.tech/prismacv?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// Rota GET para retornar todos os usuários
app.get("/data_usuarios", async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM usuarios');
    let data=resultado.rows
    res.json(data); // CORRETO: pg retorna dados em `rows`

    console.log(data)
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

app.get("/data_estadia",async (req,res)=>{
  try {
    const resultado = await pool.query('SELECT id, fotos, nome, ilha, local, estrela FROM estadia WHERE reserva = false ORDER BY plano DESC, RANDOM()');
    let data=resultado.rows
    res.json(data); // CORRETO: pg retorna dados em `rows`

    console.log(data)
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
})

app.post("/data_usuarios_post",async (req,res)=>{
    let body=req.body
    let data=body
    console.log(data)

    let {name,username,password}=data

    let comando=`insert into usuarios (name,username,password) values ('${name}','${username}','${password}')`

    await pool.query(comando)
    console.log("fizemos tudo e deu certo...\ndados inseridos...")
    res.status(201).json({ message: "Usuário criado com sucesso" })
})

app.post("/data_empresas", async (req, res) => {
  let body = req.body;
  let { tema } = body;

  let comando = `
  SELECT id, nome, tipo, imagem, localizacao, ilha, estrela, categoria, plano,
         CASE 
           WHEN tipo = ANY(string_to_array('${tema}', ',')) THEN 0 
           ELSE 1 
         END AS prioridade
  FROM empresas
  ORDER BY 
    prioridade ASC,        -- Prioriza os temas enviados
    plano DESC,            -- Depois ordena pelo plano (3 > 2 > 1)
    RANDOM();              -- Depois aleatoriza entre os mesmos planos
  `;

  let dados = await pool.query(comando);
  let json_ = dados.rows;
  res.json(json_);
  console.log("Consulta executada com sucesso.");
});

app.post("/data_info",async (req,res)=>{
  let body=req.body
  let {id,bd}=body
  let comando=""
  if(String(bd)=="estadia"){
    comando=`select nome,fotos,local,ilha,custo,empresa,estrela,info from ${bd} where id=${id}`
  }
  else if(String(bd)=="empresas"){
    comando=`select nome,imagem,localizacao,ilha,estrela,info,empresa,custo from ${bd} where id=${id}`
  }

  let resposta=await pool.query(comando)
  let data=resposta.rows
  res.json(data)
  console.log(comando,bd,id,body)

})

// Iniciar servidor

app.get("/data_taxi",async (req,res)=>{
  let comando='SELECT * FROM taxi WHERE disponivel = TRUE ORDER BY plano, random();'
  let resposta=await pool.query(comando)
  let res_=resposta.rows
  console.log(res_)
  res.json(res_)
})

app.post("/data_manda",async(req,res)=>{
  let body=req.body
  let {nome}=body
  let comando=`select name,username,password,pontos from usuarios where username='${nome}'`
  let respo=await pool.query(comando)
  res.json(respo.rows)
  let manda=express.json(respo.rows)
  console.log(manda)
})

app.post("/data_chama",async (req,res)=>{
  console.log("veio")
  let body=req.body
  let {id}=body
  console.log("--->",id)
  let comando=`select * from taxi where id=${id}`
  let dd=await pool.query(comando)
  let res_=dd.rows
  res.json(res_)
})

app.post("/data_corrida",async (req,res)=>{
  console.log("Corrida solicitada...")
  let body=req.body
  let {id,nome,destino,tempo,lat,long,tipo,guia}=body
  let comando=`insert into corrida (id_, nome, cliente, destino, latitude,longitude, guia, tempo) values(${id},'${nome}','${tipo}','${destino}','${lat}','${long}','${guia}','${tempo}')`
  console.log(comando)
  await pool.query(comando)
})

app.get("/data_restaurante",async (req,res)=>{
  let comando=`SELECT *
FROM restaurante
WHERE plano IN (1, 2, 3)
ORDER BY
  plano DESC,   -- plano 3 primeiro, depois 2, depois 1
  RANDOM()
  LIMIT 50;     -- randomiza dentro de cada grupo de plano`

  let response=await pool.query(comando)
  let resp=response.rows

  res.json(resp)
})

app.post("/data_reserva",async (req,res)=>{
  let {usuario}=req.body
  let comando=`select * from mensagem where autor='${usuario}'`
  let response=await pool.query(comando)
  let resp=response.rows

  res.json(resp)
})

app.post("/data_envia",async (req,res)=>{
  let {nome,telefone,empresa,data,preco}=req.body
  let comando=`insert into mensagem (destinatario,preco,data,autor,telefone) values('${empresa}','${preco}','${data}','${nome}',${Number(telefone)})`
  console.log(req.body)

  await pool.query(comando)
  res.send("#ÉCaChatiaNou")
})

/*
module.exports=app
*/

const porta = 4000;
app.listen(porta, () => {
  console.log("Servidor rodando na porta", porta);
});
