const config_message = require('../modulo/configMensagens.js')
const crypto = require('crypto')
const codigoOTPModel = require('../../../model/DAO/condigo_OTP/codigo_otp_DAO.js')
const dispositivoModel = require('../../../model/DAO/Dispositivos/dispositivos.js')
const usuarioModel = require('../../../model/DAO/Usuario/usuarioDAO.js')
const configuracoesModel = require('../../../model/DAO/Configuracoes/configuracoes.js')
const { enviarOTP } = require('../../config/email.js')

const OTP_VALIDADE_MS = 5 * 60 * 1000
const SENHA_MIN_CARACTERES = 8

// Campos que o próprio usuário pode editar (xp, nível e e-mail ficam de fora).
// A senha pode ser editada, mas exige um código OTP válido (ver atualizarUsuario).
const CAMPOS_EDITAVEIS = [
    'nome',
    'username',
    'senha',
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

// Resposta de erro de senha curta
const responderSenhaCurta = (res) =>
    res.status(400).json({
        sucesso: false,
        mensagem: `A senha deve ter pelo menos ${SENHA_MIN_CARACTERES} caracteres.`
    })

// Resposta de código OTP inválido
const responderOTPInvalido = (res) =>
    res.status(400).json({
        sucesso: false,
        mensagem: 'Código inválido ou expirado.'
    })

// Remove a senha do objeto de usuário antes de enviar na resposta
const semSenha = ({ senha, ...resto }) => resto

// Remove o valor do código OTP antes de enviar na resposta
const semCodigo = ({ codigo, ...resto }) => resto

// O DAO pode devolver o id como "id" ou "id_usuario"; aceita os dois
const idDoUsuario = (usuario) => usuario.id ?? usuario.id_usuario

// Valida e normaliza os dados do dispositivo enviados no login
const montarDispositivo = (dados) => {
    const { nome, sistema_operacional, identificador } = dados || {}

    if (!nome || !sistema_operacional || !identificador) {
        return null
    }

    return {
        nome: String(nome).trim(),
        sistema_operacional: String(sistema_operacional).trim(),
        identificador: String(identificador).trim()
    }
}

// Rollback do cadastro (NÃO é handler Express). Nunca lança erro.
const desfazerCadastro = async (id_usuario) => {
    if (!id_usuario) return

    try {
        await usuarioModel.DeleteUsers(id_usuario)
    } catch (erro) {
        console.error('Erro no rollback do usuário:', erro)
    }
}

// Garante que o dispositivo está registrado para o usuário, sem duplicar.
// Retorna true se já existia ou foi criado agora; false se não foi possível.
const garantirDispositivo = async (id_usuario, aparelho) => {
    const existente = await dispositivoModel.GetDispositivoByIdentificador(
        id_usuario,
        aparelho.identificador
    )

    if (existente) return true

    const id_dispositivo = await dispositivoModel.CreateDispositivo({
        ...aparelho,
        id_usuario
    })

    if (id_dispositivo) return true

    // Pode ter sido uma corrida (outro login criou o mesmo dispositivo agora há pouco)
    const criadoPorOutraRequisicao = await dispositivoModel.GetDispositivoByIdentificador(
        id_usuario,
        aparelho.identificador
    )

    return Boolean(criadoPorOutraRequisicao)
}

// Cria o usuário, o OTP, e envia por e-mail.
// Se qualquer etapa falhar, o usuário criado é apagado.
const criarCodigoOTPUsuario = async (req, res) => {
    let id_usuario = null

    try {
        const usuario = req.body

        if (!usuario || !usuario.email || !usuario.senha) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        if (!senhaValida(usuario.senha)) {
            return responderSenhaCurta(res)
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

        const configuracoesCriadas = await configuracoesModel.InsertConfiguracoes(id_usuario, {
            notificacao: 0,
            alerta: 0,
            relatorio: 0,
            recomendacao: 0,
            topicos: 0
        })

        if (!configuracoesCriadas) {
            await desfazerCadastro(id_usuario)
            return responderErro(res, config_message.ERRO_CRIAR_USUARIO)
        }

        // 3. cria o código ligado ao usuário
        const codigo = gerarCodigo()

        const id_codigo_otp = await codigoOTPModel.CreateCodigoOTP({
            codigo,
            data_expiracao: new Date(Date.now() + OTP_VALIDADE_MS),
            id_usuario
        })

        if (!id_codigo_otp) {
            await desfazerCadastro(id_usuario)
            return responderErro(res, config_message.ERRO_GERAR_OTP)
        }

        // 4. envia o e-mail; se falhar, apaga tudo
        try {
            await enviarOTP(usuario.email, codigo)
        } catch (erroEmail) {
            console.error('Erro ao enviar OTP:', erroEmail)
            await desfazerCadastro(id_usuario)
            return responderErro(res, config_message.ERRO_ENVIAR_OTP)
        }

        return res.status(config_message.USUARIO_CRIADO.status).json({
            sucesso: true,
            mensagem: 'Usuário criado. Verifique seu e-mail para obter o código OTP.',
            id_usuario
        })
    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        await desfazerCadastro(id_usuario)
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
            return responderOTPInvalido(res)
        }

        await codigoOTPModel.DesativarCodigoOTP(id_usuario, String(codigo))

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
// Só campos da lista branca. Se vier "senha", exige "codigo" (OTP) válido:
// o código é consumido e o DAO faz o hash da senha uma única vez.
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

        const trocandoSenha = dados.senha !== undefined

        // Troca de senha exige tamanho mínimo e código OTP válido
        if (trocandoSenha) {
            if (!senhaValida(dados.senha)) {
                return responderSenhaCurta(res)
            }
        }

        // Se for trocar o username, garante que não pertence a outro usuário
        if (dados.username) {
            const existente = await usuarioModel.GetUsuarioByUsername(dados.username)

            if (existente && idDoUsuario(existente) !== id_usuario) {
                return responderErro(res, config_message.DADOS_USUARIO_EXISTENTES)
            }
        }

        // Senha em texto puro: o DAO faz o hash
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

// PASSO 2 da troca de senha: só confere o código, SEM consumir.
// O código é consumido no PASSO 3 (atualizarUsuario, ao enviar "senha" + "codigo").
const verificarCodigoAlteracaoSenha = async (req, res) => {
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
            return responderOTPInvalido(res)
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Código válido.'
        })
    } catch (error) {
        console.error('Erro ao verificar código:', error)
        return responderErro(res, config_message.ERRO_GERAR_OTP)
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

// Buscar todos os códigos OTP (sem expor o valor do código)
const buscarTodosCodigos = async (req, res) => {
    try {
        const codigos = await codigoOTPModel.GetAllCodigoOTP()

        if (codigos === false) {
            return responderErro(res, config_message.ERRO_BUSCAR_USUARIOS)
        }

        const codigosSemValor = codigos.map(semCodigo)

        return res.status(config_message.USUARIOS_ENCONTRADOS.status).json({
            sucesso: true,
            mensagem: config_message.USUARIOS_ENCONTRADOS.mensagem,
            quantidade: codigosSemValor.length,
            codigos: codigosSemValor
        })
    } catch (error) {
        console.error('Erro ao buscar códigos OTP:', error)
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

// Login: valida credenciais e registra o dispositivo (sem duplicar)
const login = async (req, res) => {
    try {
        const { username, email, senha, dispositivo } = req.body || {}
        const loginInformado = String(username || email || '').trim()

        if (!loginInformado || !senha) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        const aparelho = montarDispositivo(dispositivo)

        if (!aparelho) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Dados do dispositivo obrigatórios (nome, sistema_operacional e identificador).'
            })
        }

        // "@" indica e-mail, senão é username
        const usuario = loginInformado.includes('@')
            ? await usuarioModel.GetUsuarioByEmail(loginInformado)
            : await usuarioModel.GetUsuarioByUsername(loginInformado)

        const senhaCorreta = usuario
            ? await usuarioModel.ValidarSenha(senha, usuario.senha)
            : false

        // Mesma resposta para usuário inexistente e senha errada
        if (!senhaCorreta) {
            return responderErro(res, config_message.SENHA_INVALIDA)
        }

        // Só cadastra o dispositivo se ainda não existir. Falha aqui NUNCA apaga o usuário.
        const dispositivoOk = await garantirDispositivo(idDoUsuario(usuario), aparelho)

        if (!dispositivoOk) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar o dispositivo.'
            })
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

// Valida (e consome) um código OTP
const validarCodigoOTP = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id_usuario)
        const { codigo } = req.body || {}

        if (!idValido(id_usuario) || !codigo) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        const otp = await codigoOTPModel.GetCodigoOTPValido(id_usuario, String(codigo))

        if (!otp) {
            return responderOTPInvalido(res)
        }

        await codigoOTPModel.DesativarCodigoOTP(id_usuario, String(codigo))

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Código OTP validado com sucesso.'
        })
    } catch (error) {
        console.error('Erro ao validar código OTP:', error)
        return responderErro(res, config_message.ERRO_GERAR_OTP)
    }
}

module.exports = {
    criarCodigoOTPUsuario,
    verificarOTPCadastro,
    atualizarUsuario,
    solicitarOTPAlteracaoSenha,
    verificarCodigoAlteracaoSenha,
    deletarUsuario,
    buscarUsuarioPorUsername,
    buscarTodosUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    login,
    validarCodigoOTP,
    buscarTodosCodigos
}