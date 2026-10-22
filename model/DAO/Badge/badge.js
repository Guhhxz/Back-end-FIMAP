const knex = require('knex')


const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

const CreateBadge = async (badge) => {
    let sql = `insert into tbl_badge
            (icone, nome, descricao, xp)
            values (?, ?, ?, ?)`
    try {

        const [id] = await knexConex.raw(sql, [
            badge.icone,
            badge.nome,
            badge.descricao,
            badge.xp
        ])

        if (result) return result[0].insertId

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

    try{
        let result = await knexConex.raw(sql, [
            badge.icone,
            badge.nome,
            badge.descricao,
            badge.xp

        ])

        if (result) return result[0]

    } catch (error) {
        console.error('Erro ao atualizar Badge:', error)
        return false
    }
}
// Deletar badge
const DeleteBadge = async (badge) => {
    let sql = `delete tbl_badge where id = ?`

    try{
        let result = await knexConex.raw(sql, [id])
        
        if (result) return result[0]

    }catch (error) {
        console.error('Erro ao deletar badge:'. error)
        return false
    }
}

// Buscar badge pelo nome
const GetBadgeByNome = async (nome) => {
     let sql = `select * from tbl_badge
        where nome = ?`

    try {
        let result = await knexConex.raw(sql, [nome])

        if (result) return result[0][0] || null
    } catch (error) {
        console.error('Erro ao buscar badge por nome:', error)
        return null
    }
}

// Buscar todas as Badges
const GetAllBadges = async () => {
    let sql = `select * from tbl_badge` 
    try {
        return await knexConex('tbl_badge')
            .select(
                'id',
                'icone',
                'nome',
                'descricao',
                'xp'
            )
    } catch (error) {
        console.error('Erro ao buscar todas as badges:', error)
        return false
    }
}
