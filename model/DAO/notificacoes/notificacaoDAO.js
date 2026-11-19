
const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// ============================================================
// CREATE NOTIFICATION
// ============================================================

const CreateNotification = async (notification) => {
    const sql = `insert into tbl_notificacao
        (icone, nome, conteudo, data_criacao, lida, id_usuario)
        values (?, ?, ?, now(), 0, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            notification.icone,
            notification.nome,
            notification.conteudo,
            notification.id_usuario
        ])

        return result.insertId
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return 'FK_INVALIDA'

        console.error('Error creating notification:', error)
        return null
    }
}

// ============================================================
// GET NOTIFICATION BY ID
// ============================================================

const GetNotificationById = async (id) => {
    const sql = `select id, icone, nome, conteudo, data_criacao, lida, id_usuario
        from tbl_notificacao
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [id])

        return result[0] || null
    } catch (error) {
        console.error('Error getting notification by id:', error)
        return null
    }
}

// ============================================================
// GET NOTIFICATIONS BY USER
// ============================================================

const GetNotificationsByUser = async (id_usuario, { lida } = {}) => {
    let sql = `select id, icone, nome, conteudo, data_criacao, lida
        from tbl_notificacao
        where id_usuario = ?
        order by data_criacao desc`

    const values = [id_usuario]

    if (lida !== undefined) {
        sql += ` and lida = ?`
        values.push(lida)
    }

    try {
        const [result] = await knexConex.raw(sql, values)

        return result || []
    } catch (error) {
        console.error('Error getting user notifications:', error)
        return false
    }
}

const GetUnreadNotifications = async (id_usuario) => {
    const sql = `select
            id, icone, nome, conteudo, data_criacao, lida,
            (select count(*)
                from tbl_notificacao
                where id_usuario = ? and lida = 0
            ) as quantidade
        from tbl_notificacao
        where id_usuario = ? and lida = 0
        order by data_criacao desc`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario, id_usuario])

        return {
            quantidade: result.length > 0 ? Number(result[0].quantidade) : 0,
            notificacoes: result.map(({ quantidade, ...notificacao }) => notificacao)
        }
    } catch (error) {
        console.error('Error getting unread notifications:', error)
        return null
    }
}


const GetReadNotifications = async (id_usuario) => {
    const sql = `select
            id, icone, nome, conteudo, data_criacao, lida,
            (select count(*)
                from tbl_notificacao
                where id_usuario = ? and lida = 1
            ) as quantidade
        from tbl_notificacao
        where id_usuario = ? and lida = 1
        order by data_criacao desc`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario, id_usuario])

        return {
            quantidade: result.length > 0 ? Number(result[0].quantidade) : 0,
            notificacoes: result.map(({ quantidade, ...notificacao }) => notificacao)
        }
    } catch (error) {
        console.error('Error getting read notifications:', error)
        return null
    }
}

// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================

const MarkAsRead = async (id, id_usuario) => {
    const sql = `update tbl_notificacao
        set lida = 1
        where id = ? and id_usuario = ? and lida = 0`

    try {
        const [result] = await knexConex.raw(sql, [id, id_usuario])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return null
    }
}

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

const MarkAllAsRead = async (id_usuario) => {
    const sql = `update tbl_notificacao
        set lida = 1
        where id_usuario = ? and lida = 0`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])

        return result.affectedRows
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return null
    }
}

// ============================================================
// DELETE NOTIFICATION
// ============================================================

const DeleteNotification = async (id, id_usuario) => {
    const sql = `delete from tbl_notificacao
        where id = ? and id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [id, id_usuario])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Error deleting notification:', error)
        return null
    }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    CreateNotification,
    GetNotificationById,
    GetNotificationsByUser,
    GetUnreadNotifications,
    GetReadNotifications,
    MarkAsRead,
    MarkAllAsRead,
    DeleteNotification
}
