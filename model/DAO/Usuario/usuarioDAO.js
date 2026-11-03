// Import da biblioteca knex, utilizada para facilitar a comunicação com o banco de dados MySQL
const knex = require('knex')
const bcrypt = require('bcrypt')

// Import do arquivo de configuração que contém as credenciais e parâmetros de conexão com o banco
const knexConfig = require('../../Database_config_knex/KnexFile.js')

// Cria a conexão com o banco de dados utilizando as configurações do ambiente "development"
const knexConex = knex(knexConfig.development)

const SALT_ROUNDS = 10

// IMPORTANTE: o hash da senha é feito SOMENTE aqui no DAO.
// Quem chama CreateUsers/UpdateUsers deve enviar a senha em texto puro.

// Criar usuário
const CreateUsers = async (usuario) => {
    const sql = `insert into tbl_usuario
        (nome, cpf, email, username, senha, xp_usuario, nivel_total,
        foto_perfil, nome_exibicao, username_social, biografia_social,
        localizacao_estado, visibilidade)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    try {
        const senhaHash = await bcrypt.hash(String(usuario.senha), SALT_ROUNDS)

        const result = await knexConex.raw(sql, [
            usuario.nome ?? null,
            usuario.cpf ?? null,
            usuario.email,
            usuario.username ?? null,
            senhaHash,
            usuario.xp_usuario ?? 0,
            usuario.nivel_total ?? 1,
            usuario.foto_perfil ?? null,
            usuario.nome_exibicao ?? null,
            usuario.username_social ?? null,
            usuario.biografia_social ?? null,
            usuario.localizacao_estado ?? null,
            usuario.visibilidade ?? null
        ])

        return result?.[0]?.insertId || false
    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        return false
    }
}

// Atualizar usuário (somente os campos enviados)
const UpdateUsers = async (usuario) => {
    try {
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

        // Senha em texto puro entra aqui e é hasheada uma única vez
        if (usuario.senha !== undefined && usuario.senha !== '') {
            campos.senha = await bcrypt.hash(String(usuario.senha), SALT_ROUNDS)
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
            return false
        }

        // Nomes das colunas vêm do objeto fixo acima, nunca do cliente
        const sql = `update tbl_usuario set ${atualizacoes.join(', ')} where id = ?`
        valores.push(usuario.id_usuario)

        const result = await knexConex.raw(sql, valores)

        const afetados = result?.[0]?.affectedRows ?? result?.rowCount ?? 0
        return afetados > 0
    } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error)
        return false
    }
}

// Deletar usuário
const DeleteUsers = async (id_usuario) => {
    const sql = `delete from tbl_usuario where id = ?`

    try {
        const result = await knexConex.raw(sql, [id_usuario])
        return result?.[0]?.affectedRows > 0
    } catch (error) {
        console.error('Erro ao deletar usuário:', error)
        return false
    }
}

// Buscar usuário pelo username
const GetUsuarioByUsername = async (username) => {
    const sql = `select * from tbl_usuario where username = ?`

    try {
        const result = await knexConex.raw(sql, [username])
        return result?.[0]?.[0] || null
    } catch (error) {
        console.error('Erro ao buscar usuário por username:', error)
        return null
    }
}

// Buscar todos os usuários (sem a senha)
const GetAllUsers = async () => {
    const sql = `select id, nome, cpf, email, username, xp_usuario,
        nivel_total, foto_perfil, nome_exibicao, username_social,
        biografia_social, localizacao_estado, visibilidade
        from tbl_usuario`

    try {
        const result = await knexConex.raw(sql)
        return result?.[0] || []
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error)
        return false
    }
}

// Verificar se email, CPF ou username já existem
const ValidarUser = async (usuario) => {
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

    const sql = `select id from tbl_usuario where ${condicoes.join(' or ')}`

    try {
        const result = await knexConex.raw(sql, valores)
        return result[0].length > 0
    } catch (error) {
        console.error('Erro ao validar usuário:', error)
        // Propaga: retornar false significaria "não existe duplicado"
        throw error
    }
}

// Validar senha no login
const ValidarSenha = async (senhaDigitada, senhaHash) => {
    try {
        return await bcrypt.compare(String(senhaDigitada), senhaHash)
    } catch (error) {
        console.error('Erro ao validar senha:', error)
        return false
    }
}

// Buscar usuário pelo ID
const GetUsuarioById = async (id_usuario) => {
    const sql = `select * from tbl_usuario where id = ?`

    try {
        const result = await knexConex.raw(sql, [id_usuario])
        return result?.[0]?.[0] || null
    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error)
        return null
    }
}

// Buscar usuário pelo email
const GetUsuarioByEmail = async (email) => {
    const sql = `select * from tbl_usuario where email = ?`

    try {
        const result = await knexConex.raw(sql, [email])
        return result?.[0]?.[0] || null
    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error)
        return null
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