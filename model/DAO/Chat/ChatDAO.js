/*
 * PARA QUE SERVE: Lê e altera os dados do chat no banco: nome, dono, criação e exclusão.
 * QUANDO ENTRA EM AÇÃO: Entra quando o ChatController precisa criar, listar, renomear ou apagar um chat.
 * QUANDO FAZ DIFERENÇA: Faz diferença para manter os IDs corretos e executar as consultas com parâmetros.
 */

const db = require('../../Database_config_knex/connection.js')

const insertChat = async (nome, id_usuario) => {
    const [result] = await db.raw(
        'insert into tbl_chat (nome, data_criacao, id_usuario) values (?, now(), ?);', [nome, id_usuario])
    return result.insertId
}

// O id também é retornado para os controllers conseguirem referenciar o chat.
const GetChatById = async (id_chat, id_usuario) => {
    const [rows] = await db.raw('select id, nome, data_criacao, id_usuario from tbl_chat where id = ? and id_usuario = ?;', [id_chat, id_usuario])
    return rows[0] || null
}

const ListChatsByUserId = async (id_usuario) => {
    const [rows] = await db.raw(
        'select id, nome, data_criacao, id_usuario from tbl_chat where id_usuario = ? order by data_criacao desc, id desc;',
        [id_usuario])
    return rows
}

// A exclusão exige que chat e usuário correspondam no próprio comando SQL.
const apagarChat = async (id_chat, id_usuario) => {
    const [result] = await db.raw('delete from tbl_chat where id = ? and id_usuario = ?;', [id_chat, id_usuario])
    return result.affectedRows > 0
}

const UpdateChatName = async (id_chat, novo_nome, id_usuario) => {
    const [result] = await db.raw('update tbl_chat set nome = ? where id = ? and id_usuario = ?;', [novo_nome, id_chat, id_usuario])
    return result.affectedRows > 0
}

module.exports = {
    insertChat,
    inssertChat: insertChat, // Compatibilidade com chamadas existentes.
    GetChatById,
    ListChatsByUserId,
    apagarChat,
    UpdateChatName
}
