const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

const CAMPOS_ATUALIZAVEIS = ['icone', 'nome', 'descricao', 'xp']

// Convenção de retorno das funções de escrita:
//   true / id  -> sucesso
//   false      -> nenhum registro afetado (não encontrado)
//   null       -> erro de banco
//   'DUPLICADO' / 'EM_USO' -> violação de UNIQUE / FOREIGN KEY

// Criar badge
const CreateBadge = async (badge) => {
    const sql = `insert into tbl_badge
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
        if (error.code === 'ER_DUP_ENTRY') return 'DUPLICADO'

        console.error('Erro ao criar badge:', error)
        return null
    }
}

// Atualizar badge (parcial: só os campos enviados)
const UpdateBadge = async (badge) => {
    const sets = []
    const valores = []

    for (const campo of CAMPOS_ATUALIZAVEIS) {
        if (badge[campo] !== undefined) {
            sets.push(`${campo} = ?`)
            valores.push(badge[campo])
        }
    }

    if (sets.length === 0) return false

    const sql = `update tbl_badge
        set ${sets.join(', ')}
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [...valores, badge.id])

        return result.affectedRows > 0
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return 'DUPLICADO'

        console.error('Erro ao atualizar badge:', error)
        return null
    }
}

// Buscar badge pelo id
const GetBadgeById = async (id) => {
    try {
        const [result] = await knexConex.raw('select * from tbl_badge where id = ?', [id])

        return result[0] || null
    } catch (error) {
        console.error('Erro ao buscar badge por id:', error)
        return null
    }
}

// Deletar badge
const DeleteBadge = async (badge) => {
    const sql = `delete from tbl_badge
        where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [badge.id])

        return result.affectedRows > 0
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return 'EM_USO'

        console.error('Erro ao deletar badge:', error)
        return null
    }
}

// Buscar badge pelo nome
const GetBadgeByNome = async (nome) => {
    const sql = `select * from tbl_badge
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

// Verifica se já existe badge com o mesmo nome (true/false; null em caso de erro).
// idIgnorar: id da própria badge, usado na atualização.
const ValidarBadge = async (badge, idIgnorar = null) => {
    try {
        if (!badge.nome) return false

        let sql = `select id from tbl_badge where nome = ?`
        const valores = [badge.nome]

        if (idIgnorar) {
            sql += ` and id <> ?`
            valores.push(idIgnorar)
        }

        const [result] = await knexConex.raw(sql, valores)

        return result.length > 0
    } catch (error) {
        console.error('Erro ao validar badge:', error)
        return null
    }
}

module.exports = {
    CreateBadge,
    UpdateBadge,
    DeleteBadge,
    GetBadgeById,
    GetBadgeByNome,
    GetAllBadges,
    ValidarBadge
}