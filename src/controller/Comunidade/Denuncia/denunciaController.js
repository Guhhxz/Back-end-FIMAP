const config_message = require('../../modulo/configMensagens.js')

const denunciaCategoriaModel = require('../../../../model/DAO/Comunidade/Denuncia/categoriaDenunciaDAO.js')
const denunciaModel = require('../../../../model/DAO/Comunidade/Denuncia/denunciasDAO.js')
const postModel = require('../../../../model/DAO/Comunidade/Post/postDAO.js')
const usuarioModel = require('../../../../model/DAO/Usuario/usuarioDAO.js')

// Valor da coluna "status" de um post visível (post removido/oculto tem status 0).
// Só se denuncia post ativo (na 5ª denúncia o trigger do banco oculta o post).
const STATUS_POST_ATIVO = 1

// Tamanho máximo do título (coluna VARCHAR(100))
const TITULO_MAX_CARACTERES = 100

// Valida id numérico positivo
const idValido = (id) => Number.isInteger(id) && id > 0

// Resposta padrão de erro
const responderErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

// Resposta padrão de sucesso: { sucesso: true, mensagem, ...dados }
const responderSucesso = (res, cfg, dados = {}) =>
    res.status(cfg.status).json({ sucesso: true, mensagem: cfg.mensagem, ...dados })

// Descobre qual usuário está fazendo a requisição.
// Usa req.usuario.id quando um middleware de autenticação (token) preencher esse campo.
// TEMPORÁRIO: sem o middleware, cai no id do body/query, então qualquer pessoa pode
// enviar o id de outro usuário e se passar por ele. Remova o fallback quando todas as
// rotas de denúncia passarem pelo middleware (ajuste "req.usuario?.id" ao nome que ele usa).
const idDoUsuarioLogado = (req) =>
    Number(req.usuario?.id ?? req.body?.id_usuario ?? req.query?.id_usuario)

// Lê um texto do body: null (ausente ou não é string) | string com trim (pode ser '')
const lerTexto = (valor) => (typeof valor === 'string' ? valor.trim() : null)

// Título válido: obrigatório e dentro do limite da coluna
const tituloValido = (titulo) =>
    titulo !== null && titulo.length > 0 && titulo.length <= TITULO_MAX_CARACTERES

// Descrição válida: obrigatória (sem limite de tamanho, a coluna é TEXT)
const descricaoValida = (descricao) => descricao !== null && descricao.length > 0

// Linha crua do banco -> objeto que a API devolve ao front
const formatarDenuncia = (d) => ({
    id: d.id,
    titulo: d.titulo,
    descricao: d.descricao,
    data_criacao: d.data_criacao,
    id_usuario: d.id_usuario,
    id_post: d.id_post,
    id_categoria: d.id_categoria
})

// Retorna o post se ele existir E estiver ativo; senão, null.
const buscarPostAtivo = async (id_post) => {
    const post = await postModel.GetPostById(id_post)

    if (!post || Number(post.status) !== STATUS_POST_ATIVO) return null

    return post
}

// Resposta padrão das listagens: { quantidade, denuncias }
const responderLista = (res, denuncias) => {
    const formatadas = denuncias.map(formatarDenuncia)

    return responderSucesso(res, config_message.DENUNCIAS_ENCONTRADAS, {
        quantidade: formatadas.length,
        denuncias: formatadas
    })
}

// POST /denunciar
// Denuncia um post. Ordem das verificações:
//   ids válidos -> título e descrição válidos -> usuário existe -> post existe e ativo
//   -> não é o próprio post -> ainda não denunciou -> INSERT.
// Body: { id_usuario, id_post, id_categoria, titulo, descricao }
// Obs.: categoria inexistente é barrada pela FK do banco (volta ERRO_CRIAR_DENUNCIA).
const criarDenuncia = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)
        const id_post = Number(req.body?.id_post)
        const id_categoria = Number(req.body?.id_categoria)
        const titulo = lerTexto(req.body?.titulo)
        const descricao = lerTexto(req.body?.descricao)

        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)
        if (!idValido(id_post)) return responderErro(res, config_message.ID_POST_INVALIDO)
        if (!idValido(id_categoria)) return responderErro(res, config_message.ID_CATEGORIA_DENUNCIA_INVALIDO)

        if (!tituloValido(titulo) || !descricaoValida(descricao)) {
            return responderErro(res, config_message.DENUNCIA_DADOS_INVALIDOS)
        }

        const usuario = await usuarioModel.GetUsuarioById(id_usuario)

        if (!usuario) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        const post = await buscarPostAtivo(id_post)

        if (!post) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        // Number() dos dois lados: o driver pode devolver o id como string ou BigInt
        if (Number(post.id_usuario) === id_usuario) {
            return responderErro(res, config_message.DENUNCIA_PROPRIO_POST)
        }

        if (await denunciaModel.GetDenunciaByUsuarioPost(id_usuario, id_post)) {
            return responderErro(res, config_message.DENUNCIA_JA_EXISTE)
        }

        const id_denuncia = await denunciaModel.CreateDenuncia({
            titulo,
            descricao,
            id_usuario,
            id_post,
            id_categoria
        })

        // O DAO devolve false quando o INSERT falha
        if (!id_denuncia) {
            return responderErro(res, config_message.ERRO_CRIAR_DENUNCIA)
        }

        const criada = await denunciaModel.GetDenunciaById(id_denuncia)

        if (!criada) {
            return responderErro(res, config_message.ERRO_CRIAR_DENUNCIA)
        }

        return responderSucesso(res, config_message.DENUNCIA_CRIADA, {
            denuncia: formatarDenuncia(criada)
        })
    } catch (error) {
        console.error('Erro ao criar denúncia:', error)
        return responderErro(res, config_message.ERRO_CRIAR_DENUNCIA)
    }
}

