const knex = require('knex')
const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Salva o OTP vinculado ao usuário (colunas reais da tbl_codigo_otp)
const CreateCodigoOTP = async (dados) => {
    try {
        const [id] = await knexConex('tbl_codigo_otp').insert({
            codigo: dados.codigo,
            ativo: true,
            data_expiracao: dados.data_expiracao,
            id_usuario: dados.id_usuario
        })

        return id
    } catch (error) {
        console.error('Erro ao criar OTP:', error)
        return false
    }
}

// Busca um OTP ativo e não expirado do usuário com o código informado
const GetCodigoOTPValido = async (id_usuario, codigo) => {
    try {
        return await knexConex('tbl_codigo_otp')
            .where({
                id_usuario,
                codigo,
                ativo: true
            })
            .where('data_expiracao', '>', new Date())
            .first()
    } catch (error) {
        console.error('Erro ao consultar OTP:', error)
        return false
    }
}

// Desativa o OTP após a utilização (a chave da tabela é "id")
const DesativarCodigoOTP = async (id) => {
    try {
        const quantidade = await knexConex('tbl_codigo_otp')
            .where({ id })
            .update({ ativo: false })

        return quantidade > 0
    } catch (error) {
        console.error('Erro ao desativar OTP:', error)
        return false
    }
}

module.exports = {
    CreateCodigoOTP,
    GetCodigoOTPValido,
    DesativarCodigoOTP
}