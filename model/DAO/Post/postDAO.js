const knex = require('knex');

const knexConfig = require('../../Database_config_knex/KnexFile.js');
const knexConex = knex(knexConfig.development);

const STATUS_ATIVO = 1
const STATUS_REMOVIDO = 0



const CreatePost = async (post) => {
    const sql = `insert into tbl_post (conteudo, data_criacao, data_atualizacao, status, id_usuario)
                 values (?, now(), now(), ?, ?)`
    try {
        const [result] = await knexConex.raw(sql, [
            post.conteudo,
            STATUS_ATIVO,
            post.id_usuario
        ])
        return result.insertId
    } catch (error) {
        console.error('Erro ao criar post:', error)
        throw error
    }
}

const UpdatePost = async (post) => {
    const sql = `update tbl_post set conteudo = ?, data_atualizacao = now()
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

const DeletePost = async (postId, idUsuario) => {
    const sql = `update tbl_post set status = ?
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

const GetPostById = async (postId) => {
    const sql = `select * from tbl_post where id = ?`
    try {
        const [rows] = await knexConex.raw(sql, [postId])
        return rows[0] ?? null
    } catch (error) {
        console.error('Erro ao buscar post:', error)
        throw error
    }
}

const GetAllPostsByIdUsuario = async (idUsuario) => {
    const sql = `select * from tbl_post where id_usuario = ?`
    try {
        const [rows] = await knexConex.raw(sql, [idUsuario])
        return rows
    } catch (error) {
        console.error('Erro ao buscar posts:', error)
        throw error
    }
}

const GetAllPostsInativosByIdUsuario = async (idUsuario) => {
    const sql = `select * from tbl_post where id_usuario = ? and status = ?`
    try {
        const [rows] = await knexConex.raw(sql, [idUsuario, STATUS_REMOVIDO])
        return rows
    } catch (error) {
        console.error('Erro ao buscar posts inativos:', error)
        throw error
    }
}

const GetAllPostsAtivosByIdUsuario = async (idUsuario) => {
    const sql = `select * from tbl_post where id_usuario = ? and status = ?`
    try {
        const [rows] = await knexConex.raw(sql, [idUsuario, STATUS_ATIVO])
        return rows
    } catch (error) {
        console.error('Erro ao buscar posts ativos:', error)
        throw error
    }
}

module.exports = {
    CreatePost,
    UpdatePost,
    DeletePost,
    GetPostById,
    GetAllPostsByIdUsuario,
    GetAllPostsInativosByIdUsuario,
    GetAllPostsAtivosByIdUsuario
}