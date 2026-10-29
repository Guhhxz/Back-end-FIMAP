// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')
const bcrypt = require('bcrypt')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

// Buscar usuário por id
const GetUsuarioById = async (id_usuario) => {
    let sql = `select * from tbl_usuario where id = ?`

    try {
        let result = await knexConex.raw(sql, [id_usuario])
        return result ? result[0][0] || null : null
    } catch (error) {
        console.error('Erro ao buscar usuário por id:', error)
        return null
    }
}

// Buscar usuário por e-mail
const GetUsuarioByEmail = async (email) => {
    let sql = `select * from tbl_usuario where email = ?`

    try {
        let result = await knexConex.raw(sql, [email])
        return result ? result[0][0] || null : null
    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error)
        return null
    }
}

// Criar usuário
const CreateUsers = async (usuario) => {
    let sql = `insert into tbl_usuario
        (nome, cpf, email, username, senha, xp_usuario, nivel_total,
        foto_perfil, nome_exibicao, username_social, biografia_social,
        localizacao_estado, visibilidade)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    try {
        // Criptografar a senha antes de salvar no banco
        const senhaHash = await bcrypt.hash(usuario.senha, 10)

        let result = await knexConex.raw(sql, [
            usuario.nome,
            usuario.cpf,
            usuario.email,
            usuario.username,
            senhaHash,
            usuario.xp_usuario,
            usuario.nivel_total,
            usuario.foto_perfil,
            usuario.nome_exibicao,
            usuario.username_social,
            usuario.biografia_social,
            usuario.localizacao_estado,
            usuario.visibilidade
        ])

        if (result) return result[0].insertId
    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        return false
    }
}

// Atualizar usuário
const UpdateUsers = async (usuario) => {
    let sqlSenha = `update tbl_usuario
    set senha = ?
    where id = ?`

    try {
        // Atualizar a senha separadamente, caso ela tenha sido enviada
        if (usuario.senha !== undefined) {
            const senhaHash = await bcrypt.hash(usuario.senha, 10)

            let resultSenha = await knexConex.raw(sqlSenha, [senhaHash, usuario.id_usuario])

            if (resultSenha[0].affectedRows === 0) {
                return false
            }
        }

        // Atualizar os demais campos enviados
        const campos = {
            nome: usuario.nome,
            cpf: usuario.cpf,
            email: usuario.email,
            username: usuario.username,
            xp_usuario: usuario.xp_usuario,
            nivel_total: usuario.nivel_total,
            foto_perfil: usuario.foto_perfil,
            nome_exibicao: usuario.nome_exibicao ?? usuario.nome_exibido,
            username_social: usuario.username_social,
            biografia_social: usuario.biografia_social ?? usuario.biografia,
            localizacao_estado: usuario.localizacao_estado,
            visibilidade: usuario.visibilidade
        }

        const atualizacoes = []
        const valores = []

        Object.entries(campos).forEach(([campo, valor]) => {
            if (valor !== undefined) {
                atualizacoes.push(`${campo} = ?`)
                valores.push(valor)
            }
        })

        if (atualizacoes.length === 0) {
            return usuario.senha !== undefined
        }

        let sql = `update tbl_usuario
            set ${atualizacoes.join(', ')}
            where id = ?`

        valores.push(usuario.id_usuario)

        let result = await knexConex.raw(sql, valores)

        if (result) return result[0].affectedRows > 0
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        return false
    }
}

// Deletar usuário
const DeleteUsers = async (id_usuario) => {
    let sql = `delete from tbl_usuario
        where id = ?`

    try {
        let result = await knexConex.raw(sql, [id_usuario])

        if (result) return result[0].affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar usuário:', error)
        return false
    }
}

// Buscar usuário pelo username
const GetUsuarioByUsername = async (username) => {
    let sql = `select * from tbl_usuario
        where username = ?`

    try {
        let result = await knexConex.raw(sql, [username])

        if (result) return result[0][0] || null
    } catch (error) {
        console.error('Erro ao buscar usuário por username:', error)
        return false
    }
}

// Buscar todos os usuários
const GetAllUsers = async () => {
    let sql = `select id, nome, cpf, email, username, xp_usuario,
        nivel_total, foto_perfil, nome_exibicao, username_social,
        biografia_social, localizacao_estado, visibilidade
        from tbl_usuario`

    try {
        let result = await knexConex.raw(sql)

        if (result) return result[0]
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error)
        return false
    }
}

// Verificar se email, CPF ou username já existem
const ValidarUser = async (usuario) => {
    try {
        const condicoes = []
        const valores = []

        if (usuario.email) {
            condicoes.push('email = ?')
            valores.push(usuario.email)
        }

        if (usuario.cpf) {
            condicoes.push('cpf = ?')
            valores.push(usuario.cpf)
        }

        if (usuario.username) {
            condicoes.push('username = ?')
            valores.push(usuario.username)
        }

        if (condicoes.length === 0) {
            return false
        }

        let sql = `select id from tbl_usuario
            where ${condicoes.join(' or ')}`

        let result = await knexConex.raw(sql, valores)

        if (result) return result[0].length > 0
    } catch (error) {
        console.error('Erro ao validar usuário:', error)
        return false
    }
}

// Validar senha no login
const ValidarSenha = async (senhaDigitada, senhaHash) => {
    try {
        return await bcrypt.compare(senhaDigitada, senhaHash)
    } catch (error) {
        console.error('Erro ao validar senha:', error)
        return false
    }
}

module.exports = {
    GetUsuarioById,
    GetUsuarioByEmail,
    CreateUsers,
    UpdateUsers,
    DeleteUsers,
    GetUsuarioByUsername,
    GetAllUsers,
    ValidarUser,
    ValidarSenha
}
