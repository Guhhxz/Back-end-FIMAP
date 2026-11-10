const config_message = require('../modulo/configMensagens.js')
 
// DAO da associação usuário-badge e DAO das badges (para checar se a badge existe)
const BadgeUsuarioModel = require('../../../model/DAO/Badge/badgeUsuarioDAO.js')


const AtrelarBadgeUsuario = async (req, res) => {
    const { id_usuario, id_badge } = req.body

    // Verificar se a badge existe
    const badgeExiste = await BadgeUsuarioModel.GetBadgeById(id_badge)
    if (!badgeExiste) {
        return res.status(404).json({ message: config_message.badge_nao_encontrada })
    }

    // Associar a badge ao usuário
    const sucesso = await BadgeUsuarioModel.PushBadgeUser(id_usuario, id_badge)
    if (sucesso) {
        return res.status(200).json({ message: config_message.badge_atrelada_sucesso })
    } else {
        return res.status(500).json({ message: config_message.erro_atrelando_badge })
    }
}

const BuscarBadgesUsuario = async (req, res) => {
    const { id_usuario } = req.params

    // Buscar badges do usuário
    const badges = await BadgeUsuarioModel.GetBadgesByIdUsuario(id_usuario)
    if (badges) {
        return res.status(200).json(badges)
    } else {
        return res.status(500).json({ message: config_message.erro_buscar_badges })
    }
}

const RemoverBadgeUsuario = async (req, res) => {
    const { id_usuario, id_badge } = req.body

    // Remover a badge do usuário
    const sucesso = await BadgeUsuarioModel.RemoverBadgeUsuario(id_usuario, id_badge)
    if (sucesso) {
        return res.status(200).json({ message: config_message.badge_removida_sucesso })
    } else {
        return res.status(500).json({ message: config_message.erro_removendo_badge })
    }
}

module.exports = {
    AtrelarBadgeUsuario,
    BuscarBadgesUsuario,
    RemoverBadgeUsuario
}