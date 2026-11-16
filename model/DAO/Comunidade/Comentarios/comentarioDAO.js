const knex = require('knex')

const knexConfig = require('../../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

const CreateComentario = async (comentario) => {
    const sql = `insert into tbl_comentario
        (mensagem, data_criacao, id_usuario, id_post, id_comentario_pai)
        values (?, now(), ?, ?, ?)`

    const result = await knexConex.raw(sql, [
        comentario.mensagem,
        comentario.id_usuario,
        comentario.id_post,
        comentario.id_comentario_pai
    ])

    return result
};

const DeleteComentario = async (idComentario) => {
    const sql = `delete from tbl_comentario where id = ?`

    try {
        const result = await knexConex.raw(sql, [idComentario])
        return result
    } catch (error) {
        console.error('Erro ao deletar comentário:', error)
        throw error
    } 
};

const UpdateComentario = async (idComentario, novaMensagem) => {
    const sql = `update tbl_comentario set mensagem = ?, data_atualizacao = now() where id = ?`

    try {
        const result = await knexConex.raw(sql, [novaMensagem, idComentario])
        return result
    } catch (error) {
        console.error('Erro ao atualizar comentário:', error)
        throw error
    }
};

const GetComentariosByPostId = async (idPost) => {
    const sql = `select * from tbl_comentario where id_post = ?`

    try {
        const [rows] = await knexConex.raw(sql, [idPost])
        return rows
    } catch (error) {
        console.error('Erro ao buscar comentários por post:', error)
        throw error
    }
};

const GetComentariosByUsuarioId = async (idUsuario) => {
    const sql = `select * from tbl_comentario where id_usuario = ?`

    try {
        const [rows] = await knexConex.raw(sql, [idUsuario])
        return rows
    } catch (error) {
        console.error('Erro ao buscar comentários por usuário:', error)
        throw error
    }
};

module.exports = {
    CreateComentario,
    DeleteComentario,
    UpdateComentario,
    GetComentariosByPostId,
    GetComentariosByUsuarioId
}