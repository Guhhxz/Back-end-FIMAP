const config_message = require('../../../modulo/configMensagens.js')
const curtidaPostDAO = require('../../../../../model/DAO/Comunidade/Curtidas/Curtidas_comentario/curtidasComentariosDAO.js')
const ComentarioDAO = require('../../../../../model/DAO/Comunidade/Comentarios/comentarioDAO.js')

/* ============================ CONSTANTES ============================ */

// Valor da coluna "status" de um post visível (post removido tem status 0).
// Um comentário só está disponível se o post dele estiver ativo.
const STATUS_POST_ATIVO = 1

/* ======================= HELPERS: RESPOSTAS/ENTRADA ======================= */

// Id inteiro maior que zero (recebe o resultado de Number(...); NaN é barrado)
const idValido = (id) => Number.isInteger(id) && id > 0

// { sucesso: false, mensagem } a partir de um objeto do configMensagens.js
const responderErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

// { sucesso: true, mensagem, ...dados }
const responderSucesso = (res, cfg, dados = {}) =>
    res.status(cfg.status).json({ sucesso: true, mensagem: cfg.mensagem, ...dados })

// Lê um id da URL aceitando mais de um nome de parâmetro. Sem nenhum, retorna NaN.
const lerParam = (req, ...nomes) => {
    for (const nome of nomes) {
        if (req.params?.[nome] !== undefined) return Number(req.params[nome])
    }

    return NaN
}

// Descobre qual usuário está fazendo a requisição.
// TEMPORÁRIO: lê o id do body ou da query, então qualquer pessoa pode enviar o id
// de outro usuário e se passar por ele. Quando o login com token estiver pronto,
// troque por req.usuario.id (vindo do middleware de autenticação).
const idDoUsuarioLogado = (req) => Number(req.body?.id_usuario ?? req.query?.id_usuario)

/* ========================= HELPERS: FORMATAÇÃO ========================= */

// Linha crua do banco -> objeto que a API devolve ao front
const formatarCurtida = (c) => ({
    id: c.id,
    data_curtida: c.data_curtida,
    id_usuario: c.id_usuario,
    id_comentario: c.id_comentario
})

/* ========================= HELPERS: VERIFICAÇÕES ========================= */

// Retorna o comentário se ele existir E o post dele estiver ativo; senão, null.
const buscarComentarioDisponivel = async (idComentario) => {
    const comentario = await comentarioDAO.GetComentarioById(idComentario)

    if (!comentario) return null

    const post = await postDAO.GetPostById(comentario.id_post)

    if (!post || Number(post.status) !== STATUS_POST_ATIVO) return null

    return comentario
}

// Duas pessoas curtindo ao mesmo tempo podem passar pela checagem de "já curtiu"
// e a segunda bate no UNIQUE do banco. Isso não é erro 500, é "já curtiu".
const ehDuplicada = (error) => error?.code === 'ER_DUP_ENTRY'

/* ============================ ENDPOINTS ============================ */

// Convenção: os DAOs lançam (throw) em caso de erro de banco, então quem
// trata é o catch de cada endpoint.

// POST /curtir
// Curte um comentário. Ordem das verificações:
//   ids válidos -> usuário existe -> comentário existe (e post ativo)
//   -> ainda não curtiu -> INSERT.
// Body: { id_usuario, id_comentario }
const curtirComentario = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_comentario = Number(req.body?.id_comentario)

        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)
        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)

        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        if (await curtidaComentarioDAO.GetCurtidaComentario(id_usuario, id_comentario)) {
            return responderErro(res, config_message.CURTIDA_JA_EXISTE)
        }

        const id_curtida = await curtidaComentarioDAO.CreateCurtidaComentario({ id_usuario, id_comentario })

        if (!id_curtida) {
            return responderErro(res, config_message.ERRO_CURTIR)
        }

        return responderSucesso(res, config_message.CURTIDA_CRIADA, {
            curtiu: true,
            total_curtidas: await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)
        })

    } catch (error) {
        if (ehDuplicada(error)) return responderErro(res, config_message.CURTIDA_JA_EXISTE)

        console.error('Erro ao curtir comentário:', error)
        return responderErro(res, config_message.ERRO_CURTIR)
    }
}

