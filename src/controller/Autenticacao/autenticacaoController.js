const bcrypt = require('bcrypt')
const configMensagem = require('../modulo/configMensagens.js')
const usuarioDAO = require('../../../model/DAO/Usuario/usuarioDAO.js')
const dispositivoDAO = require('../../../model/DAO/Autenticacao/dispositivoDAO.js')
const codigoOtpDAO = require('../../../model/DAO/Autenticacao/codigo_otpDAO.js')

const validarId = (valor) => {
    const id = Number(valor)
    return Number.isInteger(id) && id > 0 ? id : null
}

const removerDispositivo = async (req, res) => {
    try {
        const idDispositivo = validarId(req.params.dispositivoId)

        if (!idDispositivo) {
            return res.status(configMensagem.ID_DISPOSITIVO_INVALIDO.status).json({
                sucesso: false,
                mensagem: configMensagem.ID_DISPOSITIVO_INVALIDO.mensagem
            })
        }

        const removido = await dispositivoDAO.DeleteDispositivo(idDispositivo)

        if (!removido) {
            return res.status(configMensagem.DISPOSITIVO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: configMensagem.DISPOSITIVO_NAO_ENCONTRADO.mensagem
            })
        }

        return res.status(204).send()
    } catch (error) {
        console.error('Erro ao remover dispositivo:', error)
        return res.status(configMensagem.ERRO_DELETAR_DISPOSITIVO.status).json({
            sucesso: false,
            mensagem: configMensagem.ERRO_DELETAR_DISPOSITIVO.mensagem
        })
    }
}

const alterarSenha = async (req, res) => {
    try {
        const { senha_atual, nova_senha } = req.body || {}

        if (!senha_atual || !nova_senha) {
            return res.status(configMensagem.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: configMensagem.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        const usuario = req.usuario || null
        if (!usuario) {
            return res.status(configMensagem.NAO_AUTENTICADO.status).json({
                sucesso: false,
                mensagem: configMensagem.NAO_AUTENTICADO.mensagem
            })
        }

        const usuarioBanco = await usuarioDAO.GetUsuarioById(usuario.id)
        if (!usuarioBanco) {
            return res.status(configMensagem.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: configMensagem.USUARIO_NAO_ENCONTRADO.mensagem
            })
        }

        const senhaValida = await bcrypt.compare(senha_atual, usuarioBanco.senha)
        if (!senhaValida) {
            return res.status(configMensagem.SENHA_ATUAL_INCORRETA.status).json({
                sucesso: false,
                mensagem: configMensagem.SENHA_ATUAL_INCORRETA.mensagem
            })
        }

        if (nova_senha.length < 8) {
            return res.status(configMensagem.SENHA_INVALIDA.status).json({
                sucesso: false,
                mensagem: configMensagem.SENHA_INVALIDA.mensagem
            })
        }

        const atualizado = await usuarioDAO.UpdateUsers({
            id_usuario: usuarioBanco.id,
            senha: nova_senha
        })

        if (!atualizado) {
            return res.status(configMensagem.ERRO_ALTERAR_SENHA.status).json({
                sucesso: false,
                mensagem: configMensagem.ERRO_ALTERAR_SENHA.mensagem
            })
        }

        return res.status(configMensagem.SENHA_ALTERADA.status).json({
            sucesso: true,
            mensagem: configMensagem.SENHA_ALTERADA.mensagem
        })
    } catch (error) {
        console.error('Erro ao alterar senha:', error)
        return res.status(configMensagem.ERRO_ALTERAR_SENHA.status).json({
            sucesso: false,
            mensagem: configMensagem.ERRO_ALTERAR_SENHA.mensagem
        })
    }
}

const solicitarRecuperacaoSenha = async (req, res) => {
    try {
        const { email } = req.body || {}

        if (!email) {
            return res.status(configMensagem.EMAIL_OBRIGATORIO.status).json({
                sucesso: false,
                mensagem: configMensagem.EMAIL_OBRIGATORIO.mensagem
            })
        }

        const usuario = await usuarioDAO.GetUsuarioByEmail(email)
        if (!usuario) {
            return res.status(202).json({
                sucesso: true,
                mensagem:
                    'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação de senha.'
            })
        }

        const codigo = String(Math.floor(100000 + Math.random() * 900000))
        const dataExpiracao = new Date(Date.now() + 15 * 60 * 1000)

        const otp = {
            codigo,
            ativo: 1,
            data_expiracao: dataExpiracao,
            id_usuario: usuario.id
        }

        await codigoOtpDAO.insertCodigoOtp(otp)

        return res.status(202).json({
            sucesso: true,
            mensagem:
                'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação de senha.'
        })
    } catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error)
        return res.status(202).json({
            sucesso: true,
            mensagem:
                'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação de senha.'
        })
    }
}

