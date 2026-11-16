const knex = require('knex')

const knexConfig = require('../../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

const STATUS_ATIVO = 1
const STATUS_REMOVIDO = 0

// Convenção deste arquivo: erros de banco são relançados (throw);
// quem trata é o controller.

/* ------------------------------ Helpers ------------------------------ */

// Lista posts de um usuário filtrando pelo status
const buscarPostsPorStatus = async (idUsuario, status, mensagemErro) => {
    const sql = `select * from tbl_post where id_usuario = ? and status = ?`

    try {
        const [rows] = await knexConex.raw(sql, [idUsuario, status])

        return rows
    } catch (error) {
        console.error(mensagemErro, error)
        throw error
    }
}

/* ------------------------------ Create ------------------------------ */

// Cria o post como ativo. Retorna o id criado
const CreatePost = async (post) => {
    const sql = `insert into tbl_post
        (conteudo, data_criacao, data_atualizacao, status, id_usuario)
        values (?, now(), now(), ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            post.conteudo,
            STATUS_ATIVO,
            post.id_usuario
        ])

        return result.insertId
    } catch (error) {
        // Usuário inexistente é tratado pelo controller (validação), sem log de erro
        if (error.code !== 'ER_NO_REFERENCED_ROW_2') {
            console.error('Erro ao criar post:', error)
        }

        throw error
    }
}

/* ------------------------------- Read ------------------------------- */

// Verifica se o usuário existe (true/false)
const ExisteUsuario = async (idUsuario) => {
    try {
        const [rows] = await knexConex.raw(
            'select id from tbl_usuario where id = ? limit 1',
            [idUsuario]
        )

        return rows.length > 0
    } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        throw error
    }
}

// Retorna o post (qualquer status) ou null
const GetPostById = async (postId) => {
    try {
        const [rows] = await knexConex.raw('select * from tbl_post where id = ?', [postId])

        return rows[0] ?? null
    } catch (error) {
        console.error('Erro ao buscar post:', error)
        throw error
    }
}

// Todos os posts do usuário, de qualquer status (inclui removidos)
const GetAllPostsByIdUsuario = async (idUsuario) => {
    try {
        const [rows] = await knexConex.raw('select * from tbl_post where id_usuario = ?', [idUsuario])

        return rows
    } catch (error) {
        console.error('Erro ao buscar posts:', error)
        throw error
    }
}

const GetAllPostsAtivosByIdUsuario = (idUsuario) =>
    buscarPostsPorStatus(idUsuario, STATUS_ATIVO, 'Erro ao buscar posts ativos:')

const GetAllPostsInativosByIdUsuario = (idUsuario) =>
    buscarPostsPorStatus(idUsuario, STATUS_REMOVIDO, 'Erro ao buscar posts inativos:')

/* ------------------------------ Update ------------------------------ */

// Atualiza o conteúdo de um post ativo do usuário. Retorna as linhas afetadas
const UpdatePost = async (post) => {
    const sql = `update tbl_post
        set conteudo = ?, data_atualizacao = now()
        where id = ? and id_usuario = ? and status = ?`

    try {
        const [result] = await knexConex.raw(sql, [
            post.conteudo,
            post.id,
            post.id_usuario,
            STATUS_ATIVO
        ])

        return result.affectedRows
    } catch (error) {
        console.error('Erro ao atualizar post:', error)
        throw error
    }
}

/* ------------------------------ Delete ------------------------------ */

// Exclusão lógica: muda o status para removido. Retorna as linhas afetadas
const DeletePost = async (postId, idUsuario) => {
    const sql = `update tbl_posts
        set status = ?
        where id = ? and id_usuario = ? and status = ?`

    try {
        const [result] = await knexConex.raw(sql, [
            STATUS_REMOVIDO,
            postId,
            idUsuario,
            STATUS_ATIVO
        ])

        return result.affectedRows
    } catch (error) {
        console.error('Erro ao deletar post:', error)
        throw error
    }
}

module.exports = {
    CreatePost,
    UpdatePost,
    DeletePost,
    ExisteUsuario,
    GetPostById,
    GetAllPostsByIdUsuario,
    GetAllPostsInativosByIdUsuario,
    GetAllPostsAtivosByIdUsuario
}
