// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

// Criar conexão Open Finance
const criarConexao = async (conexao) => {
    const sql = `INSERT INTO tbl_conexao_open_finance
        (status, consentimento_api, ultima_sincronizacao, provedor, external_connection_id, nome_instituicao, id_usuario)
        VALUES (?, ?, ?, ?, ?, ?, ?)`

    try {
        const result = await knexConex.raw(sql, [
            conexao.status ?? 0,
            conexao.consentimento_api ?? null,
            conexao.ultima_sincronizacao ?? null,
            conexao.provedor ?? null,
            conexao.external_connection_id ?? null,
            conexao.nome_instituicao ?? null,
            conexao.id_usuario
        ])

        return result?.[0]?.insertId || false
    } catch (error) {
        console.error('Erro ao criar conexão Open Finance:', error)
        return false
    }
}

// Listar conexões de um usuário
const listarConexoesPorUsuario = async (idUsuario) => {
    const sql = `SELECT 
        id,
        status,
        consentimento_api,
        ultima_sincronizacao,
        provedor,
        external_connection_id,
        nome_instituicao,
        percentual_cdi_manual,
        id_usuario
    FROM tbl_conexao_open_finance
    WHERE id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [idUsuario])
        return result || []
    } catch (error) {
        console.error('Erro ao listar conexões Open Finance:', error)
        return []
    }
}

// Buscar conexão por ID
const buscarConexaoPorId = async (id) => {
    const sql = `SELECT 
        id,
        status,
        consentimento_api,
        ultima_sincronizacao,
        provedor,
        external_connection_id,
        nome_instituicao,
        percentual_cdi_manual,
        id_usuario
    FROM tbl_conexao_open_finance
    WHERE id = ?`

    try {
        const [result] = await knexConex.raw(sql, [id])
        return result?.[0] || false
    } catch (error) {
        console.error('Erro ao buscar conexão Open Finance:', error)
        return false
    }
}

// Listar todas as conexões ativas (de todos os usuários) — usado pelo job de snapshot diário
const listarTodasConexoesAtivas = async () => {
    const sql = `SELECT external_connection_id FROM tbl_conexao_open_finance WHERE status = 1`

    try {
        const [result] = await knexConex.raw(sql)
        return result || []
    } catch (error) {
        console.error('Erro ao listar todas as conexões ativas:', error)
        return []
    }
}

// Define/edita o % do CDI informado manualmente pelo usuário pra essa conexão
// (usado quando o app não consegue identificar o CDI automaticamente).
const atualizarPercentualCdiManual = async (id, idUsuario, percentualCdiManual) => {
    const sql = `UPDATE tbl_conexao_open_finance
        SET percentual_cdi_manual = ?
        WHERE id = ?
        AND id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [percentualCdiManual, id, idUsuario])
        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao atualizar percentual de CDI manual:', error)
        return false
    }
}

// Deletar meta
const DeleteConexao = async (conexao) => {
    const sql = `
        DELETE FROM tbl_conexao_open_finance
        WHERE id = ?
        AND id_usuario = ?
    `

    try {
        const [result] = await knexConex.raw(sql, [
            conexao.id,
            conexao.id_usuario
        ])

        return result.affectedRows > 0

    } catch (error) {
        console.error('Erro ao deletar conexão:', error)
        return false
    }
}

module.exports = {
    criarConexao,
    listarConexoesPorUsuario,
    buscarConexaoPorId,
    listarTodasConexoesAtivas,
    atualizarPercentualCdiManual,
    DeleteConexao
}