// GET /buscar/:id_denuncia
// Busca UMA denúncia pelo id. Só o autor pode ver (403 para os demais).
const buscarDenunciaPorId = async (req, res) => {
    try {
        const id_denuncia = Number(req.params.id_denuncia)
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_denuncia)) return responderErro(res, config_message.ID_DENUNCIA_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const denuncia = await denunciaModel.GetDenunciaById(id_denuncia)

        if (!denuncia) {
            return responderErro(res, config_message.DENUNCIA_NAO_ENCONTRADA)
        }

        if (Number(denuncia.id_usuario) !== id_usuario) {
            return responderErro(res, config_message.DENUNCIA_SEM_PERMISSAO)
        }

        return responderSucesso(res, config_message.DENUNCIA_ENCONTRADA, {
            denuncia: formatarDenuncia(denuncia)
        })
    } catch (error) {
        console.error('Erro ao buscar denúncia por ID:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
    }
}

// GET /listar
// Lista TODAS as denúncias (mais recentes primeiro). Rota de moderação.
// TODO: restringir a moderadores. Hoje não há controle de papel, então quem
// chamar vê quem denunciou quem.
const listarTodasDenuncias = async (req, res) => {
    try {
        const denuncias = await denunciaModel.GetAllDenuncias()

        if (denuncias === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
        }

        return responderLista(res, denuncias)
    } catch (error) {
        console.error('Erro ao listar denúncias:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
    }
}

// GET /listar/post/:id_post
// Lista as denúncias de um post (mesmo oculto, para a moderação). Rota de moderação.
// TODO: restringir a moderadores (mesmo motivo do listarTodasDenuncias).
const listarDenunciasPorPost = async (req, res) => {
    try {
        const id_post = Number(req.params.id_post)

        if (!idValido(id_post)) return responderErro(res, config_message.ID_POST_INVALIDO)

        if (!await postModel.GetPostById(id_post)) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        const denuncias = await denunciaModel.GetDenunciasByIdPost(id_post)

        if (denuncias === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
        }

        return responderLista(res, denuncias)
    } catch (error) {
        console.error('Erro ao listar denúncias do post:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
    }
}

// GET /listar/usuario/:id_usuario
// Lista as denúncias feitas por um usuário. Só o próprio usuário pode ver (403).
// Sem denúncias, sucesso com lista vazia.
const listarDenunciasPorUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const id_logado = idDoUsuarioLogado(req)

        if (!idValido(id_usuario)) return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        if (!idValido(id_logado)) return responderErro(res, config_message.NAO_AUTENTICADO)

        if (id_usuario !== id_logado) {
            return responderErro(res, config_message.DENUNCIA_SEM_PERMISSAO)
        }

        const denuncias = await denunciaModel.GetDenunciasByIdUsuario(id_usuario)

        if (denuncias === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
        }

        return responderLista(res, denuncias)
    } catch (error) {
        console.error('Erro ao listar denúncias do usuário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
    }
}

// GET /listar/categoria/:id_categoria
// Lista as denúncias de uma categoria. Rota de moderação.
// TODO: restringir a moderadores (mesmo motivo do listarTodasDenuncias).
const listarDenunciasPorCategoria = async (req, res) => {
    try {
        const id_categoria = Number(req.params.id_categoria)

        if (!idValido(id_categoria)) {
            return responderErro(res, config_message.ID_CATEGORIA_DENUNCIA_INVALIDO)
        }

        const denuncias = await denunciaModel.GetDenunciasByIdCategoria(id_categoria)

        if (denuncias === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
        }

        return responderLista(res, denuncias)
    } catch (error) {
        console.error('Erro ao listar denúncias da categoria:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_DENUNCIAS)
    }
}

// PATCH /atualizar/:id_denuncia
// Edita título, descrição e/ou categoria da própria denúncia (só os campos enviados).
// Ordem das verificações: ids válidos -> pelo menos um campo -> campos válidos
// -> denúncia existe (404) -> é do usuário logado (403) -> UPDATE.
// Body: { id_usuario, titulo?, descricao?, id_categoria? }
const atualizarDenuncia = async (req, res) => {
    try {
        const id_denuncia = Number(req.params.id_denuncia)
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_denuncia)) return responderErro(res, config_message.ID_DENUNCIA_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const dados = {}

        if (req.body?.titulo !== undefined) {
            dados.titulo = lerTexto(req.body.titulo)

            if (!tituloValido(dados.titulo)) {
                return responderErro(res, config_message.DENUNCIA_DADOS_INVALIDOS)
            }
        }

        if (req.body?.descricao !== undefined) {
            dados.descricao = lerTexto(req.body.descricao)

            if (!descricaoValida(dados.descricao)) {
                return responderErro(res, config_message.DENUNCIA_DADOS_INVALIDOS)
            }
        }

        if (req.body?.id_categoria !== undefined) {
            dados.id_categoria = Number(req.body.id_categoria)

            if (!idValido(dados.id_categoria)) {
                return responderErro(res, config_message.ID_CATEGORIA_DENUNCIA_INVALIDO)
            }
        }

        if (Object.keys(dados).length === 0) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        const existente = await denunciaModel.GetDenunciaById(id_denuncia)

        if (!existente) {
            return responderErro(res, config_message.DENUNCIA_NAO_ENCONTRADA)
        }

        if (Number(existente.id_usuario) !== id_usuario) {
            return responderErro(res, config_message.DENUNCIA_SEM_PERMISSAO)
        }

        // O DAO devolve false se não achou, não é do usuário ou deu erro de banco
        const atualizou = await denunciaModel.UpdateDenuncia({
            ...dados,
            id: id_denuncia,
            id_usuario
        })

        if (!atualizou) {
            return responderErro(res, config_message.ERRO_ATUALIZAR_DENUNCIA)
        }

        const atualizada = await denunciaModel.GetDenunciaById(id_denuncia)

        if (!atualizada) {
            return responderErro(res, config_message.DENUNCIA_NAO_ENCONTRADA)
        }

        return responderSucesso(res, config_message.DENUNCIA_ATUALIZADA, {
            denuncia: formatarDenuncia(atualizada)
        })
    } catch (error) {
        console.error('Erro ao atualizar denúncia:', error)
        return responderErro(res, config_message.ERRO_ATUALIZAR_DENUNCIA)
    }
}

// DELETE /deletar/:id_denuncia
// Exclusão FÍSICA da própria denúncia. Não reexibe um post que o trigger já ocultou.
// Mesmas verificações do atualizarDenuncia: id válido, denúncia existe e é do usuário.
const deletarDenuncia = async (req, res) => {
    try {
        const id_denuncia = Number(req.params.id_denuncia)
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_denuncia)) return responderErro(res, config_message.ID_DENUNCIA_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const existente = await denunciaModel.GetDenunciaById(id_denuncia)

        if (!existente) {
            return responderErro(res, config_message.DENUNCIA_NAO_ENCONTRADA)
        }

        if (Number(existente.id_usuario) !== id_usuario) {
            return responderErro(res, config_message.DENUNCIA_SEM_PERMISSAO)
        }

        const deletou = await denunciaModel.DeleteDenuncia(id_denuncia, id_usuario)

        // false = erro de banco ou denúncia já removida entre a consulta e o delete
        if (!deletou) {
            return responderErro(res, config_message.ERRO_DELETAR_DENUNCIA)
        }

        return responderSucesso(res, config_message.DENUNCIA_DELETADA)
    } catch (error) {
        console.error('Erro ao deletar denúncia:', error)
        return responderErro(res, config_message.ERRO_DELETAR_DENUNCIA)
    }
}

// GET /categorias
const ListarCategoriasDenuncia = async (req, res) => {
    try {
        const listarCategoria = await denunciaCategoriaModel.GetAllCategoryComplant()

        if (listarCategoria === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_CATEGORIAS_DENUNCIA)
        }

        if (!listarCategoria || listarCategoria.length === 0) {
            return responderErro(res, config_message.DENUNCIA_CATEGORIA_NAO_ENCONTRADA)
        }

        return responderSucesso(res, config_message.CATEGORIAS_DENUNCIA_ENCONTRADAS, {
            quantidade: listarCategoria.length,
            categorias: listarCategoria
        })

    } catch (error) {
        console.error('Erro ao listar categorias de denúncia:', error)

        return responderErro(res, config_message.ERRO_BUSCAR_CATEGORIAS_DENUNCIA)
    }
}

module.exports = {
    criarDenuncia,
    buscarDenunciaPorId,
    listarTodasDenuncias,
    listarDenunciasPorPost,
    listarDenunciasPorUsuario,
    ListarCategoriasDenuncia,
    listarDenunciasPorCategoria,
    atualizarDenuncia,
    deletarDenuncia
}