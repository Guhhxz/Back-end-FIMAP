
const config_message = require('../../controller/modulo/configMensagens.js')
const NOTIFICACOES = require('../../controller/modulo/messageNotificacao.js')
const NotificacaoModel = require('../../../model/DAO/notificacoes/notificacaoDAO.js')

// ============================================================
// CONSTANTES
// ============================================================

const CONTEUDO_MAX_CARACTERES = 200

const idValido = (v) => Number.isInteger(v) && v > 0

const respostaErro = (res, configuracao) => {
    return res.status(configuracao.status).json({
        sucesso: false,
        codigo: configuracao.codigo,
        mensagem: configuracao.mensagem
    })
}

// ============================================================
// CATÁLOGO DE NOTIFICAÇÕES
// ============================================================

const buscarMensagem = (id) =>
    Number.isInteger(id) && Object.hasOwn(NOTIFICACOES, id)
        ? NOTIFICACOES[id]
        : null

const preencher = (texto, variaveis) => {
    const faltando = []

    const resultado = texto.replace(/\{(\w+)\}/g, (_, chave) => {
        const valor = variaveis?.[chave]

        if (valor === undefined || valor === null || String(valor).trim() === '') {
            faltando.push(chave)
            return ''
        }

        return String(valor).trim()
    })

    return { resultado, faltando }
}

const montarNotificacao = (id_mensagem, variaveis = {}, id_referencia) => {
    const modelo = buscarMensagem(id_mensagem)

    if (!modelo) return { ok: false, motivo: 'MENSAGEM_INVALIDA' }

    let referencia = null

    if (modelo.referencia) {
        referencia = Number(id_referencia)

        if (!idValido(referencia)) {
            return { ok: false, motivo: 'REFERENCIA_OBRIGATORIA' }
        }
    }

    const nome = preencher(modelo.nome, variaveis)
    const conteudo = preencher(modelo.conteudo, variaveis)

    if (nome.faltando.length || conteudo.faltando.length) {
        return { ok: false, motivo: 'VARIAVEL_FALTANDO' }
    }

    if (conteudo.resultado.length > CONTEUDO_MAX_CARACTERES) {
        return { ok: false, motivo: 'CONTEUDO_LONGO' }
    }

    return {
        ok: true,
        notificacao: {
            icone: modelo.icone,
            nome: nome.resultado,
            conteudo: conteudo.resultado,
            tipo_referencia: modelo.referencia,
            id_referencia: referencia
        }
    }
}

// ============================================================
// MOTIVOS DE ERRO
// ============================================================

const MOTIVOS_NOTIFICACAO = {
    MENSAGEM_INVALIDA: 'NOTIFICACAO_MENSAGEM_INVALIDA',
    REFERENCIA_OBRIGATORIA: 'NOTIFICACAO_REFERENCIA_OBRIGATORIA',
    VARIAVEL_FALTANDO: 'NOTIFICACAO_VARIAVEL_FALTANDO',
    CONTEUDO_LONGO: 'CONTEUDO_NOTIFICACAO_INVALIDO',
    USUARIO_NAO_ENCONTRADO: 'USUARIO_NAO_ENCONTRADO',
    ERRO: 'ERRO_CRIAR_NOTIFICACAO'
}

// ============================================================
// ENVIAR NOTIFICAÇÃO
// ============================================================

const enviarNotificacao = async ({ id_usuario, id_mensagem, variaveis = {}, id_referencia }) => {
    try {
        const montada = montarNotificacao(id_mensagem, variaveis, id_referencia)

        if (!montada.ok) return montada

        const id = await NotificacaoModel.CreateNotification({
            ...montada.notificacao,
            id_usuario
        })

        if (id === 'FK_INVALIDA') {
            return { ok: false, motivo: 'USUARIO_NAO_ENCONTRADO' }
        }

        if (!id) return { ok: false, motivo: 'ERRO' }

        return { ok: true, id }
    } catch (error) {
        console.error('Erro ao enviar notificação:', error)
        return { ok: false, motivo: 'ERRO' }
    }
}

// ============================================================
// LISTAR MENSAGENS
// ============================================================

const listarMensagens = async (req, res) => {
    const mensagens = Object.entries(NOTIFICACOES).map(([id, m]) => ({
        id: Number(id),
        categoria: m.categoria,
        icone: m.icone,
        nome: m.nome,
        conteudo: m.conteudo,
        referencia: m.referencia,
        variaveis: [...new Set(
            [...(m.nome + m.conteudo).matchAll(/\{(\w+)\}/g)].map(x => x[1])
        )]
    }))

    const mensagem = config_message.OK

    return res.status(mensagem.status).json({
        sucesso: true,
        mensagem: mensagem.mensagem,
        quantidade: mensagens.length,
        mensagens
    })
}

