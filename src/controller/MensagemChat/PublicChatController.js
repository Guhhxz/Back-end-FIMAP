/*
 * PARA QUE SERVE: Recebe perguntas para conversar com a IA sem salvar a conversa no banco.
 * QUANDO ENTRA EM AÇÃO: Entra no POST /v1/ia/chat-publico; o cliente envia o contexto em messages.
 * QUANDO FAZ DIFERENÇA: Faz diferença para usar a IA mesmo sem consultar o MySQL.
 */

const ia = require('../../services/aiChatService.js')
const { validarMensagens } = require('../../services/chatValidation.js')
const { transmitir, responderErro } = require('../../services/chatStream.js')

// O contexto vem do corpo da requisição; nenhuma mensagem é buscada ou salva no banco.
const conversarPublicamente = async (req, res) => {
    try {
        const mensagens = validarMensagens(req.body?.messages)
        ia.obterConfiguracao()
        return await transmitir(res, async (aoReceberTrecho, signal) => {
            await ia.gerarResposta(mensagens, aoReceberTrecho, signal)
        })
    } catch (error) { return responderErro(res, error) }
}

module.exports = { conversarPublicamente }
