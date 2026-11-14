const conexaoDAO = require("../../../model/DAO/OpenFinance/conexaoOpenFinanceDAO.js")
const cdiService = require("../../services/cdiService.js")

// GET /v1/openfinance/contas-rendimento?clientUserId=22
async function listarContasRendimento(req, res) {
    try {
        const { clientUserId } = req.query

        if (!clientUserId) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'CLIENT_USER_ID_OBRIGATORIO',
                mensagem: 'Informe o clientUserId.'
            })
        }

        const conexoes = await conexaoDAO.listarConexoesPorUsuario(clientUserId)
        const conexoesAtivas = conexoes.filter((conexao) => conexao.status === 1)

        const contas = await Promise.all(
            conexoesAtivas.map(async (conexao) => {
                // O usuário informou o CDI manualmente? Isso sempre tem prioridade sobre
                // qualquer resolução automática (ele sabe mais sobre a própria conta que
                // qualquer heurística nossa).
                const percentualManual = conexao.percentual_cdi_manual !== null && conexao.percentual_cdi_manual !== undefined
                    ? Number(conexao.percentual_cdi_manual)
                    : null

                const percentualCdi = percentualManual !== null
                    ? percentualManual
                    : await cdiService.resolverPercentualCdi(conexao.nome_instituicao)

                return {
                    id: conexao.id,
                    banco: conexao.nome_instituicao ?? 'Banco não identificado',
                    apelido: 'Conta Vinculada',
                    percentualCdi,
                    // O front usa isso pra saber se deve ou não oferecer o campo de "informar
                    // manualmente" — true quando nem a resolução automática nem um valor manual
                    // anterior existem.
                    cdiNaoEncontrado: percentualCdi === null
                }
            })
        )

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Contas de rendimento listadas com sucesso!',
            total: contas.length,
            contas
        })

    } catch (error) {
        console.error('Erro ao listar contas de rendimento:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao listar contas de rendimento.'
        })
    }
}

// PUT /v1/openfinance/contas-rendimento/:id
// body: { clientUserId, percentualCdi }
// Usado quando o app não acha o CDI automaticamente e o usuário informa manualmente.
async function atualizarCdiManual(req, res) {
    try {
        const { id } = req.params
        const { clientUserId, percentualCdi } = req.body

        if (!clientUserId) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'CLIENT_USER_ID_OBRIGATORIO',
                mensagem: 'Informe o clientUserId.'
            })
        }

        if (percentualCdi === undefined || percentualCdi === null || Number.isNaN(Number(percentualCdi)) || Number(percentualCdi) < 0) {
            return res.status(400).json({
                sucesso: false,
                codigo: 'PERCENTUAL_CDI_INVALIDO',
                mensagem: 'Informe um percentual de CDI válido (número maior ou igual a 0).',
                campos: { percentualCdi: 'Deve ser um número maior ou igual a 0.' }
            })
        }

        const resultado = await conexaoDAO.atualizarPercentualCdiManual(id, clientUserId, Number(percentualCdi))

        if (!resultado) {
            return res.status(404).json({
                sucesso: false,
                codigo: 'CONEXAO_NAO_ENCONTRADA',
                mensagem: 'Conexão não encontrada.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'CDI atualizado com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao atualizar CDI manual:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao atualizar o CDI manual.'
        })
    }
}

module.exports = { listarContasRendimento, atualizarCdiManual }
