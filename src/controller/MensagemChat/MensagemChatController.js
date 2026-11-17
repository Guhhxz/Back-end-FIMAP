const { randomUUID } = require('node:crypto')
const dao = require('../../../model/DAO/MensagemChat/MensagemChatDAO.js')
const service = require('../../services/chatRequestService.js')
const { criarErro, validarId, validarMensagens, validarRequisicaoId } = require('../../services/chatValidation.js')
const { transmitir, responderErro } = require('../../services/chatStream.js')

const chatId = (req) => {
    const id = validarId(req.params.chatId ?? req.params.id_chat ?? req.body?.id_chat)
    if (!id) throw criarErro(400, 'ID do chat inválido.', 'CHAT_ID_INVALIDO')
    return id
}
const listarMensagensChat = async (req, res) => {
    try {
        const mensagens = await dao.listarMensagensChat(chatId(req), req.usuario.id)
        if (!mensagens) throw criarErro(404, 'Chat não encontrado.', 'CHAT_NAO_ENCONTRADO')
        return res.json({ sucesso: true, mensagem: 'Mensagens consultadas com sucesso.', conteudo: mensagens })
    } catch (error) { return responderErro(res, error) }
}
const enviarMensagemChat = async (req, res) => {
    try {
        const id = chatId(req)
        const [pergunta] = validarMensagens([{ role: 'user', content: req.body?.pergunta ?? req.body?.conteudo }])
        const uuid = req.body?.requisicao_id === undefined ? randomUUID() : validarRequisicaoId(req.body.requisicao_id)
        res.set({ 'X-Requisicao-Id': uuid })
        return await transmitir(res, (trecho, signal) => service.gerar(req.usuario.id, id, uuid, pergunta.content, trecho, signal))
    } catch (error) { return responderErro(res, error) }
}
const consultarRequisicao = async (req, res) => {
    try {
        const conteudo = await service.consultar(req.usuario.id, validarRequisicaoId(req.params.requisicaoId))
        return res.json({ sucesso: true, mensagem: 'Solicitação consultada com sucesso.', conteudo })
    } catch (error) { return responderErro(res, error) }
}
const cancelarRequisicao = async (req, res) => {
    try {
        const conteudo = await service.cancelar(req.usuario.id, validarRequisicaoId(req.params.requisicaoId))
        return res.json({ sucesso: true, mensagem: 'Estado da solicitação confirmado.', conteudo })
    } catch (error) { return responderErro(res, error) }
}
module.exports = { listarMensagensChat, enviarMensagemChat, consultarRequisicao, cancelarRequisicao }
