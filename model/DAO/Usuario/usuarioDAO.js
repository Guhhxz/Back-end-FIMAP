const knex = require('knex')
// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco

const knexConfig = require('../../Database_config_knex/KnexFile.js')

const knexConex = knex(knexConfig.development)

// Criar usuário
const CreateUsers = async (usuario) => {
    try {
        const [id_usuario] = await knexConex('tbl_usuario').insert({
            nome: usuario.nome,
            cpf: usuario.cpf,
            email: usuario.email,
            username: usuario.username,
            senha: usuario.senha,
            xp_usuario: usuario.xp_usuario ?? 0,
            nivel_total: usuario.nivel_total ?? 1,
            foto_perfil: usuario.foto_perfil ?? null,
            nome_exibido: usuario.nome_exibido ?? null,
            username_social: usuario.username_social ?? null,
            biografia: usuario.biografia ?? null,
            social: usuario.social ?? null,
            localizacao_estado: usuario.localizacao_estado ?? null,
            visibilidade: usuario.visibilidade ?? 1
        })

        return id_usuario
    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        return false
    }
}

// Atualizar usuário
const UpdateUsers = async (usuario) => {
    try {
        const resultado = await knexConex('tbl_usuario')
            .where('id_usuario', usuario.id_usuario)
            .update({
                nome: usuario.nome,
                cpf: usuario.cpf,
                email: usuario.email,
                username: usuario.username,
                senha: usuario.senha,
                xp_usuario: usuario.xp_usuario,
                nivel_total: usuario.nivel_total,
                foto_perfil: usuario.foto_perfil,
                nome_exibido: usuario.nome_exibido,
                username_social: usuario.username_social,
                biografia: usuario.biografia,
                social: usuario.social,
                localizacao_estado: usuario.localizacao_estado,
                visibilidade: usuario.visibilidade
            })

        return resultado > 0
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        return false
    }
}

// Deletar usuário
const DeleteUsers = async (id_usuario) => {
    try {
        const id = Number(id_usuario)

        if (!Number.isInteger(id) || id <= 0) {
            return false
        }

        const resultado = await knexConex('tbl_usuario')
            .where('id_usuario', id)
            .del()

        return resultado > 0
    } catch (error) {
        console.error('Erro ao deletar usuário:', error)
        return false
    }
}

// Buscar usuário pelo username
const GetUsuarioByUsername = async (username) => {
    try {
        const usuario = await knexConex('tbl_usuario')
            .where('username', username)
            .first()

        return usuario || null
    } catch (error) {
        console.error('Erro ao buscar usuário por username:', error)
        return null
    }
}

// Buscar todos os usuários
const GetAllUsers = async () => {
    try {
        return await knexConex('tbl_usuario').select('*')
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error)
        return []
    }
}

// Verificar se email, CPF ou username já existem
const ValidarUser = async (usuario) => {
    try {
        const consulta = knexConex('tbl_usuario')

        consulta.where('email', usuario.email)

        if (usuario.cpf) {
            consulta.orWhere('cpf', usuario.cpf)
        }

        if (usuario.username) {
            consulta.orWhere('username', usuario.username)
        }

        const resultado = await consulta.first()

        return Boolean(resultado)
    } catch (error) {
        console.error('Erro ao validar usuário:', error)
        throw error
    }
}

module.exports = {
    CreateUsers,
    UpdateUsers,
    DeleteUsers,
    GetUsuarioByUsername,
    GetAllUsers,
    ValidarUser
}
