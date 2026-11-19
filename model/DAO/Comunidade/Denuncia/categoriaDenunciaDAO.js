const knex = require('knex')

const knexConfig = require('../../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

const GetAllCategoryComplant = async () => {
        try {
        const [rows] = await knexConex.raw('select * from tbl_categoria_denuncia')

        return rows
    } catch (error) {
        console.error('Erro ao buscar posts:', error)
        throw error
    }
}

module.exports = {GetAllCategoryComplant }