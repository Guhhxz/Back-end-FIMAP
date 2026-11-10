const config_message = require('../modulo/configMensagens.js')

const seguir_seguidoresDAO = require('../../../model/DAO/Seguir_Seguidores/seguir_seguidoresDAO.js')


const seguir = async (req, res) => {
    const { id_seguidor, id_seguindo } = req.body

    if (!id_seguidor || !id_seguindo) {
        return res.status(400).json({ mensagem: config_message.ERROR_REQUIRED_FIELDS })
    }

    try {
        const resultado = await seguir_seguidoresDAO.createSeguir({ id_seguidor, id_seguindo })
        if (resultado) {
            return res.status(201).json({ mensagem: config_message.SUCCESS_CREATED })
        } else {
            return res.status(400).json({ mensagem: config_message.ERROR_ALREADY_FOLLOWING })
        }
    } catch (error) {
        console.error('Erro ao criar seguir:', error)
        return res.status(500).json({ mensagem: config_message.ERROR_INTERNAL_SERVER })
    }
}

const deixarDeSeguir = async (req, res) => {
    const { id_seguidor, id_seguindo } = req.body

    if (!id_seguidor || !id_seguindo) {
        return res.status(400).json({ mensagem: config_message.ERROR_REQUIRED_FIELDS })
    }

    try {
        const resultado = await seguir_seguidoresDAO.deleteSeguir(id_seguidor, id_seguindo)
        if (resultado) {
            return res.status(200).json({ mensagem: config_message.SUCCESS_DELETED })
        } else {
            return res.status(404).json({ mensagem: config_message.ERROR_NOT_FOUND })
        }
    } catch (error) {
        console.error('Erro ao deixar de seguir:', error)
        return res.status(500).json({ mensagem: config_message.ERROR_INTERNAL_SERVER })
    }
}

const listarSeguidores = async (req, res) => {
    const { id_usuario } = req.params

    if (!id_usuario) {
        return res.status(400).json({ mensagem: config_message.ERROR_REQUIRED_FIELDS })
    }

    try {
        const seguidores = await seguir_seguidoresDAO.getSeguidoresByUsuarioId(id_usuario)
        return res.status(200).json(seguidores)
    } catch (error) {
        console.error('Erro ao listar seguidores:', error)
        return res.status(500).json({ mensagem: config_message.ERROR_INTERNAL_SERVER })
    }
}

const listarSeguindo = async (req, res) => {
    const { id_usuario } = req.params

    if (!id_usuario) {
        return res.status(400).json({ mensagem: config_message.ERROR_REQUIRED_FIELDS })
    }

    try {
        const seguindo = await seguir_seguidoresDAO.getSeguindoByUsuarioId(id_usuario)
        return res.status(200).json(seguindo)
    } catch (error) {
        console.error('Erro ao listar seguindo:', error)
        return res.status(500).json({ mensagem: config_message.ERROR_INTERNAL_SERVER })
    }
}  

module.exports = {
    seguir,
    deixarDeSeguir,
    listarSeguidores,
    listarSeguindo
}