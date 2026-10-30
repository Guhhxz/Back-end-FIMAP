// Importando as dependências
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
})

const express = require("express")
const cors = require("cors")

// Importando rotas e controllers
const openFinanceRoutes = require("./routes/openFinanceRoutes")
const usuarioRoutes = require("./routes/usuarioRoutes.js")
const mensagemChatController = require("./controller/MensagemChat/MensagemChatController.js")
const redefinirSenhaController = require("./controller/Autenticacao/redefinirSenhaController.js")

const app = express()

const corsOption = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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

app.post("/v1/autenticacao/senha/recuperacao/redefinir", redefinirSenhaController.redefinirSenha)

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