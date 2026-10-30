const config_message = require('../modulo/configMensagens.js')
const crypto = require('crypto')
const codigoOTPModel = require('../../../model/DAO/condigo_OTP/codigo_otp_DAO.js')
const usuarioModel = require('../../../model/DAO/Usuario/usuarioDAO.js')
const { enviarOTP } = require('../../config/email.js')

const OTP_VALIDADE_MS = 5 * 60 * 1000
const SENHA_MIN_CARACTERES = 8

// Campos que o próprio usuário pode editar (xp, nível, e-mail e senha ficam de fora)
const CAMPOS_EDITAVEIS = [
    'nome',
    'username',
    'foto_perfil',
    'nome_exibicao',
    'username_social',
    'biografia_social',
    'localizacao_estado',
    'visibilidade'
]

// Gera OTP de 6 dígitos
const gerarCodigo = () => crypto.randomInt(100000, 1000000).toString()

// Valida tamanho mínimo da senha
const senhaValida = (senha) =>
    typeof senha === 'string' && senha.length >= SENHA_MIN_CARACTERES

// Valida id numérico positivo
const idValido = (id) => Number.isInteger(id) && id > 0

// Resposta padrão de erro
const responderErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

// Remove a senha do objeto de usuário antes de enviar na resposta
const semSenha = ({ senha, ...resto }) => resto

// Rollback do cadastro (NÃO é handler Express). Nunca lança erro.
const removerUsuarioPorId = async (id_usuario) => {
    try {
        await usuarioModel.DeleteUsers(id_usuario)
    } catch (erro) {
        console.error('Erro no rollback do usuário:', erro)
    }
}

// Cria o usuário, depois o OTP, e envia por e-mail.
// Se o OTP não for criado ou enviado, o usuário é apagado.
const criarCodigoOTPUsuario = async (req, res) => {
    let id_usuario = null

    try {
        const usuario = req.body

        if (!usuario || !usuario.email || !usuario.senha) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        if (!senhaValida(usuario.senha)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `A senha deve ter pelo menos ${SENHA_MIN_CARACTERES} caracteres.`
            })
        }

        const usuarioExiste = await usuarioModel.ValidarUser(usuario)

        if (usuarioExiste) {
            return responderErro(res, config_message.DADOS_USUARIO_EXISTENTES)
        }

        // 1. cria o usuário (o DAO faz o hash da senha)
        id_usuario = await usuarioModel.CreateUsers(usuario)

        if (!id_usuario) {
            return responderErro(res, config_message.ERRO_CRIAR_USUARIO)
        }

        // 2. cria o código ligado ao usuário
        const codigo = gerarCodigo()

        const id_codigo_otp = await codigoOTPModel.CreateCodigoOTP({
            codigo,
            data_expiracao: new Date(Date.now() + OTP_VALIDADE_MS),
            id_usuario
        })

        if (!id_codigo_otp) {
            await removerUsuarioPorId(id_usuario)
            return responderErro(res, config_message.ERRO_GERAR_OTP)
        }

        // 3. envia o e-mail; se falhar, apaga o usuário também
        try {
            await enviarOTP(usuario.email, codigo)
        } catch (erroEmail) {
            console.error('Erro ao enviar OTP:', erroEmail)
            await removerUsuarioPorId(id_usuario)
            return responderErro(res, config_message.ERRO_ENVIAR_OTP)
        }

        return res.status(config_message.USUARIO_CRIADO.status).json({
            sucesso: true,
            mensagem: 'Usuário criado. Verifique seu e-mail para obter o código OTP.',
            id_usuario
        })
    } catch (error) {
        console.error('Erro ao criar usuário:', error)

        if (id_usuario) {
            await removerUsuarioPorId(id_usuario)
        }

        return responderErro(res, config_message.ERRO_CRIAR_USUARIO)
    }
}

// Confirma o código OTP enviado no cadastro
const verificarOTPCadastro = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const { codigo } = req.body || {}

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        if (!codigo) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        const otp = await codigoOTPModel.GetCodigoOTPValido(id_usuario, String(codigo))

        if (!otp) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido ou expirado.'
            })
        }

        await codigoOTPModel.MarcarCodigoComoUsado(otp.id_codigo_otp)

        return res.status(200).json({
            sucesso: true,
            mensagem: 'E-mail verificado com sucesso.'
        })
    } catch (error) {
        console.error('Erro ao verificar OTP do cadastro:', error)
        return responderErro(res, config_message.ERRO_GERAR_OTP)
    }
}

// Atualizar usuário (dados gerais).
// Só campos da lista branca; a senha só muda pelo fluxo com OTP.
const atualizarUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const dados = Object.fromEntries(
            Object.entries(req.body || {}).filter(([campo]) => CAMPOS_EDITAVEIS.includes(campo))
        )

        if (Object.keys(dados).length === 0) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        // Se for trocar o username, garante que não pertence a outro usuário
        if (dados.username) {
            const existente = await usuarioModel.GetUsuarioByUsername(dados.username)

            if (existente && existente.id !== id_usuario) {
                return responderErro(res, config_message.DADOS_USUARIO_EXISTENTES)
            }
        }

        const atualizado = await usuarioModel.UpdateUsers({ ...dados, id_usuario })

        if (!atualizado) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        return res.status(config_message.USUARIO_ATUALIZADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_ATUALIZADO.mensagem
        })
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        return responderErro(res, config_message.ERRO_ATUALIZAR_USUARIO)
    }
}

