const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)


const CreateNotificacao = async (notificacao) => {
    const sql = `insert into tbl_notificacao
        (icone, nome, conteudo, data_criacao, lida, id_usuario, tipo_referencia, id_referencia)
        values (?, ?, ?, now(), 0, ?, ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            notificacao.icone,
            notificacao.nome,
            notificacao.conteudo,
            notificacao.id_usuario,
            notificacao.tipo_referencia ?? null,
            notificacao.id_referencia ?? null
        ])

        return result.insertId
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return 'FK_INVALIDA'

        console.error('Erro ao criar notificação:', error)
        return null
    }
}

const GetNotificacaoById = async (id) => {
    const sql = `select id, icone, nome, conteudo, data_criacao, lida, id_usuario, tipo_referencia, id_referencia
        from tbl_notificacao
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [id])

        return result[0] || null
    } catch (error) {
        console.error('Erro ao buscar notificação por id:', error)
        return null
    }
}

const GetNotificacoesByUsuario = async (id_usuario, { lida } = {}) => {
    let sql = `select id, icone, nome, conteudo, data_criacao, lida, tipo_referencia, id_referencia
        from tbl_notificacao
        where id_usuario = ?`
    const valores = [id_usuario]

    if (lida !== undefined) {
        sql += ` and lida = ?`
        valores.push(lida)
    }

    sql += ` order by data_criacao desc`

    try {
        const [result] = await knexConex.raw(sql, valores)

        return result || []
    } catch (error) {
        console.error('Erro ao buscar notificações do usuário:', error)
        return false
    }
}

// Conta quantas notificações não lidas o usuário tem. Usada pelo badge do
// sino no header — por isso retorna sempre um número (nunca uma lista).
const ContarNaoLidas = async (id_usuario) => {
    const sql = `select count(*) as total
        from tbl_notificacao
        where id_usuario = ? and lida = 0`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])

        return Number(result[0].total)
    } catch (error) {
        console.error('Erro ao contar notificações não lidas:', error)
        return null
    }
}

// Mesma ideia de ContarNaoLidas, mas para notificações já lidas.
const ContarLidas = async (id_usuario) => {
    const sql = `select count(*) as total
        from tbl_notificacao
        where id_usuario = ? and lida = 1`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])

        return Number(result[0].total)
    } catch (error) {
        console.error('Erro ao contar notificações lidas:', error)
        return null
    }
}

const MarcarComoLida = async (id) => {
    const sql = `update tbl_notificacao
        set lida = 1
        where id = ? and lida = 0`

    try {
        const [result] = await knexConex.raw(sql, [id])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error)
        return null
    }
}

const MarcarTodasComoLidas = async (id_usuario) => {
    const sql = `update tbl_notificacao
        set lida = 1
        where id_usuario = ? and lida = 0`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])

        return result.affectedRows
    } catch (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error)
        return null
    }
}

// Deletar notificação
const DeleteNotificacao = async (id) => {
    const sql = `delete from tbl_notificacao
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [id])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar notificação:', error)
        return null
    }
}

module.exports = {
    CreateNotificacao,
    GetNotificacaoById,
    GetNotificacoesByUsuario,
    MarcarComoLida,
    MarcarTodasComoLidas,
    DeleteNotificacao,
    ContarNaoLidas,
    ContarLidas
}
