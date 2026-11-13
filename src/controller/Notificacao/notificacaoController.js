
const config_message = require('../../controller/modulo/configMensagens.js')
const NotificacaoModel = require('../../../model/DAO/notificacoes/notificacaoDAO.js')

const idValido = (v) => Number.isInteger(v) && v > 0

const respostaErro = (res, configuracao) => {
    return res.status(configuracao.status).json({
        sucesso: false,
        mensagem: configuracao.mensagem
    })
}

const criarNotificacao = async (req, res) => {
    try {
        const body = req.body || {}
        const id_usuario = Number(body.id_usuario)

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_INVALIDO)
        }

        const { icone, nome, conteudo } = body

        if ([icone, nome, conteudo].some(v => typeof v !== 'string' || !v.trim())) {
            return respostaErro(res, config_message.PARAMETRO_INVALIDO)
        }

        const id_notificacao = await NotificacaoModel.CreateNotificacao({
            icone: icone.trim(),
            nome: nome.trim(),
            conteudo: conteudo.trim(),
            id_usuario
        })

        if (id_notificacao === 'FK_INVALIDA') {
            return respostaErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!id_notificacao) {
            return respostaErro(res, config_message.ERRO_CRIAR_NOTIFICACAO)
        }

        const mensagem = config_message.NOTIFICACAO_CRIADA

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            id_notificacao
        })

    } catch (error) {
        console.error('Erro ao criar notificação:', error)
        return respostaErro(res, config_message.ERRO_CRIAR_NOTIFICACAO)
    }
}

const buscarNotificacoesUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        let lida

        if (req.query.lida !== undefined) {
            if (req.query.lida !== '0' && req.query.lida !== '1') {
                return respostaErro(res, config_message.PARAMETRO_INVALIDO)
            }

            lida = Number(req.query.lida)
        }

        const notificacoes = await NotificacaoModel.GetNotificacoesByUsuario(id_usuario, { lida })

        if (notificacoes === false) {
            return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
        }

        const mensagem = config_message.NOTIFICACOES_ENCONTRADAS

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade: notificacoes.length,
            notificacoes
        })

    } catch (error) {
        console.error('Erro ao buscar notificações do usuário:', error)
        return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
    }
}

const buscarNotificacaoPorId = async (req, res) => {
    try {
        const id_notificacao = Number(req.params.id_notificacao)

        if (!idValido(id_notificacao)) {
            return respostaErro(res, config_message.ID_NOTIFICACAO_INVALIDO)
        }

        const notificacao = await NotificacaoModel.GetNotificacaoById(id_notificacao)

        if (!notificacao) {
            return respostaErro(res, config_message.NOTIFICACAO_NAO_ENCONTRADA)
        }

        const mensagem = config_message.NOTIFICACAO_ENCONTRADA

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            notificacao
        })

    } catch (error) {
        console.error('Erro ao buscar notificação:', error)
        return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
    }
}

const marcarComoLida = async (req, res) => {
    try {
        const id_notificacao = Number(req.params.id_notificacao)

        if (!idValido(id_notificacao)) {
            return respostaErro(res, config_message.ID_NOTIFICACAO_INVALIDO)
        }

        const notificacao = await NotificacaoModel.GetNotificacaoById(id_notificacao)

        if (!notificacao) {
            return respostaErro(res, config_message.NOTIFICACAO_NAO_ENCONTRADA)
        }

        if (Number(notificacao.lida) === 1) {
            return respostaErro(res, config_message.NOTIFICACAO_JA_LIDA)
        }

        const resultado = await NotificacaoModel.MarcarComoLida(id_notificacao)

        if (resultado === null) {
            return respostaErro(res, config_message.ERRO_ATUALIZAR_NOTIFICACAO)
        }

        if (!resultado) {
            return respostaErro(res, config_message.NOTIFICACAO_JA_LIDA)
        }

        const mensagem = config_message.NOTIFICACAO_LIDA

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem
        })

    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error)
        return respostaErro(res, config_message.ERRO_ATUALIZAR_NOTIFICACAO)
    }
}

const marcarTodasComoLidas = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const atualizadas = await NotificacaoModel.MarcarTodasComoLidas(id_usuario)

        if (atualizadas === null) {
            return respostaErro(res, config_message.ERRO_ATUALIZAR_NOTIFICACAO)
        }

        const mensagem = config_message.NOTIFICACOES_LIDAS

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade: atualizadas
        })

    } catch (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error)
        return respostaErro(res, config_message.ERRO_ATUALIZAR_NOTIFICACAO)
    }
}

const deletarNotificacao = async (req, res) => {
    try {
        const id_notificacao = Number(req.params.id_notificacao)

        if (!idValido(id_notificacao)) {
            return respostaErro(res, config_message.ID_NOTIFICACAO_INVALIDO)
        }

        const resultado = await NotificacaoModel.DeleteNotificacao(id_notificacao)

        if (resultado === null) {
            return respostaErro(res, config_message.ERRO_DELETAR_NOTIFICACAO)
        }

        if (!resultado) {
            return respostaErro(res, config_message.NOTIFICACAO_NAO_ENCONTRADA)
        }

        const mensagem = config_message.NOTIFICACAO_DELETADA

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem
        })

    } catch (error) {
        console.error('Erro ao deletar notificação:', error)
        return respostaErro(res, config_message.ERRO_DELETAR_NOTIFICACAO)
    }
}

const buscarTodasNaolidas = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const quantidade = await NotificacaoModel.ListAllNotificacoesNaoLidas(id_usuario)

        if (quantidade === false) {
            return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
        }

        const mensagem = config_message.NOTIFICACOES_NAO_LIDAS

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade
        })

    } catch (error) {
        console.error('Erro ao buscar notificações não lidas:', error)
        return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
    }
}

const buscarTodaslidas = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const quantidade = await NotificacaoModel.ListAllNotificacoesLidas(id_usuario)

        if (quantidade === false) {
            return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
        }

        const mensagem = config_message.NOTIFICACOES_NAO_LIDAS

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade
        })

    } catch (error) {
        console.error('Erro ao buscar notificações não lidas:', error)
        return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
    }
}

module.exports = {
    criarNotificacao,
    buscarNotificacoesUsuario,
    buscarTodasNaolidas,
    buscarTodaslidas,
    buscarNotificacaoPorId,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao
}