const validarCodigoRecuperacao = async (req, res) => {
    try {
        const { email, codigo } = req.body || {}

        if (!email || !codigo) {
            return res.status(configMensagem.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: configMensagem.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        const usuario = await usuarioDAO.GetUsuarioByEmail(email)
        if (!usuario) {
            return res.status(configMensagem.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: configMensagem.USUARIO_NAO_ENCONTRADO.mensagem
            })
        }

        const codigoValido = await codigoOtpDAO.validarCodigoOtp({
            id_usuario: usuario.id,
            codigo,
            ativo: 1
        })

        if (!codigoValido) {
            return res.status(configMensagem.CODIGO_OTP_INCORRETO.status).json({
                sucesso: false,
                mensagem: configMensagem.CODIGO_OTP_INCORRETO.mensagem
            })
        }

        const tokenRedefinicao = Buffer.from(`${usuario.id}:${Date.now()}`).toString('base64')

        return res.status(200).json({
            sucesso: true,
            token_redefinicao: tokenRedefinicao
        })
    } catch (error) {
        console.error('Erro ao validar código de recuperação:', error)
        return res.status(configMensagem.ERRO_VALIDAR_OTP.status).json({
            sucesso: false,
            mensagem: configMensagem.ERRO_VALIDAR_OTP.mensagem
        })
    }
}

const redefinirSenha = async (req, res) => {
    try {
        const { token_redefinicao, nova_senha } = req.body || {}

        if (!token_redefinicao || !nova_senha) {
            return res.status(configMensagem.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: configMensagem.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        if (nova_senha.length < 8) {
            return res.status(configMensagem.SENHA_INVALIDA.status).json({
                sucesso: false,
                mensagem: configMensagem.SENHA_INVALIDA.mensagem
            })
        }

        let usuarioId = null
        try {
            const decoded = Buffer.from(token_redefinicao, 'base64').toString('utf8')
            usuarioId = Number(decoded.split(':')[0])
        } catch (error) {
            return res.status(configMensagem.CODIGO_OTP_EXPIRADO.status).json({
                sucesso: false,
                mensagem: configMensagem.CODIGO_OTP_EXPIRADO.mensagem
            })
        }

        if (!usuarioId || !Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(configMensagem.CODIGO_OTP_EXPIRADO.status).json({
                sucesso: false,
                mensagem: configMensagem.CODIGO_OTP_EXPIRADO.mensagem
            })
        }

        const usuario = await usuarioDAO.GetUsuarioById(usuarioId)
        if (!usuario) {
            return res.status(configMensagem.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: configMensagem.USUARIO_NAO_ENCONTRADO.mensagem
            })
        }

        const atualizado = await usuarioDAO.UpdateUsers({
            id_usuario: usuario.id,
            senha: nova_senha
        })

        if (!atualizado) {
            return res.status(configMensagem.ERRO_ALTERAR_SENHA.status).json({
                sucesso: false,
                mensagem: configMensagem.ERRO_ALTERAR_SENHA.mensagem
            })
        }

        return res.status(configMensagem.SENHA_ALTERADA.status).json({
            sucesso: true,
            mensagem: configMensagem.SENHA_ALTERADA.mensagem
        })
    } catch (error) {
        console.error('Erro ao redefinir senha:', error)
        return res.status(configMensagem.ERRO_ALTERAR_SENHA.status).json({
            sucesso: false,
            mensagem: configMensagem.ERRO_ALTERAR_SENHA.mensagem
        })
    }
}

module.exports = {
    removerDispositivo,
    alterarSenha,
    solicitarRecuperacaoSenha,
    validarCodigoRecuperacao,
    redefinirSenha
}
