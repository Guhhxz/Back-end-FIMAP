
const knex = require('knex')

const knexConfig = require('../../../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Convenção deste arquivo: erros de banco são relançados (throw);
// quem trata é o controller.

/* ------------------------------ Create ------------------------------ */

// Registra a curtida de um usuário em um post. Retorna o id criado.
// UNIQUE(id_usuario, id_post): curtir duas vezes lança ER_DUP_ENTRY.
const CreateCurtidaPost = async (curtida) => {
    const sql = `insert into tbl_curtida_post
        (data_curtida, id_usuario, id_post)
        values (now(), ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            curtida.id_usuario,
            curtida.id_post
        ])

        return result.insertId
    } catch (error) {
        if (
            error.code !== 'ER_DUP_ENTRY' &&
            error.code !== 'ER_NO_REFERENCED_ROW_2'
        ) {
            console.error('Erro ao curtir post:', error)
        }

        throw error
    }
}

/* ------------------------------- Read ------------------------------- */

// Retorna a curtida do usuário naquele post, ou null se ele não curtiu.
const GetCurtidaPost = async (idUsuario, idPost) => {
    try {
        const [rows] = await knexConex.raw(
            `select * from tbl_curtida_post
             where id_usuario = ? and id_post = ?`,
            [idUsuario, idPost]
        )

        return rows[0] ?? null
    } catch (error) {
        console.error('Erro ao buscar curtida do post:', error)
        throw error
    }
}

// Todas as curtidas de um post (mais recentes primeiro).
const GetAllCurtidasByIdPost = async (idPost) => {
    try {
        const [rows] = await knexConex.raw(
            `select c.*,
                (select count(*) from tbl_curtida_post
                 where id_post = :idPost) as total
             from tbl_curtida_post c
             where c.id_post = :idPost
             order by c.data_curtida desc`,
            { idPost }
        )

        return rows
    } catch (error) {
        console.error('Erro ao buscar curtidas do post:', error)
        throw error
    }
}

// Todas as curtidas feitas por um usuário em posts (mais recentes primeiro).
const GetAllCurtidasPostByIdUsuario = async (idUsuario) => {
    try {
        const [rows] = await knexConex.raw(
            `select * from tbl_curtida_post
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

// Conta o total de curtidas de um post.
const CountCurtidasByIdPost = async (idPost) => {
    try {
        const [rows] = await knexConex.raw(
            `select count(*) as total
             from tbl_curtida_post
             where id_post = ?`,
            [idPost]
        )

        return Number(rows[0].total)
    } catch (error) {
        console.error('Erro ao contar curtidas do post:', error)
        throw error
    }
}

/* ------------------------------ Delete ------------------------------ */

// Remove a curtida (descurtir). Exclusão física.
// Retorna as linhas afetadas (0 = o usuário não tinha curtido).
const DeleteCurtidaPost = async (idUsuario, idPost) => {
    try {
        const [result] = await knexConex.raw(
            `delete from tbl_curtida_post
             where id_usuario = ? and id_post = ?`,
            [idUsuario, idPost]
        )

        return result.affectedRows
    } catch (error) {
        console.error('Erro ao descurtir post:', error)
        throw error
    }
}

module.exports = {
    CreateCurtidaPost,
    GetCurtidaPost,
    GetAllCurtidasByIdPost,
    GetAllCurtidasPostByIdUsuario,
    CountCurtidasByIdPost,
    DeleteCurtidaPost
}
