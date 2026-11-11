// Importando as dependências
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
})

const express = require("express")
const cors = require("cors")

// Importando rotas e controllers
const openFinanceRoutes = require("../src/routes/openFinanceRoutes.js")
const usuarioRoutes = require("./routes/usuarioRoutes.js")
const simulacoesRoutes = require('./routes/simulacoesRoutes.js')
const metasRoutes = require('./routes/metasRoutes.js')
const configuracoesRoutes = require('./routes/configuracoesRoutes.js')
const badgeRoutes = require('./routes/badgeRoutes.js')
const mensagemChatController = require("./controller/MensagemChat/MensagemChatController.js")
const chatPublicoController = require("./controller/MensagemChat/PublicChatController.js")
const seguir_seguidoresRoutes = require("./routes/seguir_seguidoresRoutes.js")
const notificacaoRoutes = require("./routes/notificacaoRoutes.js")

const app = express()

const corsOption = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOption))
app.use(express.json({ limit: "192kb" }))
app.use(express.urlencoded({ extended: true }))

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
    res.once('close', () => {
        if (!res.writableEnded && ultimaPerguntaPorIp.get(ip) === agora) ultimaPerguntaPorIp.delete(ip)
    })
    return next()
}

app.post('/v1/ia/chat-publico', limitarUsoPublico, chatPublicoController.conversarPublicamente)
// Endpoints do Swagger para consultar e enviar mensagens de um chat
app.get("/v1/ia/chats/:chatId/mensagens", mensagemChatController.listarMensagensChat)
app.post("/v1/ia/chats/:chatId/mensagens", mensagemChatController.enviarMensagemChat)
app.use("/v1/openfinance", openFinanceRoutes)
app.use("/v1/openfinance/usuario", usuarioRoutes)
app.use("/v1/openfinance/seguindo", seguir_seguidoresRoutes)
app.use("/v1/configuracoes", configuracoesRoutes)
app.use("/v1/openfinance/metas", metasRoutes)
app.use("/v1/badge", badgeRoutes)
app.use("/v1/simulacoes", simulacoesRoutes)
app.use("/v1/notificacoes", notificacaoRoutes)

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
