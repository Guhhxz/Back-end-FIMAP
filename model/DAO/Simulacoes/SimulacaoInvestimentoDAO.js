const knex = require('knex')(require('../../Database_config_knex/KnexFile.js').development)

const removerSimulacaoInvestimento = async (simulacaoId, usuarioId) => {
    const removidas = await knex('tbl_simulacao_investimento')
        .where({ id: simulacaoId, id_usuario: usuarioId })
        .del()
    return removidas > 0
}

module.exports = { removerSimulacaoInvestimento }
