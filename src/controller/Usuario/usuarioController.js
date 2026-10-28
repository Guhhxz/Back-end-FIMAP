
const config_message = require('../modulo/configMensagens.js')
const crypto = require('crypto')
const codigoOTPModel = require('../../../model/DAO/condigo_OTP/codigo_otp_DAO.js')
const usuarioModel = require('../../../model/DAO/Usuario/usuarioDAO.js')
const { enviarOTP } = require('../../config/email.js')

// Criar usuário
const criarUsuario = async (req, res) => {
    try {
        const usuario = req.body

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

        // Gera OTP de 6 dígitos, válido por 5 minutos
        const codigo = crypto.randomInt(100000, 1000000).toString()

        const otpCriado = await codigoOTPModel.CreateCodigoOTP({
            codigo,
            ativo: true,
            data_expiracao: new Date(Date.now() + 5 * 60 * 1000),
            id_usuario
        })

        if (!otpCriado) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Usuário criado, mas ocorreu um erro ao gerar o OTP.'
            })
        }

        // Envia o código para o e-mail informado no cadastro
        await enviarOTP(usuario.email, codigo)

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário criado. Verifique seu e-mail para obter o código OTP.',
            id_usuario
        })
    } catch (error) {
        console.error('Erro ao criar usuário ou enviar OTP:', error)

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Ocorreu um erro ao criar o usuário ou enviar o código OTP.'
        })
    }
}

// Atualizar usuário
const atualizarUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const usuario = req.body

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        const usuarioAtualizado = await usuarioModel.UpdateUsers(id_usuario, usuario)

        if (!usuarioAtualizado) {
            return res.status(config_message.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: config_message.USUARIO_NAO_ENCONTRADO.mensagem
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
            mensagem: 'Erro ao atualizar usuário.'
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
