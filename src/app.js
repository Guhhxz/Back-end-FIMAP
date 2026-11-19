// Variáveis de ambiente
require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env')
})

const express = require('express')
const cors = require('cors')

// Rotas
const openFinanceRoutes = require('./routes/openFinanceRoutes.js')
const usuarioRoutes = require('./routes/usuarioRoutes.js')
const simulacoesRoutes = require('./routes/simulacoesRoutes.js')
const metasRoutes = require('./routes/metasRoutes.js')
const configuracoesRoutes = require('./routes/configuracoesRoutes.js')
const badgeRoutes = require('./routes/badgeRoutes.js')
const chatRoutes = require('./routes/chatRoutes.js')
const comunidadeRoutes = require('./routes/comunidadeRoutes.js')
const seguirSeguidoresRoutes = require('./routes/seguir_seguidoresRoutes.js')
const notificacaoRoutes = require('./routes/notificacaoRoutes.js')

const sessaoRoutes = require('./routes/sessaoRoutes.js')
const mensagemChatRoutes = require('./routes/mensagemChatRoutes.js')
const chatPublicoController = require('./controller/MensagemChat/PublicChatController.js')
const limitarChat = require('./middlewares/limitarChat.js')

// Jobs
const investimentoSnapshotJob = require('./jobs/investimentoSnapshotJob.js')

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Retry-After', 'X-Requisicao-Id']
}

const app = express()

/* ---------------------------- Middlewares ---------------------------- */

app.use(cors(corsOptions))
app.use(express.json({ limit: '192kb' }))
app.use(express.urlencoded({ extended: true }))

/* ------------------------------- Rotas ------------------------------- */

app.get('/ping', (req, res) => {
    return res.status(200).json({ status: 'API funcionando no Render!' })
})

app.get('/health', (req, res) => res.status(200).json({ online: true, servico: 'fimap-api' }))
app.post('/v1/ia/chat-publico', limitarChat, chatPublicoController.conversarPublicamente)
app.use('/v1/ia/chats', mensagemChatRoutes)
app.use('/v1/ia/chat', chatRoutes)
app.use('/v1/openfinance', openFinanceRoutes)
app.use('/v1/openfinance/usuario', usuarioRoutes)
app.use('/v1/openfinance/metas', metasRoutes)
app.use('/v1/seguindo', seguirSeguidoresRoutes)
app.use('/v1/configuracoes', configuracoesRoutes)
app.use('/v1/badge', badgeRoutes)
app.use('/v1/simulacoes', simulacoesRoutes)
app.use('/v1/notificacoes', notificacaoRoutes)
app.use('/v1/comunidade/posts', comunidadeRoutes)
app.use('/v1/comunidade/posts/comentario', comunidadeRoutes)
app.use('/v1/comunidade/curtida', comunidadeRoutes)

app.use('/v1/sessao', sessaoRoutes)

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500
    const mensagem = status === 413 ? 'O corpo da requisição excedeu o limite permitido.'
        : status === 400 ? 'O corpo precisa ser um JSON válido.' : 'Erro interno do servidor.'
    return res.status(status).json({ sucesso: false, codigo: status === 500 ? 'ERRO_INTERNO' : 'REQUISICAO_INVALIDA', mensagem })
})

if (require.main === module) {
    const PORT = process.env.PORT || 8080
    const servidor = app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`)
        investimentoSnapshotJob.agendar()
    })
    servidor.on("error", (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Não foi possível iniciar: a porta ${PORT} já está em uso. Encerre a execução anterior ou configure outra PORT.`)
        } else if (error.code === 'EACCES') {
            console.error(`Não foi possível iniciar: sem permissão para usar a porta ${PORT}.`)
        } else {
            console.error('Não foi possível iniciar o servidor. Código:', error.code || 'ERRO_INTERNO')
        }
        process.exit(1)
    })
}

module.exports = app
