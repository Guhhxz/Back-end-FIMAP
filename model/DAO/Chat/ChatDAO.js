const knex = require('knex')
const knexConfig = require('../../Database_config_knex/KnexFile.js')

const knexConex = knex(knexConfig.development)

const inssertChat = async (nome, id_usuario) => {
    const sql = 'insert into tbl_chat (nome, data_criacao, id_usuario) values (?, now(), ?);'

    try {
        const [result] = await knexConex.raw(sql, [nome, id_usuario])
        return result.insertId
    } catch (error) {
        console.error("Erro ao inserir chat:", error)
        throw error
    }
}

const GetChatById = async (id_chat) => {
    const sql = 'select id, nome, data_criacao, id_usuario from tbl_chat where id = ?;'

    try {
        const [rows] = await knexConex.raw(sql, [id_chat])
        return rows[0] || null
    } catch (error) {
        console.error("Erro ao buscar chat:", error)
        throw error
    }
}

const ListChatsByUserId = async (id_usuario) => {
    const sql = 'select nome, data_criacao from tbl_chat where id_usuario = ? order by data_criacao desc;'

    try {
        const [rows] = await knexConex.raw(sql, [id_usuario])
        return rows
    } catch (error) {
        console.error("Erro ao listar chats:", error)
        throw error
    }
}


const apagarChat = async (id_chat) => {
    const sql = 'delete from tbl_chat where id = ?;'

    try {
        await knexConex.raw(sql, [id_chat])
    } catch (error) {
        console.error("Erro ao apagar chat:", error)
        throw error
    }
}

const UpdateChatName = async (id_chat, novo_nome) => {
    const sql = 'update tbl_chat set nome = ? where id = ?;'

    try {
        await knexConex.raw(sql, [novo_nome, id_chat])
    } catch (error) {
        console.error("Erro ao atualizar nome do chat:", error)
        throw error
    }
}

const GetAllChats = async () => {
    const sql = 'select id, nome, data_criacao, id_usuario from tbl_chat;'

    try {
        const [rows] = await knexConex.raw(sql)
        return rows
    } catch (error) {
        console.error("Erro ao buscar todos os chats:", error)
        throw error
    }
} 


module.exports = {
    inssertChat,
    GetChatById,
    apagarChat,
    ListChatsByUserId,
    UpdateChatName,
    GetAllChats
}