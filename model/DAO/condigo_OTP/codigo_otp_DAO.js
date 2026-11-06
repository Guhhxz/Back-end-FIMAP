// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

// Criar OTP vinculado ao usuário.
// Antes de inserir, desativa os códigos anteriores do mesmo usuário.
const CreateCodigoOTP = async (dados) => {
    const sqlDesativar = `update tbl_codigo_otp
        set ativo = false
        where id_usuario = ? and ativo = true`

    const sqlInserir = `insert into tbl_codigo_otp
        (codigo, ativo, data_expiracao, id_usuario)
        values (?, ?, ?, ?)`

    try {
        // Transação: ou desativa os antigos E cria o novo, ou não faz nada
        return await knexConex.transaction(async (trx) => {
            await trx.raw(sqlDesativar, [dados.id_usuario])

            const result = await trx.raw(sqlInserir, [
                dados.codigo,
                true,
                dados.data_expiracao,
                dados.id_usuario
            ])

            return result?.[0]?.insertId || false
        })
    } catch (error) {
        console.error('Erro ao criar OTP:', error)
        return false
    }
}

// Buscar OTP ativo e não expirado do usuário com o código informado
const GetCodigoOTPValido = async (id_usuario, codigo) => {
    const sql = `select * from tbl_codigo_otp
        where id_usuario = ?
        and codigo = ?
        and ativo = true
        and data_expiracao > ?`

    try {
        const result = await knexConex.raw(sql, [id_usuario, codigo, new Date()])
        return result?.[0]?.[0] || null
    } catch (error) {
        console.error('Erro ao consultar OTP:', error)
        return null
    }
}

// Buscar todos os OTPs (sem o código, para não expor)
const GetAllCodigoOTP = async () => {
    const sql = `select codigo, ativo, id_usuario
        from tbl_codigo_otp`

    try {
        const result = await knexConex.raw(sql)
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao consultar OTPs:', error)
        return false
    }
}

// Desativar OTP após a utilização
const DesativarCodigoOTP = async (id_usuario, codigo) => {
    const sql = `update tbl_codigo_otp
        set ativo = false
        where id_usuario = ? and codigo = ? and ativo = true`

    try {
        const result = await knexConex.raw(sql, [id_usuario, codigo])
        return result?.[0]?.affectedRows > 0
    } catch (error) {
        console.error('Erro ao desativar OTP:', error)
        return false
    }
}

module.exports = {
    CreateCodigoOTP,
    GetCodigoOTPValido,
    GetAllCodigoOTP,
    DesativarCodigoOTP
}