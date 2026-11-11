const config_message = require('../modulo/configMensagens.js')
const BadgeModel = require('../../../model/DAO/Badge/badgeDAO.js')
const BadgeUsuarioModel = require('../../../model/DAO/BadgeUser/badgeUserDAO.js')

const cfg = (chave) => config_message[chave] || config_message.ERRO_INTERNO

const idValido = (valor) => Number.isInteger(valor) && valor > 0

const respostaErro = (res, configuracao) => {
    return res.status(configuracao.status).json({
        sucesso: false,
        mensagem: configuracao.mensagem
    })
}

// POST /badges/usuario
// Body: { id_usuario, id_badge }
const AtrelarBadgeUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.body?.id_usuario)
        const id_badge = Number(req.body?.id_badge)

        if (!idValido(id_usuario)) {
            return respostaErro(res, cfg('ID_USUARIO_INVALIDO'))
        }

        if (!idValido(id_badge)) {
            return respostaErro(res, cfg('ID_BADGE_INVALIDO'))
        }

        const badge = await BadgeModel.GetBadgeById(id_badge)

        if (!badge) {
            return respostaErro(res, cfg('BADGE_NAO_ENCONTRADO'))
        }

        const jaPossui = await BadgeUsuarioModel.UsuarioPossuiBadge(id_usuario, id_badge)

        if (jaPossui === null) {
            return respostaErro(res, cfg('ERRO_CONQUISTAR_BADGE'))
        }

        if (jaPossui) {
            return respostaErro(res, cfg('BADGE_JA_CONQUISTADO'))
        }

        const resultado = await BadgeUsuarioModel.PushBadgeUser(id_usuario, id_badge)

        // Cobre a corrida entre o check e o insert (PK composta no banco)
        if (resultado === 'DUPLICADO') {
            return respostaErro(res, cfg('BADGE_JA_CONQUISTADO'))
        }

        // Usuário inexistente (a badge já foi validada acima)
        if (resultado === 'FK_INVALIDA') {
            return respostaErro(res, cfg('USUARIO_NAO_ENCONTRADO'))
        }

        if (!resultado) {
            return respostaErro(res, cfg('ERRO_CONQUISTAR_BADGE'))
        }

        const mensagem = cfg('BADGE_VINCULADA_USUARIO')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem
        })

    } catch (error) {
        console.error('Erro ao atrelar badge:', error)
        return respostaErro(res, cfg('ERRO_CONQUISTAR_BADGE'))
    }
}

// GET /usuarios/:id_usuario/badges
const BuscarBadgesUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return respostaErro(res, cfg('ID_USUARIO_INVALIDO'))
        }

        const badges = await BadgeUsuarioModel.GetBadgesByIdUsuario(id_usuario)

        if (badges === false) {
            return respostaErro(res, cfg('ERRO_BUSCAR_BADGES_USUARIO'))
        }

        const mensagem = cfg('BADGES_USUARIO_ENCONTRADOS')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade: badges.length,
            badges
        })

    } catch (error) {
        console.error('Erro ao buscar badges do usuário:', error)
        return respostaErro(res, cfg('ERRO_BUSCAR_BADGES_USUARIO'))
    }
}

// DELETE /usuarios/:id_usuario/badges/:id_badge
const RemoverBadgeUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const id_badge = Number(req.params.id_badge)

        if (!idValido(id_usuario)) {
            return respostaErro(res, cfg('ID_USUARIO_INVALIDO'))
        }

        if (!idValido(id_badge)) {
            return respostaErro(res, cfg('ID_BADGE_INVALIDO'))
        }

        const resultado = await BadgeUsuarioModel.RemoverBadgeUsuario(id_usuario, id_badge)

        if (resultado === null) {
            return respostaErro(res, cfg('ERRO_REMOVER_BADGE_USUARIO'))
        }

        if (!resultado) {
            return respostaErro(res, cfg('BADGE_USUARIO_NAO_ENCONTRADO'))
        }

        const mensagem = cfg('BADGE_USUARIO_REMOVIDO')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem
        })

    } catch (error) {
        console.error('Erro ao remover badge do usuário:', error)
        return respostaErro(res, cfg('ERRO_REMOVER_BADGE_USUARIO'))
    }
}

module.exports = {
    AtrelarBadgeUsuario,
    BuscarBadgesUsuario,
    RemoverBadgeUsuario
}