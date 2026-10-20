// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../../database_config_knex/knexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

const InsertDispositivo = async (dispositivo) => {
        let sql =`insert into tbl_dispositivo (nome, sistema_operacional, identificador, data_cadastro, id_usuario)
          values( 
                '${dispositivo.nome}',
                '${dispositivo.sistema_operacional}',
                '${dispositivo.identificador}',
                '${dispositivo.data_cadastro}',
                '${dispositivo.id_usuario}')`
        try {
            let result = knexConex.raw(sql)

            if(result) return result[0].insertId

    } catch (error) {
        console.error('Erro ao criar dispositivo:', error)
        console.log(error)
        return false
    }
}

const UpdateDispositivo = async (dispositivo) => {
        let sql =`update tbl_dispositivo 
        SET  nome = '${dispositivo.nome}',
                    sistema_operacional = '${dispositivo.sistema_operacional}',
                    identificador = '${dispositivo.identificador}',
                    data_cadastro = '${dispositivo.data_cadastro}',
                    id_usuario = '${dispositivo.id_usuario}'
               WHERE id = ${dispositivo.id}`
        try {
            let result = knexConex.raw(sql)

            if(result) return result[0]

    } catch (error) {
        console.error('Erro ao atualizar dispositivo:', error)
        console.log(error)
        return false
    }
}

const DeleteDispositivo = async (dispositivo) => {
        let sql = `DELETE FROM tbl_produto
                WHERE id = ${id}`
        try {
            let result = knexConex.raw(sql)

            if(result) return result[0]

    } catch (error) {
        console.error('Erro ao deletar dispositivo:', error)
        console.log(error)
        return false
    }
}

const ValidarDispositivo= async (dispositivo) => {
    try {
        const consulta = knexConex('tbl_dispositivo')

        consulta.where('identificador', dispositivo.identificador)

        const resultado = await consulta.first()

        return Boolean(resultado)
    } catch (error) {
        console.error('Erro ao validar dispositivo:', error)
        throw error
    }
}

module.exports = {
    InsertDispositivo,
    UpdateDispositivo,
    DeleteDispositivo,
    ValidarDispositivo
}