// PASSO 1 da troca de senha: gera o OTP e envia por e-mail
const solicitarOTPAlteracaoSenha = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const usuario = await usuarioModel.GetUsuarioById(id_usuario)

        if (!usuario) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        const codigo = gerarCodigo()

        const id_codigo_otp = await codigoOTPModel.CreateCodigoOTP({
            codigo,
            data_expiracao: new Date(Date.now() + OTP_VALIDADE_MS),
            id_usuario
        })

        if (!id_codigo_otp) {
            return responderErro(res, config_message.ERRO_GERAR_OTP)
        }

        try {
            await enviarOTP(usuario.email, codigo)
        } catch (erroEmail) {
            console.error('Erro ao enviar OTP:', erroEmail)
            return responderErro(res, config_message.ERRO_ENVIAR_OTP)
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Código enviado para o seu e-mail.'
        })
    } catch (error) {
        console.error('Erro ao solicitar OTP:', error)
        return responderErro(res, config_message.ERRO_GERAR_OTP)
    }
}

// PASSO 2 da troca de senha: valida o OTP e só então altera a senha
const alterarSenhaComOTP = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const { codigo, nova_senha } = req.body || {}

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        if (!codigo || !nova_senha) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        if (!senhaValida(nova_senha)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `A senha deve ter pelo menos ${SENHA_MIN_CARACTERES} caracteres.`
            })
        }

        const usuario = await usuarioModel.GetUsuarioById(id_usuario)

        if (!usuario) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        const otp = await codigoOTPModel.GetCodigoOTPValido(id_usuario, String(codigo))

        if (!otp) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido ou expirado.'
            })
        }

        // Invalida o código ANTES de trocar a senha, para não permitir reuso
        await codigoOTPModel.MarcarCodigoComoUsado(otp.id_codigo_otp)

        // Senha em texto puro: o DAO faz o hash
        const atualizado = await usuarioModel.UpdateUsers({ id_usuario, senha: nova_senha })

        if (!atualizado) {
            return responderErro(res, config_message.ERRO_ATUALIZAR_USUARIO)
        }

        return res.status(config_message.USUARIO_ATUALIZADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_ATUALIZADO.mensagem
        })
    } catch (error) {
        console.error('Erro ao alterar senha:', error)
        return responderErro(res, config_message.ERRO_ATUALIZAR_USUARIO)
    }
}

// Deletar usuário
const deletarUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const deletado = await usuarioModel.DeleteUsers(id_usuario)

        if (!deletado) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        return res.status(config_message.USUARIO_DELETADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_DELETADO.mensagem
        })
    } catch (error) {
        console.error('Erro ao deletar usuário:', error)
        return responderErro(res, config_message.ERRO_DELETAR_USUARIO)
    }
}

// Buscar usuário pelo username
const buscarUsuarioPorUsername = async (req, res) => {
    try {
        const { username } = req.params

        if (!username) {
            return responderErro(res, config_message.USERNAME_OBRIGATORIO)
        }

        const usuario = await usuarioModel.GetUsuarioByUsername(username)

        if (!usuario) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        return res.status(config_message.USUARIO_ENCONTRADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_ENCONTRADO.mensagem,
            usuario: semSenha(usuario)
        })
    } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_USUARIO)
    }
}

// Buscar todos os usuários
const buscarTodosUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModel.GetAllUsers()

        if (usuarios === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_USUARIOS)
        }

        const usuariosSemSenha = usuarios.map(semSenha)

        return res.status(config_message.USUARIOS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.USUARIOS_ENCONTRADOS.mensagem,
            quantidade: usuariosSemSenha.length,
            usuarios: usuariosSemSenha
        })
    } catch (error) {
        console.error('Erro ao buscar usuários:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_USUARIOS)
    }
}

// Buscar usuário pelo ID
const buscarUsuarioPorId = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const usuario = await usuarioModel.GetUsuarioById(id_usuario)

        if (!usuario) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        return res.status(config_message.USUARIO_ENCONTRADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_ENCONTRADO.mensagem,
            usuario: semSenha(usuario)
        })
    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_USUARIO)
    }
}

// Buscar usuário pelo email
const buscarUsuarioPorEmail = async (req, res) => {
    try {
        const { email } = req.params

        if (!email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'E-mail obrigatório.'
            })
        }

        const usuario = await usuarioModel.GetUsuarioByEmail(email)

        if (!usuario) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        return res.status(config_message.USUARIO_ENCONTRADO.status).json({
            sucesso: true,
            mensagem: config_message.USUARIO_ENCONTRADO.mensagem,
            usuario: semSenha(usuario)
        })
    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_USUARIO)
    }
}

// Login
const login = async (req, res) => {
    try {
        const { email, senha } = req.body || {}

        if (!email || !senha) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        const usuario = await usuarioModel.GetUsuarioByEmail(email)

        const senhaCorreta = usuario
            ? await usuarioModel.ValidarSenha(senha, usuario.senha)
            : false

        // Mesma resposta para e-mail inexistente e senha errada
        if (!senhaCorreta) {
            return responderErro(res, config_message.SENHA_INVALIDA)
        }

        return res.status(config_message.LOGIN_SUCESSO.status).json({
            sucesso: true,
            mensagem: config_message.LOGIN_SUCESSO.mensagem,
            usuario: semSenha(usuario)
        })
    } catch (error) {
        console.error('Erro ao realizar login:', error)
        return responderErro(res, config_message.ERRO_LOGIN)
    }
}

module.exports = {
    criarCodigoOTPUsuario,
    verificarOTPCadastro,
    atualizarUsuario,
    solicitarOTPAlteracaoSenha,
    alterarSenhaComOTP,
    deletarUsuario,
    buscarUsuarioPorUsername,
    buscarTodosUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    login
}