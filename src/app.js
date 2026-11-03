// Importando as dependências
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
})

const express = require("express")
const cors = require("cors")
const path = require("path")

// Importando rotas e controllers
const openFinanceRoutes = require("./routes/openFinanceRoutes")
const usuarioRoutes = require("./routes/usuarioRoutes.js")
const simulacoesRoutes = require('./routes/simulacoesRoutes.js')
const mensagemChatController = require("./controller/MensagemChat/MensagemChatController.js")
const chatPublicoController = require("./controller/MensagemChat/PublicChatController.js")

const app = express()

const corsOption = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOption))
app.use(express.json({ limit: "32kb" }))
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "../index.html")))
app.get("/health", (req, res) => res.status(200).json({ online: true, servico: "fimap-api" }))

// Permite uma pergunta por IP a cada cinco segundos.
const intervaloEntrePerguntasMs = 5000
const ultimaPerguntaPorIp = new Map()
let ultimaLimpeza = Date.now()
const limitarUsoPublico = (req, res, next) => {
    const agora = Date.now()
    const ip = req.ip || req.socket.remoteAddress || 'desconhecido'
    const ultimaPergunta = ultimaPerguntaPorIp.get(ip)
    if (agora - ultimaLimpeza > 60000) {
        for (const [chave, horario] of ultimaPerguntaPorIp) {
            if (agora - horario >= 60000) ultimaPerguntaPorIp.delete(chave)
        }
        ultimaLimpeza = agora
    }
    if (ultimaPergunta && agora - ultimaPergunta < intervaloEntrePerguntasMs) {
        const segundos = Math.ceil((intervaloEntrePerguntasMs - (agora - ultimaPergunta)) / 1000)
        res.set('Retry-After', String(segundos))
        return res.status(429).json({ mensagem: `Aguarde ${segundos} segundo(s) antes de enviar outra pergunta.` })
    }
    ultimaPerguntaPorIp.set(ip, agora)
    return next()
}

app.post('/v1/ia/chat-publico', limitarUsoPublico, chatPublicoController.conversarPublicamente)
// Endpoints do Swagger para consultar e enviar mensagens de um chat
app.get("/v1/ia/chats/:chatId/mensagens", mensagemChatController.listarMensagensChat)
app.post("/v1/ia/chats/:chatId/mensagens", mensagemChatController.enviarMensagemChat)



app.use("/v1/openfinance", openFinanceRoutes)
app.use("/v1/openfinance/usuario", usuarioRoutes)

const PORT = process.env.PORT || 8080

const servidor = app.listen(PORT, (erro) => {
    if (erro) {
        console.error("Erro ao subir o servidor:", erro)
        process.exit(1)
    }
    console.log(`Servidor rodando na porta ${PORT}`)
})

servidor.on("error", (erro) => {
    console.error("Erro no servidor:", erro)
    process.exit(1)
})
