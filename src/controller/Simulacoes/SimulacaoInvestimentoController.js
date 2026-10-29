const dao = require('../../../model/DAO/Simulacoes/SimulacaoInvestimentoDAO.js')

const removerSimulacaoInvestimento = async (req, res) => {
    const usuarioId = Number(
        req.usuario?.id ?? req.usuario?.id_usuario ?? req.user?.id ?? req.user?.id_usuario
    )
    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
        return res.status(401).json({ sucesso: false, mensagem: 'Usuário não autenticado.' })
    }
    const simulacaoId = Number(req.params.simulacaoId)
    if (!Number.isSafeInteger(simulacaoId) || simulacaoId < 1) {
        return res.status(422).json({ sucesso: false, mensagem: 'ID da simulação inválido.' })
    }
    try {
        const removida = await dao.removerSimulacaoInvestimento(simulacaoId, usuarioId)
        return removida
            ? res.status(204).send()
            : res.status(404).json({ sucesso: false, mensagem: 'Simulação não encontrada.' })
    } catch (error) {
        console.error('Erro ao remover simulação de investimento:', error)
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' })
    }
}

module.exports = { removerSimulacaoInvestimento }
