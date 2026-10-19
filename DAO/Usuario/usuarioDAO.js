// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../database_config_knex/knexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

const CreateUsuario = async (usuario) => {
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