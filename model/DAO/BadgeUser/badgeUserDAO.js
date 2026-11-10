const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

const PushBadgeUser = async (id_usuario, id_badge) => {
        const sql = `insert into tbl_badge_usuario
        (id_usuario, id_badge)
        values (?, ?)`
 
    try {
        const [result] = await knexConex.raw(sql, [id_usuario, id_badge])
 
        // affectedRows em vez de insertId: com chave composta o insertId vem 0
        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao associar badge ao usuário:', error)
        return false
    }
}

const GetBadgesByIdUsuario = async (id_usuario) => {
    const sql = `select b.id, b.icone, b.nome, b.descricao, b.xp
        from tbl_usuario_badge ub
        inner join tbl_badge b on b.id = ub.id_badge
        where ub.id_usuario = ?`
 
    try {
        const [result] = await knexConex.raw(sql, [id_usuario])
 
        return result || []
    } catch (error) {
        console.error('Erro ao buscar badges do usuário:', error)
        return false
    }
}

const RemoverBadgeUsuario = async (id_usuario, id_badge) => {
    const sql = `delete from tbl_usuario_badge
        where id_usuario = ? and id_badge = ?`
 
    try {
        const [result] = await knexConex.raw(sql, [id_usuario, id_badge])
 
        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao remover badge do usuário:', error)
        return false
    }
}

module.exports = {
    PushBadgeUser,
    GetBadgesByIdUsuario,
    RemoverBadgeUsuario
}