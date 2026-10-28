
const knex = require('knex')
const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Salva o OTP e os dados temporários do cadastro
const CreateCodigoOTP = async (dados) => {
    try {
        const [id] = await knexConex('tbl_codigo_otp').insert({
            email: dados.email,
            codigo: dados.codigo,
            dados_usuario: JSON.stringify(dados.dados_usuario),
            ativo: true,
            data_expiracao: dados.data_expiracao
        })

        return id
    } catch (error) {
        console.error('Erro ao criar OTP:', error)
        return false
    }
}

// Busca um OTP válido para o e-mail informado
const GetCodigoOTPValido = async (email, codigo) => {
    try {
        return await knexConex('tbl_codigo_otp')
            .where({
                email,
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

// Desativa o OTP após a utilização
const DesativarCodigoOTP = async (id_codigo_otp) => {
    try {
        const quantidade = await knexConex('tbl_codigo_otp')
            .where({ id_codigo_otp })
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
