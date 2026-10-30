const config_message = require('../modulo/configMensagens.js')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const codigoOTPModel = require('../../../model/DAO/condigo_OTP/codigo_otp_DAO.js')
const usuarioModel = require('../../../model/DAO/Usuario/usuarioDAO.js')
const { enviarOTP } = require('../../config/email.js')

const OTP_VALIDADE_MS = 5 * 60 * 1000
const SALT_ROUNDS = 10
const SENHA_MIN_CARACTERES = 8

// Gera OTP de 6 dígitos
const gerarCodigo = () => crypto.randomInt(100000, 1000000).toString()

// Gera o hash da senha
const hashSenha = (senha) => bcrypt.hash(String(senha), SALT_ROUNDS)

// Valida tamanho mínimo da senha
const senhaValida = (senha) =>
    typeof senha === 'string' && senha.length >= SENHA_MIN_CARACTERES

// Valida id numérico positivo
const idValido = (id) => Number.isInteger(id) && id > 0

// Função auxiliar de rollback (NÃO é handler Express).
// Nunca lança erro: só registra no log se falhar.
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
            return res.status(config_message.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: config_message.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        if (!senhaValida(usuario.senha)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `A senha deve ter pelo menos ${SENHA_MIN_CARACTERES} caracteres.`
            })
        }

        const usuarioExiste = await usuarioModel.ValidarUser(usuario)

        if (usuarioExiste) {
            return res.status(config_message.DADOS_USUARIO_EXISTENTES.status).json({
                sucesso: false,
                mensagem: config_message.DADOS_USUARIO_EXISTENTES.mensagem
            })
        }

        // 1. cria o usuário primeiro (senha salva como hash)
        const senhaHash = await hashSenha(usuario.senha)

        id_usuario = await usuarioModel.CreateUsers({ ...usuario, senha: senhaHash })

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
            await removerUsuarioPorId(id_usuario)

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

            await removerUsuarioPorId(id_usuario)

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
            await removerUsuarioPorId(id_usuario)
        }

        return res.status(config_message.ERRO_CRIAR_USUARIO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_CRIAR_USUARIO.mensagem
        })
    }
}

// Confirma o e-mail do cadastro usando o OTP enviado
// ASSUNÇÃO: crie no DAO o método MarcarEmailVerificado(id_usuario)
// e uma coluna como "email_verificado" na tabela de usuário.
const verificarOTPCadastro = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const { codigo } = req.body || {}

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        if (!codigo) {
            return res.status(config_message.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: config_message.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        const otp = await codigoOTPModel.GetCodigoOTPValido(id_usuario, String(codigo))

        if (!otp) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido ou expirado.'
            })
        }

        await codigoOTPModel.MarcarCodigoComoUsado(otp.id_codigo_otp)
        await usuarioModel.MarcarEmailVerificado(id_usuario)

        return res.status(200).json({
            sucesso: true,
            mensagem: 'E-mail verificado com sucesso.'
        })
    } catch (error) {
        console.error('Erro ao verificar OTP do cadastro:', error)

        return res.status(config_message.ERRO_GERAR_OTP.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_GERAR_OTP.mensagem
        })
    }
}

// Atualizar usuário (dados gerais).
// A senha NÃO pode ser alterada aqui: só pelo fluxo com OTP.
const atualizarUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        const { senha, ...dadosSemSenha } = req.body || {}

        const usuarioAtualizado = await usuarioModel.UpdateUsers({ ...dadosSemSenha, id_usuario })

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

