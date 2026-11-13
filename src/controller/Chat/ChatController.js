const config_message = require('../modulo/configMensagens.js')
const chatDAO = require('../../../model/DAO/Chat/ChatDAO.js')

const NOME_MAX = 45

const idValido = (id) => Number.isInteger(id) && id > 0

const CriarChat = async (req, res) => {
    try {
        const id_usuario = Number(req.body?.id_usuario)
        const nome = String(req.body?.nome ?? '').trim()

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        if (!nome) {
            return res.status(config_message.NOME_CHAT_OBRIGATORIO.status)
                .json({ sucesso: false, mensagem: config_message.NOME_CHAT_OBRIGATORIO.mensagem })
        }

        if (nome.length > NOME_MAX) {
            return res.status(config_message.NOME_CHAT_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.NOME_CHAT_INVALIDO.mensagem })
        }

        const id = await chatDAO.inssertChat(nome, id_usuario)

        if (!id) {
            return res.status(config_message.ERRO_CRIAR_CHAT.status)
                .json({ sucesso: false, mensagem: config_message.ERRO_CRIAR_CHAT.mensagem })
        }

        return res.status(config_message.CHAT_CRIADO.status)
            .json({ sucesso: true, mensagem: config_message.CHAT_CRIADO.mensagem, id, nome })
    } catch (error) {
        console.error('Erro ao criar chat:', error)
        return res.status(config_message.ERRO_CRIAR_CHAT.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_CRIAR_CHAT.mensagem })
    }
}

const ListarChatsPorUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        const chats = await chatDAO.ListChatsByUserId(id_usuario)

        return res.status(config_message.CHATS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.CHATS_ENCONTRADOS.mensagem,
            quantidade: chats.length,
            conteudo: chats
        })
    } catch (error) {
        console.error('Erro ao listar chats:', error)
        return res.status(config_message.ERRO_BUSCAR_CHATS.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_BUSCAR_CHATS.mensagem })
    }
}

const ListaPorId = async (req, res) => {
    try {
        const id_chat = Number(req.params.id_chat)

        if (!idValido(id_chat)) {
            return res.status(config_message.ID_CHAT_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_CHAT_INVALIDO.mensagem })
        }

        const chat = await chatDAO.GetChatById(id_chat)

        if (!chat) {
            return res.status(config_message.CHAT_NAO_ENCONTRADO.status)
                .json({ sucesso: false, mensagem: config_message.CHAT_NAO_ENCONTRADO.mensagem })
        }

        return res.status(config_message.CHAT_ENCONTRADO.status)
            .json({ sucesso: true, mensagem: config_message.CHAT_ENCONTRADO.mensagem, conteudo: chat })
    } catch (error) {
        console.error('Erro ao buscar chat por ID:', error)
        return res.status(config_message.ERRO_BUSCAR_CHAT.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_BUSCAR_CHAT.mensagem })
    }
}

const AtualizarNomeChat = async (req, res) => {
    try {
        const id_chat = Number(req.params.id_chat)
        const nome = String(req.body?.nome ?? '').trim()

        if (!idValido(id_chat)) {
            return res.status(config_message.ID_CHAT_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_CHAT_INVALIDO.mensagem })
        }

        if (!nome) {
            return res.status(config_message.NOME_CHAT_OBRIGATORIO.status)
                .json({ sucesso: false, mensagem: config_message.NOME_CHAT_OBRIGATORIO.mensagem })
        }

        if (nome.length > NOME_MAX) {
            return res.status(config_message.NOME_CHAT_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.NOME_CHAT_INVALIDO.mensagem })
        }

        const chat = await chatDAO.GetChatById(id_chat)

        if (!chat) {
            return res.status(config_message.CHAT_NAO_ENCONTRADO.status)
                .json({ sucesso: false, mensagem: config_message.CHAT_NAO_ENCONTRADO.mensagem })
        }

        await chatDAO.UpdateChatName(id_chat, nome)

        return res.status(config_message.CHAT_ATUALIZADO.status)
            .json({ sucesso: true, mensagem: config_message.CHAT_ATUALIZADO.mensagem })
    } catch (error) {
        console.error('Erro ao atualizar nome do chat:', error)
        return res.status(config_message.ERRO_ATUALIZAR_CHAT.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_ATUALIZAR_CHAT.mensagem })
    }
}

const ApagarChat = async (req, res) => {
    try {
        const id_chat = Number(req.params.id_chat)
        const id_usuario = Number(req.query?.id_usuario)

        if (!idValido(id_chat)) {
            return res.status(config_message.ID_CHAT_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_CHAT_INVALIDO.mensagem })
        }

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        const chat = await chatDAO.GetChatById(id_chat)

        if (!chat || chat.id_usuario !== id_usuario) {
            return res.status(config_message.CHAT_NAO_ENCONTRADO.status)
                .json({ sucesso: false, mensagem: config_message.CHAT_NAO_ENCONTRADO.mensagem })
        }

        await chatDAO.apagarChat(chat.id)

        return res.status(config_message.CHAT_DELETADO.status)
            .json({ sucesso: true, mensagem: config_message.CHAT_DELETADO.mensagem })
    } catch (error) {
        console.error('Erro ao apagar chat:', error)
        return res.status(config_message.ERRO_DELETAR_CHAT.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_DELETAR_CHAT.mensagem })
    }
}

const ListarTodosChats = async (req, res) => {
    try {
        const chats = await chatDAO.GetAllChats()

        return res.status(config_message.CHATS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.CHATS_ENCONTRADOS.mensagem,
            quantidade: chats.length,
            conteudo: chats
        })
    } catch (error) {
        console.error('Erro ao listar todos os chats:', error)
        return res.status(config_message.ERRO_BUSCAR_CHATS.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_BUSCAR_CHATS.mensagem })
    }
}

module.exports = {
    CriarChat,
    ListarChatsPorUsuario,
    ListaPorId,
    AtualizarNomeChat,
    ApagarChat,
    ListarTodosChats
}