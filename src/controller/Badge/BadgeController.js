const config_message = require('../modulo/configMensagens.js')

// Importa o DAO responsável pelo acesso ao banco de dados.
const BadgeModel = require('../../../model/DAO/Badge/badgeDAO.js')

// Criar badge
const criarBadge = async (req, res) => {
    try {
        const badge = req.body

        // Verifica se já existe uma badge com esse nome.
        const badgeExiste = await BadgeModel.ValidarBadge(badge)

        if (badgeExiste) {
            return res.status(config_message.DADOS_BADGE_EXISTENTES.status).json({
                sucesso: false,
                mensagem: config_message.DADOS_BADGE_EXISTENTES.mensagem
            })
        }

        const id_badge = await BadgeModel.CreateBadge(badge)

        if (!id_badge) {
            return res.status(config_message.ERRO_CRIAR_BADGE.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_CRIAR_BADGE.mensagem
            })
        }

        return res.status(config_message.BADGE_CRIADA.status).json({
            sucesso: true,
            mensagem: config_message.BADGE_CRIADA.mensagem,
            id_badge
        })
    } catch (error) {
        console.error('Erro ao criar badge:', error)

        return res.status(config_message.ERRO_INTERNO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_INTERNO.mensagem
        })
    }
}

// Atualizar badge
const atualizarBadge = async (req, res) => {
    try {
        const id_badge = Number(req.params.id_badge)

        if (!Number.isInteger(id_badge) || id_badge <= 0) {
            return res.status(config_message.ID_BADGE_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_BADGE_INVALIDO.mensagem
            })
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(config_message.NENHUM_CAMPO_ATUALIZAR.status).json({
                sucesso: false,
                mensagem: config_message.NENHUM_CAMPO_ATUALIZAR.mensagem
            })
        }

        const badge = {
            ...req.body,
            id: id_badge
        }

        const badgeAtualizada = await BadgeModel.UpdateBadge(badge)

        if (!badgeAtualizada) {
            return res.status(config_message.BADGE_NAO_ENCONTRADA.status).json({
                sucesso: false,
                mensagem: config_message.BADGE_NAO_ENCONTRADA.mensagem
            })
        }

        return res.status(config_message.BADGE_ATUALIZADA.status).json({
            sucesso: true,
            mensagem: config_message.BADGE_ATUALIZADA.mensagem
        })
    } catch (error) {
        console.error('Erro ao atualizar badge:', error)

        return res.status(config_message.ERRO_ATUALIZAR_BADGE.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_ATUALIZAR_BADGE.mensagem
        })
    }
}

// Deletar badge
const deletarBadge = async (req, res) => {
    try {
        const id_badge = Number(req.params.id_badge)

        if (!Number.isInteger(id_badge) || id_badge <= 0) {
            return res.status(config_message.ID_BADGE_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_BADGE_INVALIDO.mensagem
            })
        }

        const badgeDeletada = await BadgeModel.DeleteBadge({ id: id_badge })

        if (!badgeDeletada) {
            return res.status(config_message.BADGE_NAO_ENCONTRADA.status).json({
                sucesso: false,
                mensagem: config_message.BADGE_NAO_ENCONTRADA.mensagem
            })
        }

        return res.status(config_message.BADGE_DELETADA.status).json({
            sucesso: true,
            mensagem: config_message.BADGE_DELETADA.mensagem
        })
    } catch (error) {
        console.error('Erro ao deletar badge:', error)

        return res.status(config_message.ERRO_DELETAR_BADGE.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_DELETAR_BADGE.mensagem
        })
    }
}

// Buscar badge pelo nome
const buscarBadgePorNome = async (req, res) => {
    try {
        const { nome } = req.params

        if (!nome || !nome.trim()) {
            return res.status(config_message.NOME_BADGE_OBRIGATORIO.status).json({
                sucesso: false,
                mensagem: config_message.NOME_BADGE_OBRIGATORIO.mensagem
            })
        }

        const badge = await BadgeModel.GetBadgeByNome(nome)

        if (!badge) {
            return res.status(config_message.BADGE_NAO_ENCONTRADA.status).json({
                sucesso: false,
                mensagem: config_message.BADGE_NAO_ENCONTRADA.mensagem
            })
        }

        return res.status(config_message.BADGE_ENCONTRADA.status).json({
            sucesso: true,
            mensagem: config_message.BADGE_ENCONTRADA.mensagem,
            badge
        })
    } catch (error) {
        console.error('Erro ao buscar badge:', error)

        return res.status(config_message.ERRO_BUSCAR_BADGE.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_BUSCAR_BADGE.mensagem
        })
    }
}

// Buscar todas as badges
const buscarTodasBadges = async (req, res) => {
    try {
        const badges = await BadgeModel.GetAllBadges()

        if (badges === false) {
            return res.status(config_message.ERRO_BUSCAR_BADGES.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_BUSCAR_BADGES.mensagem
            })
        }

        return res.status(config_message.BADGES_ENCONTRADAS.status).json({
            sucesso: true,
            mensagem: config_message.BADGES_ENCONTRADAS.mensagem,
            quantidade: badges.length,
            badges
        })
    } catch (error) {
        console.error('Erro ao buscar badges:', error)

        return res.status(config_message.ERRO_BUSCAR_BADGES.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_BUSCAR_BADGES.mensagem
        })
    }
}

module.exports = {
    criarBadge,
    atualizarBadge,
    deletarBadge,
    buscarBadgePorNome,
    buscarTodasBadges
}
