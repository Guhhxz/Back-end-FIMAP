/*
 * PARA QUE SERVE: Monta e inicia o backend: configura o Express e conecta as rotas.
 * QUANDO ENTRA EM AÇÃO: Entra no npm start; nos testes pode ser importado sem abrir o servidor automaticamente.
 * QUANDO FAZ DIFERENÇA: Faz diferença para receber pedidos HTTP e iniciar o agendamento normal do backend.
 */

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
const chatRoutes = require("./routes/chatRoutes.js")
const mensagemChatRoutes = require("./routes/mensagemChatRoutes.js")
const chatPublicoController = require("./controller/MensagemChat/PublicChatController.js")
const limitarChat = require("./middlewares/limitarChat.js")
const seguir_seguidoresRoutes = require("./routes/seguir_seguidoresRoutes.js")
const notificacaoRoutes = require("./routes/notificacaoRoutes.js")
const postRoutes = require("./routes/postRoutes.js")

//exportanto jobs
const investimentoSnapshotJob = require('./jobs/investimentoSnapshotJob.js')

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
app.post("/v1/ia/chat-publico", limitarChat, chatPublicoController.conversarPublicamente)
app.use("/v1/ia/chats", mensagemChatRoutes)
app.use("/v1/ia/chat/", chatRoutes)
app.use("/v1/openfinance", openFinanceRoutes)
app.use("/v1/openfinance/usuario", usuarioRoutes)
app.use("/v1/seguindo", seguir_seguidoresRoutes)
app.use("/v1/configuracoes", configuracoesRoutes)
app.use("/v1/openfinance/metas", metasRoutes)
app.use("/v1/badge", badgeRoutes)
app.use("/v1", simulacoesRoutes)
app.use("/v1/notificacoes", notificacaoRoutes)
app.use("/v1/posts", postRoutes)

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500
    const mensagem = status === 413 ? 'O corpo da requisição excedeu o limite permitido.'
        : status === 400 ? 'O corpo precisa ser um JSON válido.' : 'Erro interno do servidor.'
    return res.status(status).json({ sucesso: false, mensagem })
})

if (require.main === module) {
    const PORT = process.env.PORT || 8080
    const servidor = app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`)
        investimentoSnapshotJob.agendar()
    })
    servidor.on("error", () => {
        console.error("Não foi possível iniciar o servidor.")
        process.exit(1)
    })
}

module.exports = app
