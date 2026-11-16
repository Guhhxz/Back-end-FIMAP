const config_message = require('../modulo/configMensagens.js')
const configuracoesModel = require('../../../model/DAO/Configuracoes/configuracoes.js')

/* ------------------------------ Helpers ------------------------------ */

// Valida id numérico positivo
const idValido = (id) => Number.isInteger(id) && id > 0

const bodyVazio = (body) => !body || Object.keys(body).length === 0

const respostaErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

const respostaSucesso = (res, cfg, extra = {}) =>
    res.status(cfg.status).json({ sucesso: true, mensagem: cfg.mensagem, ...extra })

/* ----------------------------- Controllers ----------------------------- */

// POST - Criar configurações do usuário
const postConfiguracoesById = async (req, res) => {
    const idUsuario = Number(req.params.idUsuario)
    const configuracoes = req.body

    if (!idValido(idUsuario)) {
        return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
    }

    if (bodyVazio(configuracoes)) {
        return respostaErro(res, config_message.CAMPOS_OBRIGATORIOS)
    }

    try {
        const existentes = await configuracoesModel.GetConfiguracoesById(idUsuario)

        if (existentes && existentes.length > 0) {
            return respostaErro(res, {
                status: 409,
                mensagem: 'Configurações já existem para este usuário.'
            })
        }

        const idConfiguracao = await configuracoesModel.InsertConfiguracoes(idUsuario, configuracoes)

        if (!idConfiguracao) {
            return respostaErro(res, {
                status: 400,
                mensagem: 'Não foi possível criar as configurações.'
            })
        }

        return respostaSucesso(
            res,
            { status: 201, mensagem: 'Configurações criadas com sucesso.' },
            { id: idConfiguracao }
        )

    } catch (error) {
        console.error('Erro ao criar configurações:', error)
        return respostaErro(res, {
            status: 500,
            mensagem: 'Erro interno ao criar configurações.'
        })
    }
}

// GET - Buscar configurações do usuário
const getConfiguracoesById = async (req, res) => {
    const idUsuario = Number(req.params.idUsuario)

    if (!idValido(idUsuario)) {
        return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
    }

    try {
        const configuracoes = await configuracoesModel.GetConfiguracoesById(idUsuario)

        if (!configuracoes || configuracoes.length === 0) {
            return respostaErro(res, {
                status: 404,
                mensagem: 'Configurações não encontradas.'
            })
        }

        return respostaSucesso(
            res,
            { status: 200, mensagem: 'Configurações encontradas com sucesso.' },
            { configuracoes }
        )

    } catch (error) {
        console.error('Erro ao buscar configurações:', error)
        return respostaErro(res, {
            status: 500,
            mensagem: 'Erro interno ao buscar configurações.'
        })
    }
}

// PUT - Atualizar configurações do usuário
const updateConfiguracoesById = async (req, res) => {
    const idUsuario = Number(req.params.idUsuario)
    const configuracoes = req.body

    if (!idValido(idUsuario)) {
        return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
    }

    if (bodyVazio(configuracoes)) {
        return respostaErro(res, config_message.CAMPOS_OBRIGATORIOS)
    }

    try {
        const linhasAtualizadas = await configuracoesModel.UpdateConfiguracoesById(idUsuario, configuracoes)

        if (linhasAtualizadas === 0) {
            return respostaErro(res, {
                status: 404,
                mensagem: 'Configurações não encontradas para atualizar.'
            })
        }

        return respostaSucesso(res, {
            status: 200,
            mensagem: 'Configurações atualizadas com sucesso.'
        })

    } catch (error) {
        console.error('Erro ao atualizar configurações:', error)
        return respostaErro(res, {
            status: 500,
            mensagem: 'Erro interno ao atualizar configurações.'
        })
    }
}

module.exports = {
    postConfiguracoesById,
    getConfiguracoesById,
    updateConfiguracoesById
}