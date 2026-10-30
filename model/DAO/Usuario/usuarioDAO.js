// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')
const bcrypt = require('bcrypt')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

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
    try {
        // Objeto base com todos os campos que podem ser atualizados
        const campos = {
            nome: usuario.nome,
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

        // Se a senha foi enviada, faz o hash e adiciona aos campos a atualizar
        if (usuario.senha !== undefined && usuario.senha !== '') {
            const senhaHash = await bcrypt.hash(usuario.senha, 10)
            campos.senha = senhaHash
        }

        const atualizacoes = []
        const valores = []

        // Filtra apenas os campos que foram enviados (não são undefined)
        Object.entries(campos).forEach(([campo, valor]) => {
            if (valor !== undefined) {
                atualizacoes.push(`${campo} = ?`)
                valores.push(valor)
            }
        })

        // Se nenhum campo foi enviado para atualizar
        if (atualizacoes.length === 0) {
            return false
        }

        // Monta a query dinamicamente
        let sql = `update tbl_usuario set ${atualizacoes.join(', ')} where id = ?`
        valores.push(usuario.id_usuario)

        let result = await knexConex.raw(sql, valores)

        // Compatibilidade de retorno com MySQL/MariaDB ou PostgreSQL
        const afetados = result[0]?.affectedRows ?? result.rowCount ?? 0
        return afetados > 0

    } catch (error) {
        console.error('Erro ao atualizar todos os dados do usuário:', error)
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

        if  (usuario.cpf) {
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

// Buscar usuário pelo ID
const GetUsuarioById = async (id_usuario) => {
    let sql = `select * from tbl_usuario
        where id = ?`

    try {
        let result = await knexConex.raw(sql, [id_usuario])

        if (result) return result[0][0] || null

    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error)
        return false
    }
}

// Buscar usuário pelo email
const GetUsuarioByEmail = async (email) => {
    let sql = `select * from tbl_usuario
        where email = ?`

    try {
        let result = await knexConex.raw(sql, [email])

        if (result) return result[0][0] || null

    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error)
        return false
    }
}

module.exports = {
    CreateUsers,
    UpdateUsers,
    DeleteUsers,
    GetUsuarioByUsername,
    GetAllUsers,
    ValidarUser,
    ValidarSenha,
    GetUsuarioById,
    GetUsuarioByEmail
}
