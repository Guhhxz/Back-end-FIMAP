// Importando as dependências
require("dotenv").config()

const express = require("express")
const cors = require("cors")

// Importando as rotas
const openFinanceRoutes = require("./routes/openFinanceRoutes")

// Criando a aplicação
const app = express()

// Configurando o CORS
const corsOption = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}

// Aplicando os middlewares
app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rota inicial
app.get("/", (req, res) => {
    res.status(200).json({
        mensagem: "API funcionando!",
        status: "online"
    })
})


// Rotas do Open Finance
app.use("/v1/openfinance", openFinanceRoutes)





// Inicializando o servidor
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
