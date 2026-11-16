const config_message = require('../modulo/configMensagens.js')
const dispositivoModel = require('../../../model/DAO/Dispositivos/dispositivos.js')

/* ------------------------------ Helpers ------------------------------ */

// Valida id numérico positivo
const idValido = (id) => Number.isInteger(id) && id > 0

const respostaErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

const respostaSucesso = (res, cfg, extra = {}) =>
    res.status(cfg.status).json({ sucesso: true, mensagem: cfg.mensagem, ...extra })

/* ----------------------------- Controllers ----------------------------- */

// POST - Criar dispositivo
const criarDispositivo = async (req, res) => {
    try {
        const { nome, sistema_operacional, identificador } = req.body || {}
        const id_usuario = Number(req.body?.id_usuario)

        if (!nome || !sistema_operacional || !identificador) {
            return respostaErro(res, config_message.CAMPOS_OBRIGATORIOS)
        }

        if (!idValido(id_usuario)) {
            return respostaErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const usuarioExiste = await dispositivoModel.ExisteUsuario(id_usuario)

        if (!usuarioExiste) {
            return respostaErro(res, config_message.USUARIO_NAO_ENCONTRADO)
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
            return respostaErro(res, {
                status: 409,
                mensagem: 'Este dispositivo já está cadastrado para o usuário.'
            })
        }

        const id_dispositivo = await dispositivoModel.CreateDispositivo(dispositivo)

        if (!id_dispositivo) {
            return respostaErro(res, {
                status: 500,
                mensagem: 'Erro ao cadastrar o dispositivo.'
            })
        }

        return respostaSucesso(
            res,
            { status: 201, mensagem: 'Dispositivo cadastrado com sucesso.' },
            { id_dispositivo }
        )

    } catch (error) {
        console.error('Erro ao criar dispositivo:', error)
        return respostaErro(res, {
            status: 500,
            mensagem: 'Erro interno ao cadastrar o dispositivo.'
        })
    }
}

// GET - Buscar todos os dispositivos
const buscarTodosDispositivos = async (req, res) => {
    try {
        const dispositivos = await dispositivoModel.GetAllDispositivos()

        if (dispositivos === false) {
            return respostaErro(res, {
                status: 500,
                mensagem: 'Erro ao buscar os dispositivos.'
            })
        }

        return respostaSucesso(
            res,
            { status: 200, mensagem: 'Dispositivos encontrados com sucesso.' },
            { quantidade: dispositivos.length, dispositivos }
        )

    } catch (error) {
        console.error('Erro ao buscar dispositivos:', error)
        return respostaErro(res, {
            status: 500,
            mensagem: 'Erro interno ao buscar os dispositivos.'
        })
    }
}

// DELETE - Deletar dispositivo
const deletarDispositivo = async (req, res) => {
    try {
        const id_dispositivo = Number(req.params.id_dispositivo)

        if (!idValido(id_dispositivo)) {
            return respostaErro(res, {
                status: 400,
                mensagem: 'ID do dispositivo inválido.'
            })
        }

        const deletado = await dispositivoModel.DeletarDispositivo(id_dispositivo)

        if (!deletado) {
            return respostaErro(res, {
                status: 404,
                mensagem: 'Dispositivo não encontrado.'
            })
        }

        return respostaSucesso(res, {
            status: 200,
            mensagem: 'Dispositivo deletado com sucesso.'
        })

    } catch (error) {
        console.error('Erro ao deletar dispositivo:', error)
        return respostaErro(res, {
            status: 500,
            mensagem: 'Erro interno ao deletar o dispositivo.'
        })
    }
}

module.exports = {
    criarDispositivo,
    buscarTodosDispositivos,
    deletarDispositivo
}