const config_message = require('../modulo/configMensagens.js')

// Importa o DAO responsável pelo acesso ao banco de dados.
const usuarioModel = require('../../../model/DAO/Usuario/usuarioDAO.js')

// Criar usuário
const criarUsuario = async (req, res) => {
    try {
        const usuario = req.body

        // Verifica se email, CPF ou username já existem.
        const usuarioExiste = await usuarioModel.ValidarUser(usuario)

        if (usuarioExiste) {
            return res.status(config_message.DADOS_USUARIO_EXISTENTES.status).json({
                sucesso: false,
                mensagem: config_message.DADOS_USUARIO_EXISTENTES.mensagem
            })
        }

        const id_usuario = await usuarioModel.CreateUsers(usuario)

        if (!id_usuario) {
            return res.status(config_message.ERRO_CRIAR_USUARIO.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_CRIAR_USUARIO.mensagem
            })
        }

        return res.status(config_message.USUARIO_CRIADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_CRIADO.mensagem,
            id_usuario
        })
    } catch (error) {
        console.error('Erro ao criar usuário:', error)

        return res.status(config_message.ERRO_INTERNO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_INTERNO.mensagem
        })
    }
}

// Atualizar usuário
const atualizarUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(config_message.NENHUM_CAMPO_ATUALIZAR.status).json({
                sucesso: false,
                mensagem: config_message.NENHUM_CAMPO_ATUALIZAR.mensagem
            })
        }

        const usuario = {
            ...req.body,
            id_usuario
        }

        const usuarioAtualizado = await usuarioModel.UpdateUsers(usuario)

        if (!usuarioAtualizado) {
            return res.status(config_message.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: config_message.USUARIO_NAO_ENCONTRADO.mensagem
            })
        }

        return res.status(config_message.USUARIO_ATUALIZADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_ATUALIZADO.mensagem
        })
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)

        return res.status(config_message.ERRO_ATUALIZAR_USUARIO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_ATUALIZAR_USUARIO.mensagem
        })
    }
}

// Deletar usuário
const deletarUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        const usuarioDeletado = await usuarioModel.DeleteUsers(id_usuario)

        if (!usuarioDeletado) {
            return res.status(config_message.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: config_message.USUARIO_NAO_ENCONTRADO.mensagem
            })
        }

        return res.status(config_message.USUARIO_DELETADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_DELETADO.mensagem
        })
    } catch (error) {
        console.error('Erro ao deletar usuário:', error)

        return res.status(config_message.ERRO_DELETAR_USUARIO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_DELETAR_USUARIO.mensagem
        })
    }
}

// Buscar usuário pelo username
const buscarUsuarioPorUsername = async (req, res) => {
    try {
        const { username } = req.params

        if (!username) {
            return res.status(config_message.USERNAME_OBRIGATORIO.status).json({
                sucesso: false,
                mensagem: config_message.USERNAME_OBRIGATORIO.mensagem
            })
        }

        const usuario = await usuarioModel.GetUsuarioByUsername(username)

        if (!usuario) {
            return res.status(config_message.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: config_message.USUARIO_NAO_ENCONTRADO.mensagem
            })
        }

        // Não retorna a senha na resposta.
        const { senha, ...usuarioSemSenha } = usuario

        return res.status(config_message.USUARIO_ENCONTRADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_ENCONTRADO.mensagem,
            usuario: usuarioSemSenha
        })
    } catch (error) {
        console.error('Erro ao buscar usuário:', error)

        return res.status(config_message.ERRO_BUSCAR_USUARIO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_BUSCAR_USUARIO.mensagem
        })
    }
}

// Buscar todos os usuários
const buscarTodosUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModel.GetAllUsers()

        // Não retorna as senhas dos usuários.
        const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario)

        return res.status(config_message.USUARIOS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.USUARIOS_ENCONTRADOS.mensagem,
            quantidade: usuariosSemSenha.length,
            usuarios: usuariosSemSenha
        })
    } catch (error) {
        console.error('Erro ao buscar usuários:', error)

        return res.status(config_message.ERRO_BUSCAR_USUARIOS.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_BUSCAR_USUARIOS.mensagem
        })
    }
}

module.exports = {
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
    buscarUsuarioPorUsername,
    buscarTodosUsuarios
}