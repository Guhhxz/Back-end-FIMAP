const config_message = require('../modulo/configMensagens.js')
const crypto = require('crypto')
const usuarioModel = require('../../../model/DAO/Usuario/usuarioDAO.js')
const { enviarOTP } = require('../../config/email.js')

const OTP_VALIDADE_MS = 5 * 60 * 1000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Segredo usado para assinar a "chave" enviada ao cliente (defina OTP_SECRET no .env)
const OTP_SECRET = process.env.OTP_SECRET

if (!OTP_SECRET) {
    console.warn('ATENÇÃO: defina OTP_SECRET no .env, senão o cadastro com OTP não funciona.')
}

// Gera OTP de 6 dígitos
const gerarCodigo = () => crypto.randomInt(100000, 1000000).toString()

// Assinatura que depende do código: só quem tem o código certo reproduz a assinatura
const assinar = (payload, codigo) =>
    crypto.createHmac('sha256', OTP_SECRET).update(`${payload}:${codigo}`).digest('base64url')

// Gera a chave (token) devolvida ao cliente: dados do e-mail + validade + assinatura
const gerarChave = (email, codigo) => {
    const payload = Buffer.from(JSON.stringify({
        email: email.toLowerCase(),
        exp: Date.now() + OTP_VALIDADE_MS
    })).toString('base64url')

    return `${payload}.${assinar(payload, codigo)}`
}

// Confere chave + código + e-mail. Retorna { ok: true } ou { ok: false, motivo }
const validarChave = (chave, codigo, email) => {
    try {
        const [payload, assinatura] = String(chave).split('.')

        if (!payload || !assinatura) {
            return { ok: false, motivo: 'invalido' }
        }

        const esperada = Buffer.from(assinar(payload, String(codigo)))
        const recebida = Buffer.from(assinatura)

        if (esperada.length !== recebida.length || !crypto.timingSafeEqual(esperada, recebida)) {
            return { ok: false, motivo: 'invalido' }
        }

        const dados = JSON.parse(Buffer.from(payload, 'base64url').toString())

        if (Date.now() > dados.exp) {
            return { ok: false, motivo: 'expirado' }
        }

        if (dados.email !== String(email).toLowerCase()) {
            return { ok: false, motivo: 'invalido' }
        }

        return { ok: true }
    } catch (error) {
        return { ok: false, motivo: 'invalido' }
    }
}

// ETAPA 1: cria o código, envia por e-mail e devolve a chave. Body: { email }
const criarCodigoOTP = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(config_message.EMAIL_OBRIGATORIO.status).json({
                sucesso: false,
                mensagem: config_message.EMAIL_OBRIGATORIO.mensagem
            })
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(config_message.EMAIL_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.EMAIL_INVALIDO.mensagem
            })
        }

        if (!OTP_SECRET) {
            return res.status(config_message.ERRO_GERAR_OTP.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_GERAR_OTP.mensagem
            })
        }

        const codigo = gerarCodigo()
        const chave = gerarChave(email, codigo)

        try {
            await enviarOTP(email, codigo)
        } catch (erroEmail) {
            console.error('Erro ao enviar OTP:', erroEmail)

            return res.status(config_message.ERRO_ENVIAR_OTP.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_ENVIAR_OTP.mensagem
            })
        }

        return res.status(config_message.OTP_ENVIADO.status).json({
            sucesso: true,
            mensagem: config_message.OTP_ENVIADO.mensagem,
            chave
        })
    } catch (error) {
        console.error('Erro ao criar código OTP:', error)

        return res.status(config_message.ERRO_GERAR_OTP.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_GERAR_OTP.mensagem
        })
    }
}

// ETAPA 2: só cria o usuário se o código e a chave estiverem corretos.
// Body: { ...dados do usuário, codigo, chave }
const criarUsuario = async (req, res) => {
    try {
        const { codigo, chave, ...dados } = req.body

        if (!codigo || !chave) {
            return res.status(config_message.CODIGO_OTP_OBRIGATORIO.status).json({
                sucesso: false,
                mensagem: config_message.CODIGO_OTP_OBRIGATORIO.mensagem
            })
        }

        if (!dados.nome || !dados.cpf || !dados.email || !dados.username || !dados.senha) {
            return res.status(config_message.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: config_message.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        if (!OTP_SECRET) {
            return res.status(config_message.ERRO_VALIDAR_OTP.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_VALIDAR_OTP.mensagem
            })
        }

        const validacao = validarChave(chave, codigo, dados.email)

        if (!validacao.ok) {
            const erro = validacao.motivo === 'expirado'
                ? config_message.CODIGO_OTP_EXPIRADO
                : config_message.CODIGO_OTP_INCORRETO

            return res.status(erro.status).json({
                sucesso: false,
                mensagem: erro.mensagem
            })
        }

        // só os campos permitidos; XP e nível não podem vir do cliente
        const usuario = {
            nome: dados.nome,
            cpf: dados.cpf,
            email: dados.email,
            username: dados.username,
            senha: dados.senha,
            xp_usuario: 0,
            nivel_total: 1,
            foto_perfil: dados.foto_perfil ?? null,
            nome_exibicao: dados.nome_exibicao ?? null,
            username_social: dados.username_social ?? null,
            biografia_social: dados.biografia_social ?? null,
            localizacao_estado: dados.localizacao_estado ?? null,
            visibilidade: dados.visibilidade ?? 1
        }

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
    criarCodigoOTP,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
    buscarUsuarioPorUsername,
    buscarTodosUsuarios
}