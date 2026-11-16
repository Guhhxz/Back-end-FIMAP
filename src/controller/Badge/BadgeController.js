const config_message = require('../modulo/configMensagens.js')
const BadgeModel = require('../../../model/DAO/Badge/badgeDAO.js')

/* ----------------------------- Constantes ----------------------------- */

const CAMPOS_PERMITIDOS = ['icone', 'nome', 'descricao', 'xp']
const CAMPOS_TEXTO = ['icone', 'nome', 'descricao']
const TAMANHO_MAX_NOME = 45

/* ------------------------------ Helpers ------------------------------ */

// Busca a configuração de mensagem; cai em ERRO_INTERNO se a chave não existir
const cfg = (chave) => config_message[chave] || config_message.ERRO_INTERNO

const idValido = (valor) => Number.isInteger(valor) && valor > 0

const respostaErro = (res, configuracao) =>
    res.status(configuracao.status).json({
        sucesso: false,
        mensagem: configuracao.mensagem
    })

const respostaSucesso = (res, configuracao, extra = {}) =>
    res.status(configuracao.status).json({
        sucesso: true,
        mensagem: configuracao.mensagem,
        ...extra
    })

const textoVazio = (valor) => typeof valor !== 'string' || !valor.trim()

const xpInvalido = (xp) => {
    if (typeof xp !== 'number' && typeof xp !== 'string') return true
    if (typeof xp === 'string' && xp.trim() === '') return true

    const n = Number(xp)

    return !Number.isInteger(n) || n < 0
}

// Valida os campos da badge. Retorna a config de erro ou null se estiver tudo certo.
// parcial = true: valida só os campos que vieram (usado na atualização)
const validarCampos = (badge, parcial = false) => {
    const verificar = (campo) => !parcial || badge[campo] !== undefined

    if (verificar('nome')) {
        if (textoVazio(badge.nome)) return cfg('NOME_BADGE_OBRIGATORIO')
        if (badge.nome.trim().length > TAMANHO_MAX_NOME) return cfg('NOME_BADGE_INVALIDO')
    }

    if (verificar('descricao') && textoVazio(badge.descricao)) {
        return cfg('DESCRICAO_BADGE_OBRIGATORIA')
    }

    if (verificar('icone') && textoVazio(badge.icone)) {
        return cfg('ICONE_BADGE_OBRIGATORIO')
    }

    if (verificar('xp') && xpInvalido(badge.xp)) {
        return cfg('XP_BADGE_INVALIDO')
    }

    return null
}

/* ----------------------------- Controllers ----------------------------- */

// POST - Criar badge
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

        return respostaSucesso(res, cfg('BADGE_CRIADO'), { id_badge })

    } catch (error) {
        console.error('Erro ao criar badge:', error)
        return respostaErro(res, cfg('ERRO_CRIAR_BADGE'))
    }
}

// PUT - Atualizar badge (parcial)
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

        // Normaliza os valores já validados
        for (const campo of CAMPOS_TEXTO) {
            if (campos[campo] !== undefined) campos[campo] = campos[campo].trim()
        }

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

        const resultado = await BadgeModel.UpdateBadge({ ...campos, id: id_badge })

        if (resultado === 'DUPLICADO') {
            return respostaErro(res, cfg('BADGE_EXISTENTE'))
        }

        if (resultado === null) {
            return respostaErro(res, cfg('ERRO_ATUALIZAR_BADGE'))
        }

        if (!resultado) {
            return respostaErro(res, cfg('BADGE_NAO_ENCONTRADO'))
        }

        return respostaSucesso(res, cfg('BADGE_ATUALIZADO'))

    } catch (error) {
        console.error('Erro ao atualizar badge:', error)
        return respostaErro(res, cfg('ERRO_ATUALIZAR_BADGE'))
    }
}

// DELETE - Deletar badge
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

        return respostaSucesso(res, cfg('BADGE_DELETADO'))

    } catch (error) {
        console.error('Erro ao deletar badge:', error)
        return respostaErro(res, cfg('ERRO_DELETAR_BADGE'))
    }
}

// GET - Buscar badge pelo nome
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

        return respostaSucesso(res, cfg('BADGE_ENCONTRADO'), { badge })

    } catch (error) {
        console.error('Erro ao buscar badge:', error)
        return respostaErro(res, cfg('ERRO_BUSCAR_BADGE'))
    }
}

// GET - Buscar todas as badges
const buscarTodasBadges = async (req, res) => {
    try {
        const badges = await BadgeModel.GetAllBadges()

        if (badges === false) {
            return respostaErro(res, cfg('ERRO_BUSCAR_BADGES'))
        }

        return respostaSucesso(
            res,
            cfg('BADGES_ENCONTRADOS'),
            { quantidade: badges.length, badges }
        )

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