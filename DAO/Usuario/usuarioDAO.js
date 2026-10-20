// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../database_config_knex/knexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

const CreateUsers = async (usuario) => {
    try {

        let sql =`insert into tbl_usuario (nome, cpf, email, username, senha, xp_usuario, nivel_total, foto_perfil, nome_exibido, username_social, biografia,social, localizacao_estado, visibilidade)
          values( 
            '${usuario.nome}',
                '${usuario.cpf}',
                '${usuario.email}',
                '${usuario.username}',
                '${usuario.senha}',
                '${usuario.xp_usuario}',
                '${usuario.nivel_total}',
                '${usuario.foto_perfil}',
                '${usuario.nome_exibido}',
                '${usuario.username_social}',
                '${usuario.biografia}',
                '${usuario.social}',
                '${usuario.localizacao_estado}',
                '${usuario.visibilidade}'
        );`

        let result = knexConex.raw(sql)

        if(result) 
            return result[0].insertId
            
        else 
            return false


    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        console.log(error)
        return false
    }
}

const UpdateUsers = async (usuario) => {
    try {
        let sql = `update tbl_usuario set 
            nome = '${usuario.nome}',
            cpf = '${usuario.cpf}',
            email = '${usuario.email}',
            username = '${usuario.username}',
            senha = '${usuario.senha}',
            xp_usuario = '${usuario.xp_usuario}',
            nivel_total = '${usuario.nivel_total}',
            foto_perfil = '${usuario.foto_perfil}',
            nome_exibido = '${usuario.nome_exibido}',
            username_social = '${usuario.username_social}',
            biografia = '${usuario.biografia}',
            social = '${usuario.social}',
            localizacao_estado = '${usuario.localizacao_estado}',
            visibilidade = '${usuario.visibilidade}'
        where id_usuario = ${usuario.id_usuario};`

        let result = knexConex.raw(sql)

        if(result) 
            return true
            
        else 
            return false

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        console.log(error)
        return false
    }
}

const DeleteUsers = async (id_usuario) => {
    try {
        if(id_usuario != 0 || typeof id_usuario != "string" || id_usuario != null){

            let sql = `delete from tbl_usuario where id_usuario = ${id_usuario};`

            let result = knexConex.raw(sql)
    
            if(result) 
                return true
                
            else 
                return false

        }
        else
            return false
       

    } catch (error) {
        console.error('Erro ao deletar usuário:', error)
        console.log(error)
        return false
    }
}

const GetUsuarioByUsername = async (username) => {
    try {
        let sql = `select * from tbl_usuario where username = '${username}';`

        let result = await knexConex.raw(sql)

        if(result[0].length > 0) 
            return result[0][0]
            
        else 
            return null

    } catch (error) {
        console.error('Erro ao buscar usuário por username:', error)
        console.log(error)
        return null
    }
}

const GetAllUsers = async () => {
    try {
        let sql = `select * from tbl_usuario;`

        let result = await knexConex.raw(sql)

        if(result[0].length > 0) 
            return result[0]
            
        else 
            return []

    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error)
        console.log(error)
        return []
    }
}

module.exports = {
    CreateUsers,
    UpdateUsers,
    DeleteUsers,
    GetUsuarioByUsername,
    GetAllUsers
}