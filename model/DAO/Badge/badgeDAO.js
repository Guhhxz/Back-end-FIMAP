const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Criar badge
const CreateBadge = async (badge) => {
    let sql = `insert into tbl_badge
        (icone, nome, descricao, xp)
        values (?, ?, ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            badge.icone,
            badge.nome,
            badge.descricao,
            badge.xp
        ])

        return result.insertId
    } catch (error) {
        console.error('Erro ao criar badge:', error)
        return false
    }
}

// Atualizar badge
const UpdateBadge = async (badge) => {
    let sql = `update tbl_badge
        set icone = ?, nome = ?, descricao = ?, xp = ?
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [
            badge.icone,
            badge.nome,
            badge.descricao,
            badge.xp,
            badge.id
        ])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao atualizar badge:', error)
        return false
    }
}

// Deletar badge
const DeleteBadge = async (badge) => {
    let sql = `delete from tbl_badge
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [badge.id])

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar badge:', error)
        return false
    }
}

// Buscar badge pelo nome
const GetBadgeByNome = async (nome) => {
    let sql = `select * from tbl_badge
        where nome = ?`

    try {
        const [result] = await knexConex.raw(sql, [nome])

        return result[0] || null
    } catch (error) {
        console.error('Erro ao buscar badge por nome:', error)
        return null
    }
}

// Buscar todas as badges
const GetAllBadges = async () => {
    try {
        return await knexConex('tbl_badge').select('id', 'icone', 'nome', 'descricao', 'xp')
    } catch (error) {
        console.error('Erro ao buscar todas as badges:', error)
        return false
    }
}

// Validar se a badge já existe pelo nome
const ValidarBadge = async (badge) => {
    try {
        const condicao = []
        const valores = []

        if (badge.nome) {
            condicao.push('nome = ?')
            valores.push(badge.nome)
        }

        // Sem condições, não executa a consulta
        if (condicao.length === 0) {
            return false
        }

        let sql = `select id from tbl_badge
            where ${condicao.join(' AND ')}`

        const [result] = await knexConex.raw(sql, valores)

        return result.length > 0
    } catch (error) {
        console.error('Erro ao validar badge:', error)
        return false
    }
}

module.exports = {
    CreateBadge,
    UpdateBadge,
    DeleteBadge,
    GetBadgeByNome,
    GetAllBadges,
    ValidarBadge
}
