const dao = require('../../../model/DAO/Chat/ChatDAO.js')
const { criarErro, validarId } = require('../../services/chatValidation.js')
const { responderErro } = require('../../services/chatStream.js')

const idChat = (req) => {
    const id = validarId(req.params.id_chat)
    if (!id) throw criarErro(400, 'ID do chat inválido.', 'CHAT_ID_INVALIDO')
    return id
}
const idUsuario = (req) => {
    const id = validarId(req.params.id_usuario)
    if (!id) throw criarErro(400, 'ID do usuário inválido.', 'USUARIO_ID_INVALIDO')
    return id
}
const nomeChat = (req) => {
    const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : ''
    if (!nome || nome.length > 45) throw criarErro(400, 'O nome deve ter entre 1 e 45 caracteres.', 'CHAT_NOME_INVALIDO')
    return nome
}
const naoEncontrado = () => criarErro(404, 'Chat não encontrado.', 'CHAT_NAO_ENCONTRADO')

const CriarChat = async (req, res) => {
    try {
        const nome = nomeChat(req)
        const id = await dao.insertChat(nome, idUsuario(req))
        return res.status(201).json({ sucesso: true, mensagem: 'Chat criado com sucesso.', id, nome })
    } catch (error) { return responderErro(res, error) }
}
const ListarChatsPorUsuario = async (req, res) => {
    try {
        const conteudo = await dao.ListChatsByUserId(idUsuario(req))
        return res.json({ sucesso: true, mensagem: 'Chats consultados com sucesso.', quantidade: conteudo.length, conteudo })
    } catch (error) { return responderErro(res, error) }
}
const ListaPorId = async (req, res) => {
    try {
        const conteudo = await dao.GetChatById(idChat(req), idUsuario(req))
        if (!conteudo) throw naoEncontrado()
        return res.json({ sucesso: true, mensagem: 'Chat consultado com sucesso.', conteudo })
    } catch (error) { return responderErro(res, error) }
}
const AtualizarNomeChat = async (req, res) => {
    try {
        const id = idChat(req), nome = nomeChat(req), usuario = idUsuario(req)
        const atual = await dao.GetChatById(id, usuario)
        if (!atual) throw naoEncontrado()
        if (atual.nome !== nome && !await dao.UpdateChatName(id, nome, usuario)) throw naoEncontrado()
        return res.json({ sucesso: true, mensagem: 'Chat atualizado com sucesso.' })
    } catch (error) { return responderErro(res, error) }
}
const ApagarChat = async (req, res) => {
    try {
        if (!await dao.apagarChat(idChat(req), idUsuario(req))) throw naoEncontrado()
        return res.json({ sucesso: true, mensagem: 'Chat apagado com sucesso.' })
    } catch (error) { return responderErro(res, error) }
}
module.exports = { CriarChat, ListarChatsPorUsuario, ListaPorId, AtualizarNomeChat, ApagarChat }