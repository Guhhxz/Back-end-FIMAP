// Importando as dependências
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
})

const express = require("express")
const cors = require("cors")

// Importando rotas e controller de mensagens
const openFinanceRoutes = require("./routes/openFinanceRoutes")
const usuarioRoutes = require("./routes/usuarioRoutes.js")
const mensagemChatController = require("./controller/MensagemChat/MensagemChatController.js")

const app = express()

const corsOption = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.status(200).json({ mensagem: "API funcionando!", status: "online" })
})

// Endpoints do Swagger para consultar e enviar mensagens de um chat
app.get("/v1/ia/chats/:chatId/mensagens", mensagemChatController.listarMensagensChat)
app.post("/v1/ia/chats/:chatId/mensagens", mensagemChatController.enviarMensagemChat)

app.use("/v1/openfinance", openFinanceRoutes)
app.use("/v1/openfinance/usuario", usuarioRoutes)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
