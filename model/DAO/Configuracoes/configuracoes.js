const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

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
    SET notificacao = ?, SET alerta = ?, SET relatorio = ?, SET recomendacao = ?, SET topicos = ?
    WHERE id_usuario = ?`

    try {
        const result = await knexConex.raw(sql, [configuracoes, idUsuario])
        return result?.[0]?.affectedRows || 0
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error)
        return 0
    }
}

module.exports = {
    GetConfiguracoesById,
    UpdateConfiguracoesById

}