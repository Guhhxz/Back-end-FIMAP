// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

const insertCodigoOtp = async (codigo) => {
    let sql = `insert into tbl_codigo_otp
        (codigo, ativo, data_expiracao, id_usuario)
        values (?, ?, ?, ?)`

    try {
        let result = await knexConex.raw(sql, [
            codigo.codigo,
            codigo.ativo,
            codigo.data_expiracao,
            codigo.id_usuario
        ])

        if (result) return result[0].insertId
    } catch (error) {
        console.error('Erro ao criar CodigoOtp:', error)
        return false
    }
}

const updateCodigoOtp = async (codigo) => {
    let sql = `update tbl_codigo_otp 
        set codigo = ?, ativo = ?, data_expiracao = ?, id_usuario = ?
        where id = ?`

    try {
        let result = await knexConex.raw(sql, [
            codigo.codigo,
            codigo.ativo,
            codigo.data_expiracao,
            codigo.id_usuario,
            codigo.id
        ])

        if (result) return result[0]
    } catch (error) {
        console.error('Erro ao atualizar CodigoOtp:', error)
        return false
    }
}

const deleteCodigoOtp = async (codigo) => {
    let sql = `delete from tbl_codigo_otp where id = ?`

    try {
        let result = await knexConex.raw(sql, [codigo.id])

        if (result) return result[0]
    } catch (error) {
        console.error('Erro ao deletar CodigoOtp:', error)
        return false
    }
}

module.exports = {
    insertCodigoOtp,
    updateCodigoOtp,
    deleteCodigoOtp
}
