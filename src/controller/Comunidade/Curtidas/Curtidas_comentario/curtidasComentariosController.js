
const config_message = require('../../../modulo/configMensagens.js')
const curtidaComentarioDAO = require('../../../../../model/DAO/Comunidade/Curtidas/Curtidas_comentario/curtidasComentariosDAO.js')
const comentarioDAO = require('../../../../../model/DAO/Comunidade/Comentarios/comentarioDAO.js')
const postDAO = require('../../../../../model/DAO/Comunidade/Post/postDAO.js')

/* ============================ CONSTANTES ============================ */

const STATUS_POST_ATIVO = 1

/* ======================= HELPERS: RESPOSTAS/ENTRADA ======================= */

const idValido = (id) => Number.isInteger(id) && id > 0

const responderErro = (res, cfg) =>
    res.status(cfg.status).json({
        sucesso: false,
        mensagem: cfg.mensagem
    })

const responderSucesso = (res, cfg, dados = {}) =>
    res.status(cfg.status).json({
        sucesso: true,
        mensagem: cfg.mensagem,
        ...dados
    })

const lerParam = (req, ...nomes) => {
    for (const nome of nomes) {
        if (req.params?.[nome] !== undefined) {
            return Number(req.params[nome])
        }
    }

    return NaN
}

// TEMPORÁRIO: substituir por req.usuario.id quando o JWT estiver implementado.
const idDoUsuarioLogado = (req) =>
    Number(req.body?.id_usuario ?? req.query?.id_usuario)

/* ========================= HELPERS: FORMATAÇÃO ========================= */

const formatarCurtida = (c) => ({
    id: c.id,
    data_curtida: c.data_curtida,
    id_usuario: c.id_usuario,
    id_comentario: c.id_comentario
})

/* ========================= HELPERS: VERIFICAÇÕES ========================= */

// Verifica se o comentário existe e pertence a um post ativo.
const buscarComentarioDisponivel = async (idComentario) => {
    const comentario = await comentarioDAO.GetComentarioById(idComentario)

    if (!comentario) {
        return null
    }

    const post = await postDAO.GetPostById(comentario.id_post)

    if (!post || Number(post.status) !== STATUS_POST_ATIVO) {
        return null
    }

    return comentario
}

const ehDuplicada = (error) => error?.code === 'ER_DUP_ENTRY'

/* ============================ ENDPOINTS ============================ */

// POST /curtir
// Body: { id_usuario, id_comentario }
const curtirComentario = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_comentario = Number(req.body?.id_comentario)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        if (await curtidaComentarioDAO.GetCurtidaComentario(id_usuario, id_comentario)) {
            return responderErro(res, config_message.CURTIDA_JA_EXISTE)
        }

        const id_curtida = await curtidaComentarioDAO.CreateCurtidaComentario({
            id_usuario,
            id_comentario
        })

        if (!id_curtida) {
            return responderErro(res, config_message.ERRO_CURTIR)
        }

        const total_curtidas =
            await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)

        return responderSucesso(res, config_message.CURTIDA_CRIADA, {
            curtiu: true,
            total_curtidas
        })

    } catch (error) {
        if (ehDuplicada(error)) {
            return responderErro(res, config_message.CURTIDA_JA_EXISTE)
        }

        console.error('Erro ao curtir comentário:', error)
        return responderErro(res, config_message.ERRO_CURTIR)
    }
}

// DELETE /descurtir/:comentarioId
const descurtirComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        const removeu = await curtidaComentarioDAO.DeleteCurtidaComentario(
            id_usuario,
            id_comentario
        )

        if (!removeu) {
            return responderErro(res, config_message.CURTIDA_NAO_ENCONTRADA)
        }

        const total_curtidas =
            await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)

        return responderSucesso(res, config_message.CURTIDA_REMOVIDA, {
            curtiu: false,
            total_curtidas
        })

    } catch (error) {
        console.error('Erro ao descurtir comentário:', error)
        return responderErro(res, config_message.ERRO_DESCURTIR)
    }
}

// POST /alternar
// Body: { id_usuario, id_comentario }
const alternarCurtidaComentario = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_comentario = Number(req.body?.id_comentario)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        const jaCurtiu = await curtidaComentarioDAO.GetCurtidaComentario(
            id_usuario,
            id_comentario
        )

        if (jaCurtiu) {
            await curtidaComentarioDAO.DeleteCurtidaComentario(
                id_usuario,
                id_comentario
            )
        } else {
            await curtidaComentarioDAO.CreateCurtidaComentario({
                id_usuario,
                id_comentario
            })
        }

        const total_curtidas =
            await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)

        return responderSucesso(
            res,
            jaCurtiu
                ? config_message.CURTIDA_REMOVIDA
                : config_message.CURTIDA_CRIADA,
            {
                curtiu: !jaCurtiu,
                total_curtidas
            }
        )

    } catch (error) {
        if (ehDuplicada(error)) {
            return responderErro(res, config_message.CURTIDA_JA_EXISTE)
        }

        console.error('Erro ao alternar curtida do comentário:', error)
        return responderErro(res, config_message.ERRO_CURTIR)
    }
}

// GET /verificar/:comentarioId?id_usuario=1
const verificarCurtidaComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        const curtida = await curtidaComentarioDAO.GetCurtidaComentario(
            id_usuario,
            id_comentario
        )

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            curtiu: curtida !== null
        })

    } catch (error) {
        console.error('Erro ao verificar curtida do comentário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /quantidade/:comentarioId
const contarCurtidasComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        const total_curtidas =
            await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            total_curtidas
        })

    } catch (error) {
        console.error('Erro ao contar curtidas do comentário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /comentario/:comentarioId
const listarCurtidasPorComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        const curtidas =
            await curtidaComentarioDAO.GetAllCurtidasByIdComentario(id_comentario)

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            quantidade: curtidas.length,
            curtidas: curtidas.map(formatarCurtida)
        })

    } catch (error) {
        console.error('Erro ao listar curtidas do comentário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /usuario/:usuarioId
const listarCurtidasPorUsuario = async (req, res) => {
    try {
        const id_usuario = lerParam(req, 'usuarioId', 'id_usuario')

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const curtidas =
            await curtidaComentarioDAO.GetAllCurtidasComentarioByIdUsuario(id_usuario)

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            quantidade: curtidas.length,
            curtidas: curtidas.map(formatarCurtida)
        })

    } catch (error) {
        console.error('Erro ao listar curtidas do usuário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

module.exports = {
    curtirComentario,
    descurtirComentario,
    alternarCurtidaComentario,
    verificarCurtidaComentario,
    contarCurtidasComentario,
    listarCurtidasPorComentario,
    listarCurtidasPorUsuario
}
