const MetaDAO = require("../../../model/DAO/Metas/MetasDAO.js")

// Criar meta
const CriarMeta = async (req, res) => {
    try {
        const { id_usuario } = req.params

        const camposObrigatorios = ['nome', 'valor_inicio', 'valor_desejado', 'aporte_mensal', 'data_alvo', 'id_categoria']
        const campoFaltando = camposObrigatorios.find((campo) => req.body[campo] === undefined)

        if (campoFaltando) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'CAMPO_OBRIGATORIO',
                mensagem: 'Preencha todos os campos obrigatórios da meta.',
                campos: { [campoFaltando]: 'Campo obrigatório.' }
            })
        }

        const meta = {
            nome: req.body.nome,
            descricao: req.body.descricao ?? null,
            valor_inicio: req.body.valor_inicio,
            valor_desejado: req.body.valor_desejado,
            // ao criar, o valor acumulado começa igual ao valor já economizado informado
            valor_total: req.body.valor_total ?? req.body.valor_inicio,
            aporte_mensal: req.body.aporte_mensal,
            data_alvo: req.body.data_alvo,
            status: req.body.status ?? 1,
            id_categoria: req.body.id_categoria,
            id_conta_vinculada: req.body.id_conta_vinculada ?? null,
            id_usuario
        }

        const resultado = await MetaDAO.CreateMeta(meta)

        if (!resultado) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'ERRO_AO_CRIAR_META',
                mensagem: 'Não foi possível criar a meta.'
            })
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Meta criada com sucesso!',
            id: resultado
        })

    } catch (error) {
        console.error('Erro ao criar meta:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao criar meta.'
        })
    }
}

// Atualizar meta
const AtualizarMeta = async (req, res) => {
    try {
        const { id_usuario, id } = req.params

        if (req.body.status !== undefined && ![0, 1].includes(req.body.status)) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'STATUS_INVALIDO',
                mensagem: 'O status deve ser 0 (pausada) ou 1 (ativa).',
                campos: { status: 'Deve ser 0 ou 1.' }
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
                sucesso: false,
                codigo: 'META_NAO_ENCONTRADA',
                mensagem: 'Meta não encontrada ou nenhuma alteração realizada.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Meta atualizada com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao atualizar meta:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao atualizar meta.'
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
                sucesso: false,
                codigo: 'META_NAO_ENCONTRADA',
                mensagem: 'Meta não encontrada.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Meta deletada com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao deletar meta:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao deletar meta.'
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
                sucesso: false,
                codigo: 'ERRO_INTERNO',
                mensagem: 'Erro ao buscar metas.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Metas listadas com sucesso!',
            total: resultado.length,
            metas: resultado
        })

    } catch (error) {
        console.error('Erro ao listar metas:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao listar metas.'
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
                sucesso: false,
                codigo: 'ERRO_INTERNO',
                mensagem: 'Erro ao buscar meta.'
            })
        }

        if (!resultado || resultado.length === 0) {
            return res.status(404).json({
                sucesso: false,
                codigo: 'META_NAO_ENCONTRADA',
                mensagem: 'Meta não encontrada.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Meta encontrada com sucesso!',
            meta: resultado[0]
        })

    } catch (error) {
        console.error('Erro ao buscar meta:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao buscar meta.'
        })
    }
}

// Listar categorias do usuário (padrão do sistema + personalizadas dele)
const ListarCategoriasMeta = async (req, res) => {
    try {
        const { id_usuario } = req.params

        const resultado = await MetaDAO.GetAllCategoriasMeta(id_usuario)

        if (resultado === false) {
            return res.status(500).json({
                sucesso: false,
                codigo: 'ERRO_INTERNO',
                mensagem: 'Erro ao buscar categorias.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Categorias listadas com sucesso!',
            total: resultado.length,
            categorias: resultado
        })

    } catch (error) {
        console.error('Erro ao listar categorias:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao listar categorias.'
        })
    }
}

// Criar categoria personalizada vinculada ao usuário
const CriarCategoria = async (req, res) => {
    try {
        const { id_usuario } = req.params
        const { nome } = req.body

        if (!nome || !nome.trim()) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'NOME_OBRIGATORIO',
                mensagem: 'Informe um nome para a categoria.',
                campos: { nome: 'Campo obrigatório.' }
            })
        }

        const resultado = await MetaDAO.CreateCategoria({
            nome: nome.trim(),
            id_usuario
        })

        if (!resultado) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'ERRO_AO_CRIAR_CATEGORIA',
                mensagem: 'Não foi possível criar a categoria.'
            })
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Categoria criada com sucesso!',
            id: resultado
        })

    } catch (error) {
        console.error('Erro ao criar categoria:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao criar categoria.'
        })
    }
}

module.exports = {
    CriarMeta,
    AtualizarMeta,
    DeletarMeta,
    ListarMetasUsuario,
    ListarCategoriasMeta,
    BuscarMetaPorId,
    CriarCategoria
}