// ============================================================
// CRIAR NOTIFICAÇÃO
// ============================================================

const criarNotificacao = async (req, res) => {
    try {
        const body = req.body || {}
        const id_usuario = Number(body.id_usuario)
        const id_mensagem = Number(body.id_mensagem)

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_INVALIDO)
        }

        if (!idValido(id_mensagem)) {
            return respostaErro(res, config_message.NOTIFICACAO_MENSAGEM_INVALIDA)
        }

        const variaveis = body.variaveis && typeof body.variaveis === 'object'
            ? body.variaveis
            : {}

        const resultado = await enviarNotificacao({
            id_usuario,
            id_mensagem,
            variaveis,
            id_referencia: body.id_referencia
        })

        if (!resultado.ok) {
            return respostaErro(
                res,
                config_message[MOTIVOS_NOTIFICACAO[resultado.motivo]]
            )
        }

        const mensagem = config_message.NOTIFICACAO_CRIADA

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            id_notificacao: resultado.id
        })
    } catch (error) {
        console.error('Erro ao criar notificação:', error)
        return respostaErro(res, config_message.ERRO_CRIAR_NOTIFICACAO)
    }
}

// ============================================================
// BUSCAR NOTIFICAÇÕES DO USUÁRIO
// ============================================================

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

        const notificacoes = await NotificacaoModel.GetNotificationsByUser(
            id_usuario,
            { lida }
        )

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

// ============================================================
// BUSCAR NOTIFICAÇÃO POR ID
// ============================================================

const buscarNotificacaoPorId = async (req, res) => {
    try {
        const id_notificacao = Number(req.params.id_notificacao)

        if (!idValido(id_notificacao)) {
            return respostaErro(res, config_message.ID_NOTIFICACAO_INVALIDO)
        }

        const notificacao = await NotificacaoModel.GetNotificationById(id_notificacao)

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

// ============================================================
// MARCAR NOTIFICAÇÃO COMO LIDA
// ============================================================

const marcarComoLida = async (req, res) => {
    try {
        const id_notificacao = Number(req.params.id_notificacao)

        if (!idValido(id_notificacao)) {
            return respostaErro(res, config_message.ID_NOTIFICACAO_INVALIDO)
        }

        const notificacao = await NotificacaoModel.GetNotificationById(id_notificacao)

        if (!notificacao) {
            return respostaErro(res, config_message.NOTIFICACAO_NAO_ENCONTRADA)
        }

        if (Number(notificacao.lida) === 1) {
            return respostaErro(res, config_message.NOTIFICACAO_JA_LIDA)
        }

        const resultado = await NotificacaoModel.MarkAsRead(
            id_notificacao,
            notificacao.id_usuario
        )

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

// ============================================================
// MARCAR TODAS AS NOTIFICAÇÕES COMO LIDAS
// ============================================================

const marcarTodasComoLidas = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const atualizadas = await NotificacaoModel.MarkAllAsRead(id_usuario)

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

// ============================================================
// DELETAR NOTIFICAÇÃO
// ============================================================

const deletarNotificacao = async (req, res) => {
    try {
        const id_notificacao = Number(req.params.id_notificacao)

        if (!idValido(id_notificacao)) {
            return respostaErro(res, config_message.ID_NOTIFICACAO_INVALIDO)
        }

        const notificacao = await NotificacaoModel.GetNotificationById(id_notificacao)

        if (!notificacao) {
            return respostaErro(res, config_message.NOTIFICACAO_NAO_ENCONTRADA)
        }

        const resultado = await NotificacaoModel.DeleteNotification(
            id_notificacao,
            notificacao.id_usuario
        )

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

        const resultado = await NotificacaoModel.GetUnreadNotifications(id_usuario)

        if (!resultado) {
            return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
        }

        const mensagem = config_message.NOTIFICACOES_NAO_LIDAS

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade: resultado.quantidade,
            notificacoes: resultado.notificacoes
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

        const resultado = await NotificacaoModel.GetReadNotifications(id_usuario)

        if (!resultado) {
            return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
        }

        const mensagem = config_message.NOTIFICACOES_LIDAS_CONTAGEM

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade: resultado.quantidade,
            notificacoes: resultado.notificacoes
        })

    } catch (error) {
        console.error('Erro ao buscar notificações lidas:', error)
        return respostaErro(res, config_message.ERRO_BUSCAR_NOTIFICACOES)
    }
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

module.exports = {
    listarMensagens,
    criarNotificacao,
    enviarNotificacao,
    buscarNotificacoesUsuario,
    buscarTodasNaolidas,
    buscarTodaslidas,
    buscarNotificacaoPorId,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao
}
