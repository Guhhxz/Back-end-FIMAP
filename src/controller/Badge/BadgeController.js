const config_message = require('../modulo/configMensagens.js')
const BadgeModel = require('../../../model/DAO/Badge/badgeDAO.js')

const cfg = (chave) => config_message[chave] || config_message.ERRO_INTERNO

const idValido = (v) => Number.isInteger(v) && v > 0

const CAMPOS_PERMITIDOS = ['icone', 'nome', 'descricao', 'xp']
const TAMANHO_MAX_NOME = 45

const respostaErro = (res, configuracao) => {
    return res.status(configuracao.status).json({
        sucesso: false,
        mensagem: configuracao.mensagem
    })
}

const xpInvalido = (xp) => {
    if (typeof xp !== 'number' && typeof xp !== 'string') return true
    if (typeof xp === 'string' && xp.trim() === '') return true

    const n = Number(xp)

    return !Number.isInteger(n) || n < 0
}

// Validação dos campos da badge
const validarCampos = (badge, parcial = false) => {
    const verificar = (campo) => !parcial || badge[campo] !== undefined

    if (verificar('nome')) {
        if (typeof badge.nome !== 'string' || !badge.nome.trim()) {
            return cfg('NOME_BADGE_OBRIGATORIO')
        }

        if (badge.nome.trim().length > TAMANHO_MAX_NOME) {
            return cfg('NOME_BADGE_INVALIDO')
        }
    }

    if (verificar('descricao')) {
        if (typeof badge.descricao !== 'string' || !badge.descricao.trim()) {
            return cfg('DESCRICAO_BADGE_OBRIGATORIA')
        }
    }

    if (verificar('icone')) {
        if (typeof badge.icone !== 'string' || !badge.icone.trim()) {
            return cfg('ICONE_BADGE_OBRIGATORIO')
        }
    }

    if (verificar('xp')) {
        if (xpInvalido(badge.xp)) {
            return cfg('XP_BADGE_INVALIDO')
        }
    }

    return null
}

// Criar badge
const criarBadge = async (req, res) => {
    try {
        const body = req.body || {}

        const erroValidacao = validarCampos(body)

        if (erroValidacao) {
            return respostaErro(res, erroValidacao)
        }

        const badge = {
            icone: body.icone.trim(),
            nome: body.nome.trim(),
            descricao: body.descricao.trim(),
            xp: Number(body.xp)
        }

        const badgeExiste = await BadgeModel.ValidarBadge(badge)

        if (badgeExiste === null) {
            return respostaErro(res, cfg('ERRO_CRIAR_BADGE'))
        }

        if (badgeExiste) {
            return respostaErro(res, cfg('BADGE_EXISTENTE'))
        }

        const id_badge = await BadgeModel.CreateBadge(badge)

        // UNIQUE (nome) no banco cobre a corrida entre o check e o insert
        if (id_badge === 'DUPLICADO') {
            return respostaErro(res, cfg('BADGE_EXISTENTE'))
        }

        if (!id_badge) {
            return respostaErro(res, cfg('ERRO_CRIAR_BADGE'))
        }

        const mensagem = cfg('BADGE_CRIADO')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            id_badge
        })

    } catch (error) {
        console.error('Erro ao criar badge:', error)
        return respostaErro(res, cfg('ERRO_CRIAR_BADGE'))
    }
}

