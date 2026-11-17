
const knex = require('knex')

const knexConfig = require('../../../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Erros de banco são relançados para serem tratados pelo controller.

/* ============================ CREATE ============================ */

// Registra uma curtida em um comentário.
const CreateCurtidaComentario = async (curtida) => {
    const sql = `insert into tbl_curtida_comentario
        (data_curtida, id_usuario, id_comentario)
        values (now(), ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            curtida.id_usuario,
            curtida.id_comentario
        ])

        return result.insertId
    } catch (error) {
        if (
            error.code !== 'ER_DUP_ENTRY' &&
            error.code !== 'ER_NO_REFERENCED_ROW_2'
        ) {
            console.error('Erro ao curtir comentário:', error)
        }

        throw error
    }
}

/* ============================= READ ============================= */

// Busca a curtida de um usuário em um comentário.
const GetCurtidaComentario = async (idUsuario, idComentario) => {
    try {
        const [rows] = await knexConex.raw(
            `select * from tbl_curtida_comentario
             where id_usuario = ? and id_comentario = ?`,
            [idUsuario, idComentario]
        )

        return rows[0] ?? null
    } catch (error) {
        console.error('Erro ao buscar curtida do comentário:', error)
        throw error
    }
}

// Lista todas as curtidas de um comentário.
const GetAllCurtidasByIdComentario = async (idComentario) => {
    try {
        const [rows] = await knexConex.raw(
            `select * from tbl_curtida_comentario
             where id_comentario = ?
             order by data_curtida desc`,
            [idComentario]
        )

        return rows
    } catch (error) {
        console.error('Erro ao listar curtidas do comentário:', error)
        throw error
    }
}

// Lista todas as curtidas feitas por um usuário em comentários.
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
        console.error('Erro ao listar curtidas do usuário:', error)
        throw error
    }
}

// Conta o total de curtidas de um comentário.
const CountCurtidasByIdComentario = async (idComentario) => {
    try {
        const [rows] = await knexConex.raw(
            `select count(*) as total
             from tbl_curtida_comentario
             where id_comentario = ?`,
            [idComentario]
        )

        return Number(rows[0].total)
    } catch (error) {
        console.error('Erro ao contar curtidas do comentário:', error)
        throw error
    }
}

/* ============================ DELETE ============================ */

// Remove a curtida de um comentário.
const DeleteCurtidaComentario = async (idUsuario, idComentario) => {
    try {
        const [result] = await knexConex.raw(
            `delete from tbl_curtida_comentario
             where id_usuario = ? and id_comentario = ?`,
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
    CountCurtidasByIdComentario,
    DeleteCurtidaComentario
}
