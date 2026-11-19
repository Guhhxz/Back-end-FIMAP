const knex = require('knex')

const knexConfig = require('../../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Convenção deste arquivo: erros de banco são relançados (throw);
// quem trata é o controller.

/* ------------------------------ Create ------------------------------ */

// Cria um comentário (raiz ou resposta). Retorna o id criado.
// Se id_comentario_pai for informado, o comentário é uma resposta
const CreateComentario = async (comentario) => {
    const sql = `insert into tbl_comentario
        (mensagem, data_criacao, id_usuario, id_post, id_comentario_pai)
        values (?, now(), ?, ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            comentario.mensagem,
            comentario.id_usuario,
            comentario.id_post,
            comentario.id_comentario_pai ?? null
        ])

        return result.insertId
    } catch (error) {
        // Usuário, post ou comentário pai inexistente é tratado pelo controller
        // (validação), sem log de erro
        if (error.code !== 'ER_NO_REFERENCED_ROW_2') {
            console.error('Erro ao criar comentário:', error)
        }

        throw error
    }
}

/* ------------------------------- Read ------------------------------- */

// Retorna o comentário ou null
const GetComentarioById = async (comentarioId) => {
    try {
        const [rows] = await knexConex.raw(
            'select * from tbl_comentario where id = ?',
            [comentarioId]
        )

        return rows[0] ?? null
    } catch (error) {
        console.error('Erro ao buscar comentário:', error)
        throw error
    }
}

// Todos os comentários de um post (raiz + respostas), do mais antigo ao mais novo.
// Usa o índice IDX_COMENTARIO_POST_DATA
const GetAllComentariosByIdPost = async (idPost) => {
    const sql = `select c.*,
    (select count(*) from tbl_comentario t where t.id_comentario_pai = c.id) as total_respostas
    from tbl_comentario c
    where c.id_comentario_pai = ?
    order by c.data_criacao asc`

    try {
        const [rows] = await knexConex.raw(sql, [idPost])

        return rows
    } catch (error) {
        console.error('Erro ao buscar comentários do post:', error)
        throw error
    }
}

// Somente os comentários raiz de um post (sem pai)
const GetComentariosRaizByIdPost = async (idPost) => {
    const sql = `select * from tbl_comentario
        where id_post = ? and id_comentario_pai is null
        order by data_criacao asc`

    try {
        const [rows] = await knexConex.raw(sql, [idPost])

        return rows
    } catch (error) {
        console.error('Erro ao buscar comentários raiz do post:', error)
        throw error
    }
}

// Respostas diretas de um comentário
const GetRespostasByIdComentarioPai = async (idComentarioPai) => {
    const sql = `select c.*,
    (select count(*) from tbl_comentario t where t.id_comentario_pai = c.id) as total_respostas
    from tbl_comentario c
    where c.id_post = ? and c.id_comentario_pai is null
    order by c.data_criacao asc`

    try {
        const [rows] = await knexConex.raw(sql, [idComentarioPai])

        return rows
    } catch (error) {
        console.error('Erro ao buscar respostas do comentário:', error)
        throw error
    }
}

// Todos os comentários feitos por um usuário
const GetAllComentariosByIdUsuario = async (idUsuario) => {
    const sql = `select * from tbl_comentario
        where id_usuario = ?
        order by data_criacao desc`

    try {
        const [rows] = await knexConex.raw(sql, [idUsuario])

        return rows
    } catch (error) {
        console.error('Erro ao buscar comentários do usuário:', error)
        throw error
    }
}

/* ------------------------------ Update ------------------------------ */

// Atualiza a mensagem de um comentário do usuário. Retorna as linhas afetadas.
// Obs.: a tabela não tem data_atualizacao, então só a mensagem é alterada
const UpdateComentario = async (comentario) => {
    const sql = `update tbl_comentario
        set mensagem = ?
        where id = ? and id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [
            comentario.mensagem,
            comentario.id,
            comentario.id_usuario
        ])

        return result.affectedRows
    } catch (error) {
        console.error('Erro ao atualizar comentário:', error)
        throw error
    }
}

/* ------------------------------ Delete ------------------------------ */

// Exclusão física (a tabela não tem status). Por causa do ON DELETE CASCADE,
// as respostas e as curtidas do comentário também são removidas.
// Retorna as linhas afetadas
const DeleteComentario = async (comentarioId, idUsuario) => {
    const sql = `delete from tbl_comentario
        where id = ? and id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [comentarioId, idUsuario])

        return result.affectedRows
    } catch (error) {
        console.error('Erro ao deletar comentário:', error)
        throw error
    }
}

module.exports = {
    CreateComentario,
    UpdateComentario,
    DeleteComentario,
    GetComentarioById,
    GetAllComentariosByIdPost,
    GetComentariosRaizByIdPost,
    GetRespostasByIdComentarioPai,
    GetAllComentariosByIdUsuario
}
