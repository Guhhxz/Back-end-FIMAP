const config_message = require('../modulo/configMensagens.js')
const crypto = require('crypto')
const codigoOTPModel = require('../../../model/DAO/condigo_OTP/codigo_otp_DAO.js')
const usuarioModel = require('../../../model/DAO/Usuario/usuarioDAO.js')
const { enviarOTP } = require('../../config/email.js')

const OTP_VALIDADE_MS = 5 * 60 * 1000

// Gera OTP de 6 dígitos
const gerarCodigo = () => crypto.randomInt(100000, 1000000).toString()

// Remove o usuário recém-criado (o OTP some junto por causa do ON DELETE CASCADE)
const desfazerCriacaoUsuario = async (id_usuario) => {
    try {
        await usuarioModel.DeleteUsers(id_usuario)
    } catch (erroRollback) {
        console.error('Erro ao desfazer criação do usuário:', erroRollback)
    }
}

// Cria o usuário, depois o OTP, e envia por e-mail.
// Se o OTP não for criado ou enviado, o usuário é apagado.
const criarCodigoOTPUsuario = async (req, res) => {
    let id_usuario = null

    try {
        const usuario = req.body

        if (!usuario || !usuario.email || !usuario.senha) {
            return res.status(config_message.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: config_message.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        const usuarioExiste = await usuarioModel.ValidarUser(usuario)

        if (usuarioExiste) {
            return res.status(config_message.DADOS_USUARIO_EXISTENTES.status).json({
                sucesso: false,
                mensagem: config_message.DADOS_USUARIO_EXISTENTES.mensagem
            })
        }

        // 1. cria o usuário primeiro
        id_usuario = await usuarioModel.CreateUsers(usuario)

        if (!id_usuario) {
            return res.status(config_message.ERRO_CRIAR_USUARIO.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_CRIAR_USUARIO.mensagem
            })
        }

        // 2. cria o código ligado ao usuário
        const codigo = gerarCodigo()

        const id_codigo_otp = await codigoOTPModel.CreateCodigoOTP({
            codigo,
            data_expiracao: new Date(Date.now() + OTP_VALIDADE_MS),
            id_usuario
        })

        if (!id_codigo_otp) {
            await desfazerCriacaoUsuario(id_usuario)

            return res.status(config_message.ERRO_GERAR_OTP.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_GERAR_OTP.mensagem
            })
        }

        // 3. envia o e-mail; se falhar, apaga o usuário também
        try {
            await enviarOTP(usuario.email, codigo)
        } catch (erroEmail) {
            console.error('Erro ao enviar OTP:', erroEmail)

            await desfazerCriacaoUsuario(id_usuario)

            return res.status(config_message.ERRO_ENVIAR_OTP.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_ENVIAR_OTP.mensagem
            })
        }

        return res.status(config_message.USUARIO_CRIADO.status).json({
            sucesso: true,
            mensagem: 'Usuário criado. Verifique seu e-mail para obter o código OTP.',
            id_usuario
        })
    } catch (error) {
        console.error('Erro ao criar usuário:', error)

        if (id_usuario) {
            await desfazerCriacaoUsuario(id_usuario)
        }

        return res.status(config_message.ERRO_CRIAR_USUARIO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_CRIAR_USUARIO.mensagem
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

        const usuarioAtualizado = await usuarioModel.UpdateUsers({ ...usuario, id_usuario })

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
    criarCodigoOTPUsuario,
    atualizarUsuario,
    deletarUsuario,
    buscarUsuarioPorUsername,
    buscarTodosUsuarios
}
