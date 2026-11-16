const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Convenção deste arquivo: false = erro ou não encontrado

/* ------------------------------ Create ------------------------------ */

// Cria dispositivo (recebe o objeto montado na controller). Retorna o id criado
const CreateDispositivo = async (dispositivo) => {
    const sql = `insert into tbl_dispositivo
        (nome, sistema_operacional, identificador, data_cadastro, id_usuario)
        values (?, ?, ?, now(), ?)`

    try {
        const [result] = await knexConex.raw(sql, [
            dispositivo.nome,
            dispositivo.sistema_operacional,
            dispositivo.identificador,
            dispositivo.id_usuario
        ])

        return result.insertId
    } catch (error) {
        console.error('Erro ao criar dispositivo:', error)
        return false
    }
}

/* ------------------------------- Read ------------------------------- */

// Busca todos os dispositivos
const GetAllDispositivos = async () => {
    try {
        const [result] = await knexConex.raw('select * from tbl_dispositivo')

        return result
    } catch (error) {
        console.error('Erro ao buscar dispositivos:', error)
        return false
    }
}

// Busca um dispositivo do usuário pelo identificador (registro ou false)
const GetDispositivoByIdentificador = async (id_usuario, identificador) => {
    const sql = `select * from tbl_dispositivo
        where id_usuario = ? and identificador = ?
        limit 1`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario, identificador])

        return result.length > 0 ? result[0] : false
    } catch (error) {
        console.error('Erro ao buscar dispositivo:', error)
        return false
    }
}

/* ------------------------------ Delete ------------------------------ */

// Deleta um dispositivo pelo id
const DeletarDispositivo = async (id_dispositivo) => {
    try {
        const [result] = await knexConex.raw(
            'delete from tbl_dispositivo where id = ?',
            [id_dispositivo]
        )

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar dispositivo:', error)
        return false
    }
}

// Deleta todos os dispositivos de um usuário
const DeleteDispositivosUsuarios = async (id_usuario) => {
    try {
        const [result] = await knexConex.raw(
            'delete from tbl_dispositivo where id_usuario = ?',
            [id_usuario]
        )

        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar dispositivos do usuário:', error)
        return false
    }
}

/* ---------------------------- Validações ---------------------------- */

// Verifica se o usuário existe
const ExisteUsuario = async (id_usuario) => {
    try {
        const [result] = await knexConex.raw(
            'select id from tbl_usuario where id = ?',
            [id_usuario]
        )

        return result.length > 0
    } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        return false
    }
}

// Verifica se o dispositivo já existe (filtra por identificador e/ou usuário)
const ValidarDispositivo = async (dispositivo) => {
    const condicoes = []
    const valores = []

    if (dispositivo.identificador) {
        condicoes.push('identificador = ?')
        valores.push(dispositivo.identificador)
    }

    if (dispositivo.id_usuario) {
        condicoes.push('id_usuario = ?')
        valores.push(dispositivo.id_usuario)
    }

    if (condicoes.length === 0) return false

    const sql = `select id from tbl_dispositivo
        where ${condicoes.join(' and ')}
        limit 1`

    try {
        const [result] = await knexConex.raw(sql, valores)

        return result.length > 0
    } catch (error) {
        console.error('Erro ao validar dispositivo:', error)
        return false
    }
}

module.exports = {
    CreateDispositivo,
    GetAllDispositivos,
    GetDispositivoByIdentificador,
    DeletarDispositivo,
    DeleteDispositivosUsuarios,
    ExisteUsuario,
    ValidarDispositivo
}