
const config_message = require('../../../modulo/configMensagens.js')
const curtidaPostDAO = require('../../../../../model/DAO/Comunidade/Curtidas/Curtidas_post/curtidasPostDAO.js')
const postDAO = require('../../../../../model/DAO/Comunidade/Post/postDAO.js')

/* ============================ CONSTANTES ============================ */

// Valor da coluna "status" de um post visível.
const STATUS_POST_ATIVO = 1

/* ======================= HELPERS: RESPOSTAS/ENTRADA ======================= */

// Id inteiro maior que zero.
const idValido = (id) => Number.isInteger(id) && id > 0

// Resposta de erro.
const responderErro = (res, cfg) =>
    res.status(cfg.status).json({
        sucesso: false,
        mensagem: cfg.mensagem
    })

// Resposta de sucesso.
const responderSucesso = (res, cfg, dados = {}) =>
    res.status(cfg.status).json({
        sucesso: true,
        mensagem: cfg.mensagem,
        ...dados
    })

// Lê um id da URL aceitando mais de um nome de parâmetro.
const lerParam = (req, ...nomes) => {
    for (const nome of nomes) {
        if (req.params?.[nome] !== undefined) {
            return Number(req.params[nome])
        }
    }

    return NaN
}

// Descobre qual usuário está fazendo a requisição.
// TEMPORÁRIO: lê o id do body ou da query.
// Quando o login com token estiver pronto, utilize req.usuario.id.
const idDoUsuarioLogado = (req) =>
    Number(req.body?.id_usuario ?? req.query?.id_usuario)

/* ========================= HELPERS: FORMATAÇÃO ========================= */

// Linha crua do banco -> objeto que a API devolve ao front.
const formatarCurtida = (c) => ({
    id: c.id,
    data_curtida: c.data_curtida,
    id_usuario: c.id_usuario,
    id_post: c.id_post
})

/* ========================= HELPERS: VERIFICAÇÕES ========================= */

// Retorna o post se ele existir e estiver ativo; senão, null.
const buscarPostAtivo = async (idPost) => {
    const post = await postDAO.GetPostById(idPost)

    if (!post || Number(post.status) !== STATUS_POST_ATIVO) {
        return null
    }

    return post
}

// Identifica curtida duplicada.
const ehDuplicada = (error) => error?.code === 'ER_DUP_ENTRY'

/* ============================ ENDPOINTS ============================ */

// POST /curtir
// Curte um post.
// Body: { id_usuario, id_post }
const curtirPost = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_post = Number(req.body?.id_post)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_INVALIDO)
        }

        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!await buscarPostAtivo(id_post)) {
            return responderErro(res, config_message.NAO_ENCONTRADO)
        }

        if (await curtidaPostDAO.GetCurtidaPost(id_usuario, id_post)) {
            return responderErro(res, config_message.CURTIDA_POST_EXISTENTE)
        }

        const id_curtida = await curtidaPostDAO.CreateCurtidaPost({
            id_usuario,
            id_post
        })

        if (!id_curtida) {
            return responderErro(res, config_message.ERRO_CURTIR_POST)
        }

        const total_curtidas =
            await curtidaPostDAO.CountCurtidasByIdPost(id_post)

        return responderSucesso(res, config_message.CURTIDA_POST_CRIADA, {
            curtiu: true,
            total_curtidas
        })

    } catch (error) {
        if (ehDuplicada(error)) {
            return responderErro(res, config_message.CURTIDA_POST_EXISTENTE)
        }

        console.error('Erro ao curtir post:', error)
        return responderErro(res, config_message.ERRO_CURTIR_POST)
    }
}

// DELETE /descurtir/:postId
// Remove a curtida do usuário.
// Não exige post ativo: permite descurtir um post removido.
const descurtirPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        const removeu = await curtidaPostDAO.DeleteCurtidaPost(
            id_usuario,
            id_post
        )

        if (!removeu) {
            return responderErro(res, config_message.CURTIDA_NAO_ENCONTRADA)
        }

        const total_curtidas =
            await curtidaPostDAO.CountCurtidasByIdPost(id_post)

        return responderSucesso(res, config_message.CURTIDA_REMOVIDA, {
            curtiu: false,
            total_curtidas
        })

    } catch (error) {
        console.error('Erro ao descurtir post:', error)
        return responderErro(res, config_message.ERRO_DESCURTIR)
    }
}

// POST /alternar
// Se já curtiu, remove; senão, cria.
// Body: { id_usuario, id_post }
const alternarCurtidaPost = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_post = Number(req.body?.id_post)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!await buscarPostAtivo(id_post)) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        const jaCurtiu = await curtidaPostDAO.GetCurtidaPost(
            id_usuario,
            id_post
        )

        if (jaCurtiu) {
            await curtidaPostDAO.DeleteCurtidaPost(id_usuario, id_post)
        } else {
            await curtidaPostDAO.CreateCurtidaPost({
                id_usuario,
                id_post
            })
        }

        const total_curtidas =
            await curtidaPostDAO.CountCurtidasByIdPost(id_post)

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

        console.error('Erro ao alternar curtida do post:', error)
        return responderErro(res, config_message.ERRO_CURTIR)
    }
}

// GET /verificar/:postId?id_usuario=1
// Verifica se o usuário curtiu o post.
const verificarCurtidaPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        const curtida = await curtidaPostDAO.GetCurtidaPost(
            id_usuario,
            id_post
        )

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            curtiu: curtida !== null
        })

    } catch (error) {
        console.error('Erro ao verificar curtida do post:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /quantidade/:postId
// Retorna somente o total de curtidas. Exige post ativo.
const contarCurtidasPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        if (!await buscarPostAtivo(id_post)) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        const total_curtidas =
            await curtidaPostDAO.CountCurtidasByIdPost(id_post)

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            total_curtidas
        })

    } catch (error) {
        console.error('Erro ao contar curtidas do post:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /post/:postId
// Lista quem curtiu o post (mais recentes primeiro).
const listarCurtidasPorPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        if (!await buscarPostAtivo(id_post)) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        const curtidas =
            await curtidaPostDAO.GetAllCurtidasByIdPost(id_post)

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            quantidade: curtidas.length,
            curtidas: curtidas.map(formatarCurtida)
        })

    } catch (error) {
        console.error('Erro ao listar curtidas do post:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /usuario/:usuarioId
// Lista os posts que um usuário curtiu (mais recentes primeiro).
const listarCurtidasPorUsuario = async (req, res) => {
    try {
        const id_usuario = lerParam(req, 'usuarioId', 'id_usuario')

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const curtidas =
            await curtidaPostDAO.GetAllCurtidasPostByIdUsuario(id_usuario)

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
    curtirPost,
    descurtirPost,
    alternarCurtidaPost,
    verificarCurtidaPost,
    contarCurtidasPost,
    listarCurtidasPorPost,
    listarCurtidasPorUsuario
}
