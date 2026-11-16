const knex = require('knex')
const knexConfig = require('../../Database_config_knex/KnexFile.js')

const knexConex = knex(knexConfig.development)

const inssertMensagem = async (conteudo, papel, id_chat) => {
    const sql = 'insert into tbl_mensagem (conteudo, data_envio, papel, id_chat) values (?, now(), ?, ?);'

    try {
        const [result] = await knexConex.raw(sql, [conteudo, papel, id_chat])
        return result.insertId
    } catch (error) {
        console.error('Erro ao inserir mensagem:', error)
        throw error
    }
}

// Últimas N mensagens do chat, em ordem cronológica
const ListMensagensByChatId = async (id_chat, limite = 50) => {
    const sql = `
        select * from (
            select conteudo, data_envio, papel
            from tbl_mensagem
            where id_chat = ?
            order by data_envio desc, id desc
            limit ?
        ) as ultimas
        order by data_envio asc, id asc;`

    try {
        const [rows] = await knexConex.raw(sql, [id_chat, limite])
        return rows
    } catch (error) {
        console.error('Erro ao listar mensagens:', error)
        throw error
    }
}

module.exports = {
    inssertMensagem,
    ListMensagensByChatId
}