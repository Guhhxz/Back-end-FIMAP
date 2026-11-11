const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Nome único da tabela de vínculo (antes havia tbl_badge_usuario e tbl_usuario_badge misturados)
const TABELA = 'tbl_badge_usuario'

// Verifica se o usuário já possui a badge (true/false; null em caso de erro)
const UsuarioPossuiBadge = async (id_usuario, id_badge) => {
    const sql = `select 1 from ${TABELA}
        where id_usuario = ? and id_badge = ?
        limit 1`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario, id_badge])

        return result.length > 0
    } catch (error) {
        console.error('Erro ao verificar badge do usuário:', error)
        return null
    }
}

// Vincula badge ao usuário
// Retorna: true | 'DUPLICADO' | 'FK_INVALIDA' (usuário/badge inexistente) | null (erro)
const PushBadgeUser = async (id_usuario, id_badge) => {
    const sql = `insert into ${TABELA}
        (id_usuario, id_badge, data_conquista)
        values (?, ?, now())`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario, id_badge])

        // affectedRows em vez de insertId: com chave composta o insertId vem 0
        return result.affectedRows > 0
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return 'DUPLICADO'
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return 'FK_INVALIDA'

        console.error('Erro ao associar badge ao usuário:', error)
        return null
    }
}

// Lista badges do usuário (false em caso de erro)
const GetBadgesByIdUsuario = async (id_usuario) => {
    const sql = `select b.id, b.icone, b.nome, b.descricao, b.xp, ub.data_conquista
        from ${TABELA} ub
        inner join tbl_badge b on b.id = ub.id_badge
        where ub.id_usuario = ?
        order by ub.data_conquista desc`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])

        return result || []
    } catch (error) {
        console.error('Erro ao buscar badges do usuário:', error)
        return false
    }
}

// Remove vínculo. Retorna: true | false (não possuía) | null (erro)
const RemoverBadgeUsuario = async (id_usuario, id_badge) => {
    const sql = `delete from ${TABELA}
        where id_usuario = ? and id_badge = ?`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario, id_badge])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao remover badge do usuário:', error)
        return null
    }
}

module.exports = {
    UsuarioPossuiBadge,
    PushBadgeUser,
    GetBadgesByIdUsuario,
    RemoverBadgeUsuario
}