const config_message = require('../modulo/configMensagens.js')
const comentarioDAO = require('../../../model/DAO/Comentario/ComentarioDAO.js')
const postDAO = require('../../../model/DAO/Post/PostDAO.js')

/* ============================ CONSTANTES ============================ */

// Valor da coluna "status" de um post visível (post removido tem status 0).
// Só se comenta e só se listam comentários de post ativo.
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

// Lê um id da URL aceitando mais de um nome de parâmetro
// (ex.: lerParam(req, 'postId', 'id_post')). Sem nenhum deles, retorna NaN.
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

// Lê a mensagem do comentário do body.
// Retorna: null (ausente ou não é string) | string com trim (pode ser '')
const lerMensagem = (req) => {
    const bruto = req.body?.mensagem

    if (typeof bruto !== 'string') return null

    return bruto.trim()
}

// Mensagem inválida = ausente/não string (null) ou vazia.
// Não há limite de tamanho; o comentário só não pode ser vazio
const mensagemInvalida = (mensagem) => mensagem === null || mensagem.length === 0

// id_comentario_pai é opcional: ausente/null/'' = comentário raiz.
// Retorna: null (raiz) | número (pode ser NaN se vier lixo; o idValido barra)
const lerIdComentarioPai = (req) => {
    const bruto = req.body?.id_comentario_pai

    if (bruto === undefined || bruto === null || bruto === '') return null

    return Number(bruto)
}

/* ========================= HELPERS: FORMATAÇÃO ========================= */

// Linha crua do banco -> objeto que a API devolve ao front
const formatarComentario = (c) => ({
    id: c.id,
    mensagem: c.mensagem,
    data_criacao: c.data_criacao,
    id_usuario: c.id_usuario,
    id_post: c.id_post,
    id_comentario_pai: c.id_comentario_pai ?? null
})

// Monta a árvore de comentários a partir da lista plana do banco.
// Cada comentário ganha "respostas": [] com seus filhos (em qualquer profundidade).
// A ordem original (data_criacao asc) é preservada em cada nível.
// Se um pai não estiver na lista (dado inconsistente), o filho vira raiz
// em vez de sumir.
const montarArvore = (comentarios) => {
    const porId = new Map()
    const raizes = []

    comentarios.forEach(c => porId.set(c.id, { ...formatarComentario(c), respostas: [] }))

    porId.forEach(no => {
        const pai = no.id_comentario_pai !== null ? porId.get(no.id_comentario_pai) : null

        if (pai) {
            pai.respostas.push(no)
        } else {
            raizes.push(no)
        }
    })

    return raizes
}

/* ========================= HELPERS: VERIFICAÇÕES ========================= */

// Retorna o post se ele existir E estiver ativo; senão, null.
// (Erro de banco no PostDAO é lançado e cai no catch do endpoint)
const buscarPostAtivo = async (idPost) => {
    const post = await postDAO.GetPostById(idPost)

    if (!post || Number(post.status) !== STATUS_POST_ATIVO) return null

    return post
}

/* ============================ ENDPOINTS ============================ */

