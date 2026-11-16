const config_message = require('../modulo/configMensagens.js')
const postDAO = require('../../../model/DAO/Post/PostDAO.js')

const STATUS_ATIVO = 1
const CONTEUDO_MAX = 5000

const idValido = (id) => Number.isInteger(id) && id > 0

const CriarPost = async (req, res) => {
    try {
        const id_usuario = Number(req.body?.id_usuario)
        const conteudo = String(req.body?.conteudo ?? '').trim()

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        if (!conteudo) {
            return res.status(config_message.CONTEUDO_POST_OBRIGATORIO.status)
                .json({ sucesso: false, mensagem: config_message.CONTEUDO_POST_OBRIGATORIO.mensagem })
        }

        if (conteudo.length > CONTEUDO_MAX) {
            return res.status(config_message.CONTEUDO_POST_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.CONTEUDO_POST_INVALIDO.mensagem })
        }

        const id = await postDAO.CreatePost({ conteudo, id_usuario })

        return res.status(config_message.POST_CRIADO.status)
            .json({ sucesso: true, mensagem: config_message.POST_CRIADO.mensagem, id })
    } catch (error) {
        console.error('Erro ao criar post:', error)
        return res.status(config_message.ERRO_CRIAR_POST.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_CRIAR_POST.mensagem })
    }
}

const BuscarPostPorId = async (req, res) => {
    try {
        const id = Number(req.params.id_post)

        if (!idValido(id)) {
            return res.status(config_message.ID_POST_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_POST_INVALIDO.mensagem })
        }

        const post = await postDAO.GetPostById(id)

        // Post removido (exclusão lógica) é tratado como inexistente
        if (!post || post.status !== STATUS_ATIVO) {
            return res.status(config_message.POST_NAO_ENCONTRADO.status)
                .json({ sucesso: false, mensagem: config_message.POST_NAO_ENCONTRADO.mensagem })
        }

        return res.status(config_message.POST_ENCONTRADO.status)
            .json({ sucesso: true, mensagem: config_message.POST_ENCONTRADO.mensagem, conteudo: post })
    } catch (error) {
        console.error('Erro ao buscar post:', error)
        return res.status(config_message.ERRO_BUSCAR_POST.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_BUSCAR_POST.mensagem })
    }
}

// Posts ativos do usuário
const ListarPostsAtivosPorUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        const posts = await postDAO.GetAllPostsAtivosByIdUsuario(id_usuario)

        return res.status(config_message.POSTS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.POSTS_ENCONTRADOS.mensagem,
            quantidade: posts.length,
            conteudo: posts
        })
    } catch (error) {
        console.error('Erro ao listar posts ativos:', error)
        return res.status(config_message.ERRO_BUSCAR_POSTS.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_BUSCAR_POSTS.mensagem })
    }
}

// Posts removidos do usuário (só o próprio usuário deveria ver)
const ListarPostsInativosPorUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        const posts = await postDAO.GetAllPostsInativosByIdUsuario(id_usuario)

        return res.status(config_message.POSTS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.POSTS_ENCONTRADOS.mensagem,
            quantidade: posts.length,
            conteudo: posts
        })
    } catch (error) {
        console.error('Erro ao listar posts inativos:', error)
        return res.status(config_message.ERRO_BUSCAR_POSTS.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_BUSCAR_POSTS.mensagem })
    }
}

// Todos os posts do usuário (ativos e removidos)
const ListarTodosPostsPorUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        const posts = await postDAO.GetAllPostsByIdUsuario(id_usuario)

        return res.status(config_message.POSTS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.POSTS_ENCONTRADOS.mensagem,
            quantidade: posts.length,
            conteudo: posts
        })
    } catch (error) {
        console.error('Erro ao listar posts:', error)
        return res.status(config_message.ERRO_BUSCAR_POSTS.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_BUSCAR_POSTS.mensagem })
    }
}

const AtualizarPost = async (req, res) => {
    try {
        const id = Number(req.params.id_post)
        const id_usuario = Number(req.body?.id_usuario)
        const conteudo = String(req.body?.conteudo ?? '').trim()

        if (!idValido(id)) {
            return res.status(config_message.ID_POST_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_POST_INVALIDO.mensagem })
        }

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        if (!conteudo) {
            return res.status(config_message.CONTEUDO_POST_OBRIGATORIO.status)
                .json({ sucesso: false, mensagem: config_message.CONTEUDO_POST_OBRIGATORIO.mensagem })
        }

        if (conteudo.length > CONTEUDO_MAX) {
            return res.status(config_message.CONTEUDO_POST_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.CONTEUDO_POST_INVALIDO.mensagem })
        }

        const atualizadas = await postDAO.UpdatePost({ id, id_usuario, conteudo })

        // 0 linhas: post inexistente, removido, de outro usuário, ou conteúdo igual ao atual.
        if (!atualizadas) {
            const post = await postDAO.GetPostById(id)

            if (!post || post.status !== STATUS_ATIVO) {
                return res.status(config_message.POST_NAO_ENCONTRADO.status)
                    .json({ sucesso: false, mensagem: config_message.POST_NAO_ENCONTRADO.mensagem })
            }

            if (post.id_usuario !== id_usuario) {
                return res.status(config_message.POST_SEM_PERMISSAO.status)
                    .json({ sucesso: false, mensagem: config_message.POST_SEM_PERMISSAO.mensagem })
            }
            // Post é do usuário e está ativo: o conteúdo era igual, então segue como sucesso.
        }

        return res.status(config_message.POST_ATUALIZADO.status)
            .json({ sucesso: true, mensagem: config_message.POST_ATUALIZADO.mensagem })
    } catch (error) {
        console.error('Erro ao atualizar post:', error)
        return res.status(config_message.ERRO_ATUALIZAR_POST.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_ATUALIZAR_POST.mensagem })
    }
}

// Exclusão lógica
const ApagarPost = async (req, res) => {
    try {
        const id = Number(req.params.id_post)
        const id_usuario = Number(req.query?.id_usuario)

        if (!idValido(id)) {
            return res.status(config_message.ID_POST_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_POST_INVALIDO.mensagem })
        }

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status)
                .json({ sucesso: false, mensagem: config_message.ID_USUARIO_INVALIDO.mensagem })
        }

        const apagadas = await postDAO.DeletePost(id, id_usuario)

        if (!apagadas) {
            const post = await postDAO.GetPostById(id)

            if (!post || post.status !== STATUS_ATIVO) {
                return res.status(config_message.POST_NAO_ENCONTRADO.status)
                    .json({ sucesso: false, mensagem: config_message.POST_NAO_ENCONTRADO.mensagem })
            }

            return res.status(config_message.POST_SEM_PERMISSAO.status)
                .json({ sucesso: false, mensagem: config_message.POST_SEM_PERMISSAO.mensagem })
        }

        return res.status(config_message.POST_DELETADO.status)
            .json({ sucesso: true, mensagem: config_message.POST_DELETADO.mensagem })
    } catch (error) {
        console.error('Erro ao apagar post:', error)
        return res.status(config_message.ERRO_DELETAR_POST.status)
            .json({ sucesso: false, mensagem: config_message.ERRO_DELETAR_POST.mensagem })
    }
}

module.exports = {
    CriarPost,
    BuscarPostPorId,
    ListarPostsAtivosPorUsuario,
    ListarPostsInativosPorUsuario,
    ListarTodosPostsPorUsuario,
    AtualizarPost,
    ApagarPost
}