const config_message = require('../modulo/configMensagens.js')
const dispositivoModel = require('../../../model/DAO/Dispositivos/dispositivos.js')

const criarDispositivo = async (req, res) => {
    try {
        // Tudo vem do front
        const { nome, sistema_operacional, identificador, id_usuario } = req.body

        if (!nome || !sistema_operacional || !identificador || !id_usuario) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, sistema operacional, identificador e id_usuario são obrigatórios.'
            })
        }

        if (!Number.isInteger(Number(id_usuario))) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'id_usuario inválido.'
            })
        }

        // Objeto que será repassado ao DAO
        const dispositivo = {
            nome: String(nome).substring(0, 67),
            sistema_operacional: String(sistema_operacional).substring(0, 24),
            identificador: String(identificador).substring(0, 64),
            id_usuario: Number(id_usuario)
        }

        // Usuário precisa existir (evita erro de chave estrangeira)
        const usuarioExiste = await dispositivoModel.ExisteUsuario(dispositivo.id_usuario)
        if (!usuarioExiste) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            })
        }

        // Não duplica o mesmo dispositivo para o mesmo usuário
        const existe = await dispositivoModel.ValidarDispositivo(dispositivo)
        if (existe) {
            return res.status(200).json({
                sucesso: true,
                mensagem: 'Dispositivo já cadastrado.'
            })
        }

        // Repassa para o DAO, que devolve o insertId (ou false)
        const idDispositivo = await dispositivoModel.CreateDispositivo(dispositivo)

        if (!idDispositivo) {
            return res.status(config_message.ERRO_CRIAR_DISPOSITIVO.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_CRIAR_DISPOSITIVO.mensagem
            })
        }

        return res.status(config_message.DISPOSITIVO_CRIADO.status).json({
            sucesso: true,
            mensagem: config_message.DISPOSITIVO_CRIADO.mensagem,
            id_dispositivo: idDispositivo
        })
    } catch (error) {
        console.error('Erro ao criar dispositivo:', error)

        return res.status(config_message.ERRO_INTERNO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_INTERNO.mensagem
        })
    }
}

const ListarTodosDispositivos = async (req, res) => {
    try {
        const dispositivos = await dispositivoModel.GetAllDispositivos()

        if (dispositivos === false) {
            return res.status(config_message.ERRO_LISTAR_DISPOSITIVOS.status).json({
                sucesso: false,
                mensagem: config_message.ERRO_LISTAR_DISPOSITIVOS.mensagem
            })
        }

        return res.status(config_message.DISPOSITIVOS_LISTADOS.status).json({
            sucesso: true,
            mensagem: config_message.DISPOSITIVOS_LISTADOS.mensagem,
            dispositivos
        })
    } catch (error) {
        console.error('Erro ao listar dispositivos:', error)

        return res.status(config_message.ERRO_INTERNO.status).json({
            sucesso: false,
            mensagem: config_message.ERRO_INTERNO.mensagem
        })
    }
}

module.exports = {
    criarDispositivo,
    ListarTodosDispositivos
}