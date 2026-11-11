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
