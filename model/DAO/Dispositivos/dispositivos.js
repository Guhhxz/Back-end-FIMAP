const knex = require('knex')

const knexConfig = require('../../Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// Criar dispositivo (recebe o objeto montado na controller)
const CreateDispositivo = async (dispositivo) => {
    let sql = `insert into tbl_dispositivo
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

// Buscar todos os dispositivos
const GetAllDispositivos = async () => {
    let sql = `select * from tbl_dispositivo`

    try {
        const [result] = await knexConex.raw(sql)
        return result

    } catch (error) {
        console.error('Erro ao buscar dispositivos:', error)
        return false
    }
}

const DeleteDispositivosUsuarios = async (id_usuario) => {
    let sql = `delete from tbl_dispositivo where id_usuario = ?`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])
        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar dispositivos do usuário:', error)
        return false
    }
}


// Verificar se o usuário existe
const ExisteUsuario = async (id_usuario) => {
    let sql = `select id from tbl_usuario where id = ?`

    try {
        const [result] = await knexConex.raw(sql, [id_usuario])
        return result.length > 0

    } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        return false
    }
}

// Validar se o dispositivo já existe para o usuário
const ValidarDispositivo = async (dispositivo) => {
    try {
        const condicao = []
        const valores = []

        if (dispositivo.identificador) {
            condicao.push('identificador = ?')
            valores.push(dispositivo.identificador)
        }

        if (dispositivo.id_usuario) {
            condicao.push('id_usuario = ?')
            valores.push(dispositivo.id_usuario)
        }

        if (condicao.length === 0) {
            return false
        }

        let sql = `select id from tbl_dispositivo
            where ${condicao.join(' AND ')}`

        const [result] = await knexConex.raw(sql, valores)

        return result.length > 0

    } catch (error) {
        console.error('Erro ao validar dispositivo:', error)
        return false
    }
}

const DeletarDispositivo = async (id_dispositivo) => {
    let sql = `delete from tbl_dispositivo where id = ?`   

 try {
        const [result] = await knexConex.raw(sql, [id_dispositivo])
        return result.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar dispositivo:', error)
        return false
    }
}

module.exports = {
    CreateDispositivo,
    GetAllDispositivos,
    ExisteUsuario,
    ValidarDispositivo,
    DeletarDispositivo
}