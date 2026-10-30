const config_message = require('../modulo/configMensagens.js')
const dispositivoModel = require('../../../model/DAO/Dispositivos/dispositivos.js')

// Valida id numérico positivo
const idValido = (id) => Number.isInteger(id) && id > 0

// Resposta padrão de erro
const responderErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

// Criar dispositivo
const criarDispositivo = async (req, res) => {
    try {
        const { nome, sistema_operacional, identificador } = req.body || {}
        const id_usuario = Number(req.body?.id_usuario)

        if (!nome || !sistema_operacional || !identificador) {
            return responderErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const usuarioExiste = await dispositivoModel.ExisteUsuario(id_usuario)

        if (!usuarioExiste) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        // Monta o objeto só com os campos permitidos
        const dispositivo = {
            nome: String(nome).trim(),
            sistema_operacional: String(sistema_operacional).trim(),
            identificador: String(identificador).trim(),
            id_usuario
        }

        const jaExiste = await dispositivoModel.ValidarDispositivo(dispositivo)

        if (jaExiste) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este dispositivo já está cadastrado para o usuário.'
            })
        }

        const id_dispositivo = await dispositivoModel.CreateDispositivo(dispositivo)

        if (!id_dispositivo) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar o dispositivo.'
            })
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Dispositivo cadastrado com sucesso.',
            id_dispositivo
        })
    } catch (error) {
        console.error('Erro ao criar dispositivo:', error)
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao cadastrar o dispositivo.'
        })
    }
}

// Buscar todos os dispositivos
const buscarTodosDispositivos = async (req, res) => {
    try {
        const dispositivos = await dispositivoModel.GetAllDispositivos()

        if (dispositivos === false) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao buscar os dispositivos.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Dispositivos encontrados com sucesso.',
            quantidade: dispositivos.length,
            dispositivos
        })
    } catch (error) {
        console.error('Erro ao buscar dispositivos:', error)
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao buscar os dispositivos.'
        })
    }
}

// Deletar dispositivo
const deletarDispositivo = async (req, res) => {
    try {
        const id_dispositivo = Number(req.params.id_dispositivo)

        if (!idValido(id_dispositivo)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do dispositivo inválido.'
            })
        }

        const deletado = await dispositivoModel.DeletarDispositivo(id_dispositivo)

        if (!deletado) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Dispositivo não encontrado.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Dispositivo deletado com sucesso.'
        })
    } catch (error) {
        console.error('Erro ao deletar dispositivo:', error)
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao deletar o dispositivo.'
        })
    }
}

module.exports = {
    criarDispositivo,
    buscarTodosDispositivos,
    deletarDispositivo
}