// POST /criar
// Cria um comentário (raiz ou resposta). Ordem das verificações:
//   ids válidos -> mensagem válida -> usuário existe -> post existe e ativo
//   -> (se resposta) pai existe e é do mesmo post -> INSERT.
// Body: { id_usuario, id_post, mensagem, id_comentario_pai? }
const criarComentario = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_post = Number(req.body?.id_post)
        const id_comentario_pai = lerIdComentarioPai(req)

        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)
        if (!idValido(id_post)) return responderErro(res, config_message.ID_POST_INVALIDO)

        if (id_comentario_pai !== null && !idValido(id_comentario_pai)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        const mensagem = lerMensagem(req)

        if (mensagemInvalida(mensagem)) {
            return responderErro(res, config_message.MENSAGEM_COMENTARIO_INVALIDA)
        }

        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        if (!await buscarPostAtivo(id_post)) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        // Resposta: o pai precisa existir e pertencer ao MESMO post.
        // O banco só garante que o pai existe, não que é do mesmo post
        if (id_comentario_pai !== null) {
            const pai = await comentarioDAO.GetComentarioById(id_comentario_pai)

            if (!pai) {
                return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
            }

            if (Number(pai.id_post) !== id_post) {
                return responderErro(res, config_message.COMENTARIO_PAI_INVALIDO)
            }
        }

        const id_comentario = await comentarioDAO.CreateComentario({
            mensagem,
            id_usuario,
            id_post,
            id_comentario_pai
        })

        // O DAO devolve false quando o INSERT falha
        if (!id_comentario) {
            return responderErro(res, config_message.ERRO_CRIAR_COMENTARIO)
        }

        const criado = await comentarioDAO.GetComentarioById(id_comentario)

        if (!criado) {
            return responderErro(res, config_message.ERRO_CRIAR_COMENTARIO)
        }

        return responderSucesso(res, config_message.COMENTARIO_CRIADO, {
            comentario: formatarComentario(criado)
        })

    } catch (error) {
        console.error('Erro ao criar comentário:', error)
        return responderErro(res, config_message.ERRO_CRIAR_COMENTARIO)
    }
}

// GET /buscar/:comentarioId
// Busca UM comentário pelo id.
const buscarComentarioPorId = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        const comentario = await comentarioDAO.GetComentarioById(id_comentario)

        if (!comentario) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        return responderSucesso(res, config_message.COMENTARIO_ENCONTRADO, {
            comentario: formatarComentario(comentario)
        })

    } catch (error) {
        console.error('Erro ao buscar comentário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIO)
    }
}

// GET /buscar/post/:postId
// Lista os comentários de um post ATIVO em árvore (raízes com "respostas" aninhadas).
// Com ?formato=lista devolve a lista plana. Sem comentários, sucesso com lista vazia.
// "quantidade" é o total (raízes + respostas) nos dois formatos.
const listarComentariosPorPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        if (!await buscarPostAtivo(id_post)) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        const comentarios = await comentarioDAO.GetAllComentariosByIdPost(id_post)

        // false = erro de banco ([] = post sem comentários, que é sucesso)
        if (comentarios === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
        }

        const lista = req.query?.formato === 'lista'
            ? comentarios.map(formatarComentario)
            : montarArvore(comentarios)

        return responderSucesso(res, config_message.COMENTARIOS_ENCONTRADOS, {
            quantidade: comentarios.length,
            comentarios: lista
        })

    } catch (error) {
        console.error('Erro ao listar comentários do post:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
    }
}

