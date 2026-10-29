const configMensagens = require('../modulo/configMensagens.js')
const mensagemChatDAO = require('../../../model/DAO/MensagemChat/MensagemChatDAO.js')

const resposta = (res, status, dados) => res.status(status).json(dados)
const validarId = (valor) => {
    const id = Number(valor)
    return Number.isInteger(id) && id > 0 ? id : null
}

const listarMensagensChat = async (req, res) => {
    const chatId = validarId(req.params.chatId)
    const antesDe = req.query.antes_de === undefined ? undefined : validarId(req.query.antes_de)
    const limite = req.query.limite === undefined ? 30 : Number(req.query.limite)
    if (
        !chatId ||
        (req.query.antes_de !== undefined && !antesDe) ||
        !Number.isInteger(limite) ||
        limite < 1 ||
        limite > 100
    ) {
        return resposta(res, 400, configMensagens.ERROR_BAD_REQUEST)
    }
    try {
        const pagina = await mensagemChatDAO.listarMensagensChat(chatId, { antesDe, limite })
        if (!pagina) return resposta(res, 404, configMensagens.ERROR_CHAT_NOT_FOUND)
        return resposta(res, 200, pagina)
    } catch (error) {
        console.error('Erro ao listar mensagens do chat:', error)
        return resposta(res, 500, configMensagens.ERROR_INTERNAL_SERVER)
    }
}

const enviarMensagemChat = async (req, res) => {
    const chatId = validarId(req.params.chatId)
    const conteudo = typeof req.body?.conteudo === 'string' ? req.body.conteudo.trim() : ''
    if (!chatId) return resposta(res, 400, configMensagens.ERROR_BAD_REQUEST)
    if (!conteudo || conteudo.length > 4000)
        return resposta(res, 400, configMensagens.ERROR_INVALID_MESSAGE)

    res.status(200)
    res.set({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
    })
    res.flushHeaders()
    const evento = (dados) => res.write(`data: ${JSON.stringify(dados)}\n\n`)
    try {
        const resultado = await mensagemChatDAO.iniciarMensagemChat(chatId, conteudo, (trecho) =>
            evento({ tipo: 'trecho', conteudo: trecho })
        )
        if (!resultado)
            evento({
                tipo: 'erro',
                mensagem: configMensagens.ERROR_CHAT_NOT_FOUND.mensagem || 'Chat não encontrado.'
            })
        else
            evento({
                tipo: 'fim',
                mensagem_usuario: resultado.mensagem_usuario,
                mensagem_assistente: resultado.mensagem_assistente
            })
    } catch (error) {
        console.error('Erro ao enviar mensagem para a Cloudflare:', error)
        const mensagens = {
            CLOUDFLARE_NOT_CONFIGURED: 'Configure CLOUDFLARE_CHAT_TOKEN no arquivo .env.',
            CLOUDFLARE_AUTH_ERROR:
                'O token do backend não corresponde ao token configurado no Worker.',
            CLOUDFLARE_URL_ERROR:
                'Confira CLOUDFLARE_WORKER_URL; use a URL do Worker terminada em /chat.',
            CLOUDFLARE_TIMEOUT: 'A Cloudflare demorou demais para responder. Tente novamente.',
            CLOUDFLARE_UNAVAILABLE: 'Não foi possível conectar ao Worker da Cloudflare.',
            CLOUDFLARE_PROVIDER_ERROR: error.message,
            CLOUDFLARE_INVALID_RESPONSE: error.message
        }
        evento({
            tipo: 'erro',
            mensagem:
                mensagens[error.code] || error.message || 'Não foi possível obter resposta da IA.'
        })
    } finally {
        res.end()
    }
}

module.exports = { listarMensagensChat, enviarMensagemChat }