// PASSO 1 da troca de senha: gera o OTP e envia por e-mail
const solicitarOTPAlteracaoSenha = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        const usuario = await usuarioModel.GetUsuarioById(id_usuario)

        if (!usuario) {
            return res.status(config_message.USUARIO_NAO_ENCONTRADO.status).json({
                sucesso: false,
                mensagem: config_message.USUARIO_NAO_ENCONTRADO.mensagem
            })
        }

        const codigo = gerarCodigo()

        const id_codigo_otp = await codigoOTPModel.CreateCodigoOTP({
            codigo,
            data_expiracao: new Date(Date.now() + OTP_VALIDADE_MS),
            id_usuario
        })

        if (!id_codigo_otp) {
            return res.status(config_message.ERRO_GERAR_OTP.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_GERAR_OTP.mensagem
            })
        }

        try {
            await enviarOTP(usuario.email, codigo)
        } catch (erroEmail) {
            console.error('Erro ao enviar OTP:', erroEmail)

            return res.status(config_message.ERRO_ENVIAR_OTP.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_ENVIAR_OTP.mensagem
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Código enviado para o seu e-mail.'
        })
    } catch (error) {
        console.error('Erro ao solicitar OTP:', error)

        return res.status(config_message.ERRO_GERAR_OTP.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_GERAR_OTP.mensagem
        })
    }
}

// PASSO 2 da troca de senha: valida o OTP e só então altera a senha
const alterarSenhaComOTP = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const { codigo, nova_senha } = req.body || {}

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        if (!codigo || !nova_senha) {
            return res.status(config_message.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: config_message.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        if (!senhaValida(nova_senha)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `A senha deve ter pelo menos ${SENHA_MIN_CARACTERES} caracteres.`
            })
        }

        // ASSUNÇÃO: retorna o OTP não usado e não expirado, ou null
        const otp = await codigoOTPModel.GetCodigoOTPValido(id_usuario, String(codigo))

        if (!otp) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Código inválido ou expirado.'
            })
        }

        // Invalida o código ANTES de trocar a senha, para não permitir reuso
        await codigoOTPModel.MarcarCodigoComoUsado(otp.id_codigo_otp)

        const senhaHash = await hashSenha(nova_senha)

        const atualizado = await usuarioModel.UpdateUsers({ id_usuario, senha: senhaHash })

        if (!atualizado) {
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
        console.error('Erro ao alterar senha:', error)

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

        if (!idValido(id_usuario)) {
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

// Buscar usuário pelo ID
const buscarUsuarioPorId = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)

        if (!idValido(id_usuario)) {
            return res.status(config_message.ID_USUARIO_INVALIDO.status).json({
                sucesso: false,
                mensagem: config_message.ID_USUARIO_INVALIDO.mensagem
            })
        }

        const usuario = await usuarioModel.GetUsuarioById(id_usuario)

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
        console.error('Erro ao buscar usuário por ID:', error)

        return res.status(config_message.ERRO_BUSCAR_USUARIO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_BUSCAR_USUARIO.mensagem
        })
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
        console.error('Erro ao buscar usuário por email:', error)

        return res.status(config_message.ERRO_BUSCAR_USUARIO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_BUSCAR_USUARIO.mensagem
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, senha } = req.body || {}

        if (!email || !senha) {
            return res.status(config_message.CAMPOS_OBRIGATORIOS.status).json({
                sucesso: false,
                mensagem: config_message.CAMPOS_OBRIGATORIOS.mensagem
            })
        }

        const usuario = await usuarioModel.GetUsuarioByEmail(email)

        const senhaCorreta = usuario
            ? await bcrypt.compare(String(senha), usuario.senha)
            : false

        // Mesma resposta para e-mail inexistente e senha errada
        if (!senhaCorreta) {
            return res.status(config_message.SENHA_INVALIDA.status).json({
                sucesso: false,
                mensagem: config_message.SENHA_INVALIDA.mensagem
            })
        }

        // Bloqueia contas com e-mail ainda não confirmado.
        // (Só age se a coluna "email_verificado" existir e for false.)
        if (usuario.email_verificado === false) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Confirme seu e-mail com o código OTP antes de entrar.'
            })
        }

        const { senha: _senha, ...usuarioSemSenha } = usuario

        return res.status(config_message.LOGIN_SUCESSO.status).json({
            sucesso: true,
            mensagem: config_message.LOGIN_SUCESSO.mensagem,
            usuario: usuarioSemSenha
        })
    } catch (error) {
        console.error('Erro ao realizar login:', error)

        return res.status(config_message.ERRO_LOGIN.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_LOGIN.mensagem
        })
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