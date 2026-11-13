const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)


const CreateNotificacao = async (notificacao) => {
    const sql = `insert into tbl_notificacao
        (icone, nome, conteudo, data_criacao, lida, id_usuario)
        values (?, ?, ?, now(), 0, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            notificacao.icone,
            notificacao.nome,
            notificacao.conteudo,
            notificacao.id_usuario
        ])

        return result.insertId
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return 'FK_INVALIDA'

        console.error('Erro ao criar notificação:', error)
        return null
    }
}

const GetNotificacaoById = async (id) => {
    const sql = `select id, icone, nome, conteudo, data_criacao, lida, id_usuario
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
    let sql = `select id, icone, nome, conteudo, data_criacao, lida
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

const ListAllNotificacoesLidas = async (id_usuario) => {
    const sql = `select
                     icone,
                     nome,
                     conteudo,
                     data_criacao,
                     lida,
                     id_usuario,
                     (
                     select count(*)
                     from tbl_notificacao 
                     where id_usuario = ? and lida = 1)
                     as total_lidas
    from tbl_notificacao
    where lida = 1 and id_usuario = ?
    order by data_criacao desc;`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])

        return result || []
    } catch (error) {
        console.error('Erro ao buscar notificações lidas:', error)
        return false
    }
}

const ListAllNotificacoesNaoLidas = async (id_usuario) => {
    const sql = `select
                     icone,
                     nome,
                     conteudo,
                     data_criacao,
                     lida,
                     id_usuario,
                     (
                     select count(*)
                     from tbl_notificacao 
                     where id_usuario = ? and lida = 0)
                     as total_nao_lidas
    from tbl_notificacao
    where lida = 0 and id_usuario = ?
    order by data_criacao desc;`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])

        return result || []
    } catch (error) {
        console.error('Erro ao buscar notificações lidas:', error)
        return false
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
    ListAllNotificacoesLidas,
    ListAllNotificacoesNaoLidas
}