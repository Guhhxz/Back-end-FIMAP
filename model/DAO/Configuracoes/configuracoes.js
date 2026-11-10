const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

const InsertConfiguracoes = async (idUsuario, configuracoes = {}) => {
    const sql = `
        INSERT INTO tbl_configuracoes 
            (notificacao, alerta, relatorio, recomendacao, topicos, id_usuario)
        VALUES (?, ?, ?, ?, ?, ?)`

    const {
        notificacao = 0,
        alerta = 0,
        relatorio = 0,
        recomendacao = 0,
        topicos = 0
    } = configuracoes

    try {
        const [result] = await knexConex.raw(sql, [
            notificacao,
            alerta,
            relatorio,
            recomendacao,
            topicos,
            idUsuario
        ])
        return result?.insertId || 0
    } catch (error) {
        console.error('Erro ao inserir configurações:', error)
        return 0
    }
}

const GetConfiguracoesById = async(idUsuario) => {
    const sql = `SELECT * FROM tbl_configuracoes WHERE id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [idUsuario])
        return result || []
    } catch (error) {
        console.error('Erro ao buscar configurações:', error)
        return []
    }
}

const UpdateConfiguracoesById = async(idUsuario, configuracoes) => {
    const sql = `UPDATE tbl_configuracoes 
    SET notificacao = ?, alerta = ?, relatorio = ?, recomendacao = ?, topicos = ?
    WHERE id_usuario = ?`

    const {
        notificacao = 0,
        alerta = 0,
        relatorio = 0,
        recomendacao = 0,
        topicos = 0
    } = configuracoes

    try {
        const result = await knexConex.raw(sql, [
            notificacao,
            alerta,
            relatorio,
            recomendacao,
            topicos,
            idUsuario
        ])
        return result?.[0]?.affectedRows || 0
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error)
        return 0
    }
}

module.exports = {
    InsertConfiguracoes,
    GetConfiguracoesById,
    UpdateConfiguracoesById
}