// Atualizar badge (parcial)
const atualizarBadge = async (req, res) => {
    try {
        const id_badge = Number(req.params.id_badge)

        if (!idValido(id_badge)) {
            return respostaErro(res, cfg('ID_BADGE_INVALIDO'))
        }

        const body = req.body || {}
        const campos = {}

        for (const campo of CAMPOS_PERMITIDOS) {
            if (body[campo] !== undefined) {
                campos[campo] = body[campo]
            }
        }

        if (Object.keys(campos).length === 0) {
            return respostaErro(res, cfg('NENHUM_CAMPO_ATUALIZAR'))
        }

        const erroValidacao = validarCampos(campos, true)

        if (erroValidacao) {
            return respostaErro(res, erroValidacao)
        }

        if (campos.nome !== undefined) campos.nome = campos.nome.trim()
        if (campos.icone !== undefined) campos.icone = campos.icone.trim()
        if (campos.descricao !== undefined) campos.descricao = campos.descricao.trim()
        if (campos.xp !== undefined) campos.xp = Number(campos.xp)

        // Verifica se o nome já pertence a outra badge
        if (campos.nome !== undefined) {
            const nomeEmUso = await BadgeModel.ValidarBadge(campos, id_badge)

            if (nomeEmUso === null) {
                return respostaErro(res, cfg('ERRO_ATUALIZAR_BADGE'))
            }

            if (nomeEmUso) {
                return respostaErro(res, cfg('BADGE_EXISTENTE'))
            }
        }

        const resultado = await BadgeModel.UpdateBadge({
            ...campos,
            id: id_badge
        })

        if (resultado === 'DUPLICADO') {
            return respostaErro(res, cfg('BADGE_EXISTENTE'))
        }

        if (resultado === null) {
            return respostaErro(res, cfg('ERRO_ATUALIZAR_BADGE'))
        }

        if (!resultado) {
            return respostaErro(res, cfg('BADGE_NAO_ENCONTRADO'))
        }

        const mensagem = cfg('BADGE_ATUALIZADO')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem
        })

    } catch (error) {
        console.error('Erro ao atualizar badge:', error)
        return respostaErro(res, cfg('ERRO_ATUALIZAR_BADGE'))
    }
}

// Deletar badge
const deletarBadge = async (req, res) => {
    try {
        const id_badge = Number(req.params.id_badge)

        if (!idValido(id_badge)) {
            return respostaErro(res, cfg('ID_BADGE_INVALIDO'))
        }

        const resultado = await BadgeModel.DeleteBadge({ id: id_badge })

        if (resultado === 'EM_USO') {
            return respostaErro(res, cfg('BADGE_EM_USO'))
        }

        if (resultado === null) {
            return respostaErro(res, cfg('ERRO_DELETAR_BADGE'))
        }

        if (!resultado) {
            return respostaErro(res, cfg('BADGE_NAO_ENCONTRADO'))
        }

        const mensagem = cfg('BADGE_DELETADO')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem
        })

    } catch (error) {
        console.error('Erro ao deletar badge:', error)
        return respostaErro(res, cfg('ERRO_DELETAR_BADGE'))
    }
}

// Buscar badge pelo nome
const buscarBadgePorNome = async (req, res) => {
    try {
        const { nome } = req.params

        if (!nome || !nome.trim()) {
            return respostaErro(res, cfg('NOME_BADGE_OBRIGATORIO'))
        }

        const badge = await BadgeModel.GetBadgeByNome(nome.trim())

        if (!badge) {
            return respostaErro(res, cfg('BADGE_NAO_ENCONTRADO'))
        }

        const mensagem = cfg('BADGE_ENCONTRADO')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            badge
        })

    } catch (error) {
        console.error('Erro ao buscar badge:', error)
        return respostaErro(res, cfg('ERRO_BUSCAR_BADGE'))
    }
}

// Buscar todas as badges
const buscarTodasBadges = async (req, res) => {
    try {
        const badges = await BadgeModel.GetAllBadges()

        if (badges === false) {
            return respostaErro(res, cfg('ERRO_BUSCAR_BADGES'))
        }

        const mensagem = cfg('BADGES_ENCONTRADOS')

        return res.status(mensagem.status).json({
            sucesso: true,
            mensagem: mensagem.mensagem,
            quantidade: badges.length,
            badges
        })

    } catch (error) {
        console.error('Erro ao buscar badges:', error)
        return respostaErro(res, cfg('ERRO_BUSCAR_BADGES'))
    }
}

module.exports = {
    criarBadge,
    atualizarBadge,
    deletarBadge,
    buscarBadgePorNome,
    buscarTodasBadges
}