// DELETE /descurtir/:comentarioId
// Remove a curtida do usuário logado. Não exige comentário disponível: dá para
// tirar a curtida de um comentário cujo post foi removido depois.
// Body/query: { id_usuario }
const descurtirComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        // O DAO devolve as linhas afetadas; 0 = o usuário não tinha curtido
        const removeu = await curtidaComentarioDAO.DeleteCurtidaComentario(id_usuario, id_comentario)

        if (!removeu) {
            return responderErro(res, config_message.CURTIDA_NAO_ENCONTRADA)
        }

        return responderSucesso(res, config_message.CURTIDA_REMOVIDA, {
            curtiu: false,
            total_curtidas: await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)
        })

    } catch (error) {
        console.error('Erro ao descurtir comentário:', error)
        return responderErro(res, config_message.ERRO_DESCURTIR)
    }
}

// POST /alternar
// Botão de coração: se já curtiu, remove; senão, cria.
// Resposta traz "curtiu" (estado final) e "total_curtidas".
// Body: { id_usuario, id_comentario }
const alternarCurtidaComentario = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_comentario = Number(req.body?.id_comentario)

        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)
        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)

        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        const jaCurtiu = await curtidaComentarioDAO.GetCurtidaComentario(id_usuario, id_comentario)

        if (jaCurtiu) {
            await curtidaComentarioDAO.DeleteCurtidaComentario(id_usuario, id_comentario)
        } else {
            await curtidaComentarioDAO.CreateCurtidaComentario({ id_usuario, id_comentario })
        }

        return responderSucesso(
            res,
            jaCurtiu ? config_message.CURTIDA_REMOVIDA : config_message.CURTIDA_CRIADA,
            {
                curtiu: !jaCurtiu,
                total_curtidas: await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)
            }
        )

    } catch (error) {
        if (ehDuplicada(error)) return responderErro(res, config_message.CURTIDA_JA_EXISTE)

        console.error('Erro ao alternar curtida do comentário:', error)
        return responderErro(res, config_message.ERRO_CURTIR)
    }
}

// GET /verificar/:comentarioId?id_usuario=1
// Diz se o usuário logado curtiu o comentário (para pintar o coração no front).
const verificarCurtidaComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const curtida = await curtidaComentarioDAO.GetCurtidaComentario(id_usuario, id_comentario)

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            curtiu: curtida !== null
        })

    } catch (error) {
        console.error('Erro ao verificar curtida do comentário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /quantidade/:comentarioId
// Só o total de curtidas (leve, bom para listas). Exige comentário disponível.
const contarCurtidasComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')

        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        return responderSucesso(res, config_message.CURTIDAS_ENCONTRADAS, {
            total_curtidas: await curtidaComentarioDAO.CountCurtidasByIdComentario(id_comentario)
        })

    } catch (error) {
        console.error('Erro ao contar curtidas do comentário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_CURTIDAS)
    }
}

// GET /comentario/:comentarioId
// Lista quem curtiu o comentário (mais recentes primeiro).
// Sem curtidas, sucesso com lista vazia.
const listarCurtidasPorComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')

        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)

        if (!await buscarComentarioDisponivel(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        const curtidas = await curtidaComentarioDAO.GetAllCurtidasByIdComentario(id_comentario)

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
// Lista os comentários que um usuário curtiu (mais recentes primeiro).
// Sem curtidas, sucesso com lista vazia.
const listarCurtidasPorUsuario = async (req, res) => {
    try {
        const id_usuario = lerParam(req, 'usuarioId', 'id_usuario')

        if (!idValido(id_usuario)) return responderErro(res, config_message.ID_USUARIO_INVALIDO)

        const curtidas = await curtidaComentarioDAO.GetAllCurtidasComentarioByIdUsuario(id_usuario)

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