const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Valores padrão das configurações
const PADRAO = {
    notificacao: 0,
    alerta: 0,
    relatorio: 0,
    recomendacao: 0,
    topicos: 0
}

// Monta a lista de valores na ordem esperada pelas queries
const montarValores = (configuracoes = {}) => {
    const { notificacao, alerta, relatorio, recomendacao, topicos } = {
        ...PADRAO,
        ...configuracoes
    }

    return [notificacao, alerta, relatorio, recomendacao, topicos]
}

// Insere configurações. Retorna o id criado (0 em erro)
const InsertConfiguracoes = async (idUsuario, configuracoes = {}) => {
    const sql = `insert into tbl_configuracoes
        (notificacao, alerta, relatorio, recomendacao, topicos, id_usuario)
        values (?, ?, ?, ?, ?, ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            ...montarValores(configuracoes),
            idUsuario
        ])

        return result?.insertId || 0
    } catch (error) {
        console.error('Erro ao inserir configurações:', error)
        return 0
    }
}

// Busca configurações do usuário. Retorna array ([] em erro)
const GetConfiguracoesById = async (idUsuario) => {
    const sql = `select * from tbl_configuracoes where id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [idUsuario])

        return result || []
    } catch (error) {
        console.error('Erro ao buscar configurações:', error)
        return []
    }
}

// Atualiza configurações. Retorna linhas afetadas (0 em erro)
const UpdateConfiguracoesById = async (idUsuario, configuracoes = {}) => {
    const sql = `update tbl_configuracoes
        set notificacao = ?, alerta = ?, relatorio = ?, recomendacao = ?, topicos = ?
        where id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [
            ...montarValores(configuracoes),
            idUsuario
        ])

        return result?.affectedRows || 0
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