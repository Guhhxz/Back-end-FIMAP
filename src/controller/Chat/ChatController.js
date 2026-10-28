const chatDAO = require('../../../model/DAO/Chat/ChatDAO.js')

const enviar = (res, status, dados) => res.status(status).json(dados)
const idPositivo = (valor) => {
    const id = Number(valor)
    return Number.isInteger(id) && id > 0 ? id : null
}
const idUsuarioAutenticado = (req) => idPositivo(
    req.usuario?.id ?? req.usuario?.id_usuario ?? req.user?.id ?? req.user?.id_usuario
)
const erroInterno = (res, error, operacao) => {
    console.error(`Erro ao ${operacao}:`, error)
    return enviar(res, 500, { sucesso: false, mensagem: 'Erro interno do servidor.' })
}

const criarChat = async (req, res) => {
    const usuarioId = idUsuarioAutenticado(req)
    const nome = req.body?.nome == null ? null : String(req.body.nome).trim()
    if (!usuarioId) return enviar(res, 401, { sucesso: false, mensagem: 'Usuário não autenticado.' })
    if (nome !== null && (!nome || nome.length > 45)) {
        return enviar(res, 400, { sucesso: false, mensagem: 'O nome deve conter entre 1 e 45 caracteres.' })
    }
    try {
        const chat = await chatDAO.criarChat(usuarioId, nome)
        return enviar(res, 201, chat)
    } catch (error) { return erroInterno(res, error, 'criar chat') }
}

const listarChats = async (req, res) => {
    const usuarioId = idUsuarioAutenticado(req)
    const pagina = req.query.pagina === undefined ? 1 : Number(req.query.pagina)
    const tamanho = req.query.tamanho_pagina === undefined ? 20 : Number(req.query.tamanho_pagina)
    if (!usuarioId) return enviar(res, 401, { sucesso: false, mensagem: 'Usuário não autenticado.' })
    if (!Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(tamanho) || tamanho < 1 || tamanho > 100) {
        return enviar(res, 400, { sucesso: false, mensagem: 'Parâmetros de paginação inválidos.' })
    }
    try {
        return enviar(res, 200, await chatDAO.listarChats(usuarioId, { pagina, tamanho }))
    } catch (error) { return erroInterno(res, error, 'listar chats') }
}

const consultarChat = async (req, res) => {
    const chatId = idPositivo(req.params.chatId)
    const usuarioId = idUsuarioAutenticado(req)
    if (!chatId) return enviar(res, 400, { sucesso: false, mensagem: 'ID do chat inválido.' })
    if (!usuarioId) return enviar(res, 401, { sucesso: false, mensagem: 'Usuário não autenticado.' })
    try {
        const chat = await chatDAO.consultarChat(chatId, usuarioId)
        return chat ? enviar(res, 200, chat) : enviar(res, 404, { sucesso: false, mensagem: 'Chat não encontrado.' })
    } catch (error) { return erroInterno(res, error, 'consultar chat') }
}

const renomearChat = async (req, res) => {
    const chatId = idPositivo(req.params.chatId)
    const usuarioId = idUsuarioAutenticado(req)
    const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : ''
    if (!chatId || !nome || nome.length > 45) return enviar(res, 400, { sucesso: false, mensagem: 'Informe um nome válido, com até 45 caracteres.' })
    if (!usuarioId) return enviar(res, 401, { sucesso: false, mensagem: 'Usuário não autenticado.' })
    try {
        const chat = await chatDAO.renomearChat(chatId, usuarioId, nome)
        return chat ? enviar(res, 200, chat) : enviar(res, 404, { sucesso: false, mensagem: 'Chat não encontrado.' })
    } catch (error) { return erroInterno(res, error, 'renomear chat') }
}

const deletarChat = async (req, res) => {
    const chatId = idPositivo(req.params.chatId)
    const usuarioId = idUsuarioAutenticado(req)
    if (!chatId) return enviar(res, 400, { sucesso: false, mensagem: 'ID do chat inválido.' })
    if (!usuarioId) return enviar(res, 401, { sucesso: false, mensagem: 'Usuário não autenticado.' })
    try {
        const deletado = await chatDAO.deletarChat(chatId, usuarioId)
        return deletado ? res.status(204).send() : enviar(res, 404, { sucesso: false, mensagem: 'Chat não encontrado.' })
    } catch (error) { return erroInterno(res, error, 'excluir chat') }
}

module.exports = { criarChat, listarChats, consultarChat, renomearChat, deletarChat }
