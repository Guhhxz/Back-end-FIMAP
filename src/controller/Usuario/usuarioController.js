const config_message = require('../modulo/configMensagens.js')

// Importa o DAO (Data Access Object), que é responsável por
// acessar diretamente o banco de dados e executar as operações CRUD.
const usuarioModel = require('../../../DAO/Usuario/usuarioDAO.js')

// Importação do body-parser (não está sendo utilizado diretamente neste arquivo,
// mas geralmente serve para trabalhar com requisições JSON no Node.js)
const { json } = require('body-parser')

// Criar usuário
const criarUsuario = async (req, res) => {
    try {
        const usuario = req.body

        // Verifica se email, CPF ou username já existem
        const usuarioExiste = await usuarioModel.ValidarUser(usuario)

        if (usuarioExiste) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Email, CPF ou username já cadastrado.'
            })
        }

        const id_usuario = await usuarioModel.CreateUsers(usuario)

        if (!id_usuario) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao criar usuário.'
            })
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário criado com sucesso.',
            id_usuario: id_usuario
        })
    } catch (error) {
        console.error('Erro ao criar usuário:', error)

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        })
    }
}

// Atualizar usuário
const atualizarUsuario = async (req, res) => {
    try {
        const usuario = {
            ...req.body,
            id_usuario: Number(req.params.id_usuario)
        }

        if (!Number.isInteger(usuario.id_usuario) || usuario.id_usuario <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do usuário inválido.'
            })
        }

        const usuarioAtualizado = await usuarioModel.UpdateUsers(usuario)

        if (!usuarioAtualizado) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado ou nenhum dado alterado.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso.'
        })
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        })
    }
}

// Deletar usuário
const deletarUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params

        const usuarioDeletado = await usuarioModel.DeleteUsers(id_usuario)

        if (!usuarioDeletado) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado ou ID inválido.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário deletado com sucesso.'
        })
    } catch (error) {
        console.error('Erro ao deletar usuário:', error)

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        })
    }
}

// Buscar usuário pelo username
const buscarUsuarioPorUsername = async (req, res) => {
    try {
        const { username } = req.params

        if (!username) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Username não informado.'
            })
        }

        const usuario = await usuarioModel.GetUsuarioByUsername(username)

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            })
        }

        // Não retornar a senha na resposta
        const { senha, ...usuarioSemSenha } = usuario

        return res.status(200).json({
            sucesso: true,
            usuario: usuarioSemSenha
        })
    } catch (error) {
        console.error('Erro ao buscar usuário:', error)

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        })
    }
}

// Buscar todos os usuários
const buscarTodosUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModel.GetAllUsers()

        // Não retornar as senhas dos usuários
        const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario)

        return res.status(200).json({
            sucesso: true,
            quantidade: usuariosSemSenha.length,
            usuarios: usuariosSemSenha
        })
    } catch (error) {
        console.error('Erro ao buscar usuários:', error)

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
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