// GET /buscar/respostas/:comentarioId
// Lista as respostas DIRETAS de um comentário (um nível só).
// Sem respostas, sucesso com lista vazia.
const listarRespostas = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')

        if (!idValido(id_comentario)) {
            return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        }

        if (!await comentarioDAO.GetComentarioById(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        const respostas = await comentarioDAO.GetRespostasByIdComentarioPai(id_comentario)

        if (respostas === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
        }

        const formatadas = respostas.map(formatarComentario)

        return responderSucesso(res, config_message.COMENTARIOS_ENCONTRADOS, {
            quantidade: formatadas.length,
            comentarios: formatadas
        })

    } catch (error) {
        console.error('Erro ao listar respostas:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
    }
}

// GET /buscar/usuario/:usuarioId
// Lista os comentários feitos por um usuário (mais recentes primeiro).
// Sem comentários, sucesso com lista vazia.
const listarComentariosPorUsuario = async (req, res) => {
    try {
        const id_usuario = lerParam(req, 'usuarioId', 'id_usuario')

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const comentarios = await comentarioDAO.GetAllComentariosByIdUsuario(id_usuario)

        if (comentarios === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
        }

        const formatados = comentarios.map(formatarComentario)

        return responderSucesso(res, config_message.COMENTARIOS_ENCONTRADOS, {
            quantidade: formatados.length,
            comentarios: formatados
        })

    } catch (error) {
        console.error('Erro ao listar comentários do usuário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
    }
}

// GET /contar/post/:postId
// Quantidade total de comentários de um post ativo (raízes + respostas).
const contarComentariosPorPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        if (!await buscarPostAtivo(id_post)) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        const quantidade = await comentarioDAO.CountComentariosByIdPost(id_post)

        // 0 é um resultado válido; só false indica erro
        if (quantidade === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
        }

        return responderSucesso(res, config_message.COMENTARIOS_ENCONTRADOS, { quantidade })

    } catch (error) {
        console.error('Erro ao contar comentários:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_COMENTARIOS)
    }
}

// PATCH /atualizar/:comentarioId
// Edita a mensagem de um comentário.
// Ordem das verificações: ids válidos -> mensagem válida -> comentário existe (404)
// -> é do usuário logado (403) -> UPDATE.
const atualizarComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const mensagem = lerMensagem(req)

        if (mensagemInvalida(mensagem)) {
            return responderErro(res, config_message.MENSAGEM_COMENTARIO_INVALIDA)
        }

        const existente = await comentarioDAO.GetComentarioById(id_comentario)

        if (!existente) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        // Number() dos dois lados: o driver pode devolver o id como string ou BigInt
        if (Number(existente.id_usuario) !== id_usuario) {
            return responderErro(res, config_message.COMENTARIO_SEM_PERMISSAO)
        }

        const atualizou = await comentarioDAO.UpdateComentario({
            id: id_comentario,
            id_usuario,
            mensagem
        })

        // false = erro de banco, comentário removido no meio do caminho ou mensagem
        // igual à atual (o MySQL pode devolver 0 linhas afetadas). Por isso o 404
        // só vale se o comentário realmente sumiu
        if (!atualizou && !await comentarioDAO.GetComentarioById(id_comentario)) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        const atualizado = await comentarioDAO.GetComentarioById(id_comentario)

        if (!atualizado) {
            return responderErro(res, config_message.ERRO_ATUALIZAR_COMENTARIO)
        }

        return responderSucesso(res, config_message.COMENTARIO_ATUALIZADO, {
            comentario: formatarComentario(atualizado)
        })

    } catch (error) {
        console.error('Erro ao atualizar comentário:', error)
        return responderErro(res, config_message.ERRO_ATUALIZAR_COMENTARIO)
    }
}

// DELETE /deletar/:comentarioId
// Exclusão FÍSICA (a tabela não tem status). Por causa do ON DELETE CASCADE,
// as respostas e as curtidas do comentário também são apagadas.
// Mesmas verificações do atualizarComentario: ids válidos, comentário existe e é do usuário.
const deletarComentario = async (req, res) => {
    try {
        const id_comentario = lerParam(req, 'comentarioId', 'id_comentario')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_comentario)) return responderErro(res, config_message.ID_COMENTARIO_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const existente = await comentarioDAO.GetComentarioById(id_comentario)

        if (!existente) {
            return responderErro(res, config_message.COMENTARIO_NAO_ENCONTRADO)
        }

        if (Number(existente.id_usuario) !== id_usuario) {
            return responderErro(res, config_message.COMENTARIO_SEM_PERMISSAO)
        }

        const removeu = await comentarioDAO.DeleteComentario(id_comentario, id_usuario)

        // false = erro de banco ou comentário já removido entre a consulta e o delete
        if (!removeu) {
            return responderErro(res, config_message.ERRO_DELETAR_COMENTARIO)
        }

        return responderSucesso(res, config_message.COMENTARIO_DELETADO)

    } catch (error) {
        console.error('Erro ao remover comentário:', error)
        return responderErro(res, config_message.ERRO_DELETAR_COMENTARIO)
    }
}

module.exports = {
    criarComentario,
    buscarComentarioPorId,
    listarComentariosPorPost,
    listarRespostas,
    listarComentariosPorUsuario,
    contarComentariosPorPost,
    atualizarComentario,
    deletarComentario
}
