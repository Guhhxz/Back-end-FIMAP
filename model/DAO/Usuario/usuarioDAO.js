
const knex = require('knex')
const brycrypt = require('bcrypt')

// Import do arquivo de configuração do banco de dados
const knexConfig = require('../../Database_config_knex/KnexFile.js')

const knexConex = knex(knexConfig.development)

// Criar usuário
const CreateUsers = async (usuario) => {
    try {
        const senhaHash = await brycrypt.hash(usuario.senha, 10)

        const [id] = await knexConex('tbl_usuario').insert({
            nome: usuario.nome,
            cpf: usuario.cpf,
            email: usuario.email,
            username: usuario.username,
            senha: senhaHash,
            xp_usuario: usuario.xp_usuario,
            nivel_total: usuario.nivel_total,
            foto_perfil: usuario.foto_perfil,
            nome_exibicao: usuario.nome_exibicao,
            username_social: usuario.username_social,
            biografia_social: usuario.biografia_social,
            localizacao_estado: usuario.localizacao_estado,
            visibilidade: usuario.visibilidade
        })

        return id
    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        return false
    }
}

// Atualizar usuário
const UpdateUsers = async (usuario) => {
    try {
        const camposPermitidos = [
            'nome',
            'cpf',
            'email',
            'username',
            'senha',
            'xp_usuario',
            'nivel_total',
            'foto_perfil',
            'nome_exibicao',
            'username_social',
            'biografia_social',
            'localizacao_estado',
            'visibilidade'
        ]

        const dadosAtualizados = {}

        camposPermitidos.forEach((campo) => {
            if (usuario[campo] !== undefined) {
                dadosAtualizados[campo] = usuario[campo]
            }
        })

        // Compatibilidade com nomes alternativos
        if (dadosAtualizados.nome_exibicao === undefined) {
            if (usuario.nome_exibido !== undefined) {
                dadosAtualizados.nome_exibicao = usuario.nome_exibido
            }
        }

        if (dadosAtualizados.biografia_social === undefined) {
            if (usuario.biografia !== undefined) {
                dadosAtualizados.biografia_social = usuario.biografia
            }
        }

        if (Object.keys(dadosAtualizados).length === 0) {
            return false
        }

        const resultado = await knexConex('tbl_usuario')
            .where('id', usuario.id_usuario)
            .update(dadosAtualizados)

        return resultado > 0
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        throw error
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
            .where('id', id)
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
        return await knexConex('tbl_usuario')
            .select(
                'id',
                'nome',
                'cpf',
                'email',
                'username',
                'xp_usuario',
                'nivel_total',
                'foto_perfil',
                'nome_exibicao',
                'username_social',
                'biografia_social',
                'localizacao_estado',
                'visibilidade'
            )
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error)
        return []
    }
}

// Verificar se email, CPF ou username já existem
const ValidarUser = async (usuario) => {
    try {
        const consulta = knexConex('tbl_usuario')
            .where('email', usuario.email)

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
