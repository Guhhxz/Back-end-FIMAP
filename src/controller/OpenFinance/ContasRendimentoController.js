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
            conexoesAtivas.map(async (conexao) => ({
                id: conexao.id,
                banco: conexao.nome_instituicao ?? 'Banco não identificado',
                // A conexão só traz dados no nível da instituição (sem nome de produto/conta).
                // Até integrarmos pluggyService.listarContas pra pegar o apelido real da conta,
                // fica um rótulo genérico aqui.
                apelido: 'Conta Vinculada',
                percentualCdi: await cdiService.resolverPercentualCdi(conexao.nome_instituicao)
            }))
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

module.exports = { listarContasRendimento }
