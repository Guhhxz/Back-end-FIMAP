// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

// Registrar (ou atualizar) o snapshot do valor total de investimentos do dia, para uma conexão
const registrarSnapshot = async (itemId, valorTotal) => {
    const sql = `INSERT INTO investimento_snapshot (item_id, data, valor_total)
        VALUES (?, CURDATE(), ?)
        ON DUPLICATE KEY UPDATE valor_total = VALUES(valor_total)`

    try {
        await knexConex.raw(sql, [itemId, valorTotal])
    } catch (error) {
        console.error('Erro ao registrar snapshot de investimentos:', error)
    }
}

const PERIODO_DIAS = {
    '1m': 30,
    '6m': 180,
    '1a': 365,
    tudo: null,
}

// Listar os snapshots de uma conexão dentro do período pedido
const listarPorPeriodo = async (itemId, periodo) => {
    const dias = PERIODO_DIAS[periodo]

    let sql = `SELECT data, valor_total FROM investimento_snapshot WHERE item_id = ?`
    const params = [itemId]

    if (dias !== null && dias !== undefined) {
        sql += ` AND data >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`
        params.push(dias)
    }

    sql += ` ORDER BY data ASC`

    try {
        const [result] = await knexConex.raw(sql, params)
        return result || []
    } catch (error) {
        console.error('Erro ao listar evolução de investimentos:', error)
        return []
    }
}

module.exports = { registrarSnapshot, listarPorPeriodo }