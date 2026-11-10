const MetaDAO = require("../../../model/DAO/Metas/MetasDAO.js")

// Criar meta
const CriarMeta = async (req, res) => {
    try {
        const { id_usuario } = req.params

        const meta = {
            ...req.body,
            id_usuario
        }

        const resultado = await MetaDAO.CreateMeta(meta)

        if (!resultado) {
            return res.status(400).json({
                erro: 'Não foi possível criar a meta.'
            })
        }

        return res.status(201).json({
            mensagem: 'Meta criada com sucesso!',
            id: resultado
        })

    } catch (error) {
        console.error('Erro ao criar meta:', error)
        return res.status(500).json({
            erro: 'Erro interno ao criar meta.'
        })
    }
}

// Atualizar meta
const AtualizarMeta = async (req, res) => {
    try {
        const { id_usuario, id } = req.params

    if (req.body.status !== undefined && ![0, 1].includes(req.body.status)) {
        return res.status(400).json({
            erro: 'O status deve ser 0 (inativo) ou 1 (ativo).'
        })
    }

        const meta = {
            ...req.body,
            id,
            id_usuario
        }

        const resultado = await MetaDAO.UpdateMeta(meta)

        if (!resultado) {
            return res.status(404).json({
                erro: 'Meta não encontrada ou nenhuma alteração realizada.'
            })
        }

        return res.status(200).json({
            mensagem: 'Meta atualizada com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao atualizar meta:', error)
        return res.status(500).json({
            erro: 'Erro interno ao atualizar meta.'
        })
    }
}

// Deletar meta
const DeletarMeta = async (req, res) => {
    try {
        const { id_usuario, id } = req.params

        const resultado = await MetaDAO.DeleteMeta({
            id,
            id_usuario
        })

        if (!resultado) {
            return res.status(404).json({
                erro: 'Meta não encontrada.'
            })
        }

        return res.status(200).json({
            mensagem: 'Meta deletada com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao deletar meta:', error)
        return res.status(500).json({
            erro: 'Erro interno ao deletar meta.'
        })
    }
}

// Listar todas as metas do usuário
const ListarMetasUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params

        const resultado = await MetaDAO.GetAllMetasUsuario(id_usuario)

        if (resultado === false) {
            return res.status(500).json({
                erro: 'Erro ao buscar metas.'
            })
        }

        return res.status(200).json({
            total: resultado.length,
            metas: resultado
        })

    } catch (error) {
        console.error('Erro ao listar metas:', error)
        return res.status(500).json({
            erro: 'Erro interno ao listar metas.'
        })
    }
}

// Listar categorias do usuário
const ListarCategoriasMeta = async (req, res) => {
    try {
        const { id_usuario } = req.params

        const resultado = await MetaDAO.GetAllCategoriasMeta(id_usuario)

        if (resultado === false) {
            return res.status(500).json({
                erro: 'Erro ao buscar categorias.'
            })
        }

        return res.status(200).json({
            total: resultado.length,
            categorias: resultado
        })

    } catch (error) {
        console.error('Erro ao listar categorias:', error)
        return res.status(500).json({
            erro: 'Erro interno ao listar categorias.'
        })
    }
}

// Buscar meta específica
const BuscarMetaPorId = async (req, res) => {
    try {
        const { id_usuario, id } = req.params

        const resultado = await MetaDAO.GetMetaById(
            id_usuario,
            id
        )

        if (resultado === false) {
            return res.status(500).json({
                erro: 'Erro ao buscar meta.'
            })
        }

        if (!resultado || resultado.length === 0) {
            return res.status(404).json({
                erro: 'Meta não encontrada.'
            })
        }

        return res.status(200).json({
            meta: resultado[0]
        })

    } catch (error) {
        console.error('Erro ao buscar meta:', error)
        return res.status(500).json({
            erro: 'Erro interno ao buscar meta.'
        })
    }
}

module.exports = {
    CriarMeta,
    AtualizarMeta,
    DeletarMeta,
    ListarMetasUsuario,
    ListarCategoriasMeta,
    BuscarMetaPorId
}
