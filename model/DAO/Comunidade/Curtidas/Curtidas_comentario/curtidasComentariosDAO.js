const knex = require('knex')

const knexConfig = require('../../../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Convenção deste arquivo: erros de banco são relançados (throw);
// quem trata é o controller.

/* ------------------------------ Create ------------------------------ */

// Registra a curtida de um usuário em um comentário. Retorna o id criado.
// UNIQUE(id_usuario, id_comentario): curtir duas vezes lança ER_DUP_ENTRY.
const CreateCurtidaComentario = async (curtida) => {
    const sql = `insert into tbl_curtida_comentario
        (data_curtida, id_usuario, id_comentario)
        values (now(), ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [curtida.id_usuario, curtida.id_comentario])

        return result.insertId
    } catch (error) {
        // Duplicada ou usuário/comentário inexistente é tratado pelo controller
        // (validação), sem log de erro
        if (error.code !== 'ER_DUP_ENTRY' && error.code !== 'ER_NO_REFERENCED_ROW_2') {
            console.error('Erro ao curtir comentário:', error)
        }

        throw error
    }
}

/* ------------------------------- Read ------------------------------- */

// Retorna a curtida do usuário naquele comentário, ou null se ele não curtiu
const GetCurtidaComentario = async (idUsuario, idComentario) => {
    try {
        const [rows] = await knexConex.raw(
            'select * from tbl_curtida_comentario where id_usuario = ? and id_comentario = ?',
            [idUsuario, idComentario]
        )

        return rows[0] ?? null
    } catch (error) {
        console.error('Erro ao buscar curtida do comentário:', error)
        throw error
    }
}

// Todas as curtidas de um comentário (mais recentes primeiro).
// Cada linha traz "total" (quantidade de curtidas do comentário). Com lista
// vazia não vem nenhuma linha, então o total é 0
const GetAllCurtidasByIdComentario = async (idComentario) => {
    try {
        const [rows] = await knexConex.raw(
            `select c.*,
                (select count(*) from tbl_curtida_comentario where id_comentario = ?) as total
             from tbl_curtida_comentario c
             where c.id_comentario = ?
             order by c.data_curtida desc`,
            [idComentario, idComentario]
        )

        return rows
    } catch (error) {
        console.error('Erro ao buscar curtidas do comentário:', error)
        throw error
    }
}

// Todas as curtidas feitas por um usuário em comentários (mais recentes primeiro)
const GetAllCurtidasComentarioByIdUsuario = async (idUsuario) => {
    try {
        const [rows] = await knexConex.raw(
            `select * from tbl_curtida_comentario
             where id_usuario = ?
             order by data_curtida desc`,
            [idUsuario]
        )

        return rows
    } catch (error) {
        console.error('Erro ao buscar curtidas do usuário:', error)
        throw error
    }
}

/* ------------------------------ Delete ------------------------------ */

// Remove a curtida (descurtir). Exclusão física. Retorna as linhas afetadas
// (0 = o usuário não tinha curtido)
const DeleteCurtidaComentario = async (idUsuario, idComentario) => {
    try {
        const [result] = await knexConex.raw(
            'delete from tbl_curtida_comentario where id_usuario = ? and id_comentario = ?',
            [idUsuario, idComentario]
        )

        return result.affectedRows
    } catch (error) {
        console.error('Erro ao descurtir comentário:', error)
        throw error
    }
}

module.exports = {
    CreateCurtidaComentario,
    GetCurtidaComentario,
    GetAllCurtidasByIdComentario,
    GetAllCurtidasComentarioByIdUsuario,
    DeleteCurtidaComentario
}