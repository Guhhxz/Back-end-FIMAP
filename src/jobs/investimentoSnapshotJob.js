const cron = require('node-cron')
const conexaoDAO = require('../../model/DAO/OpenFinance/conexaoOpenFinanceDAO.js')
const pluggyService = require('../services/pluggyService.js')

const PAUSA_ENTRE_CONEXOES_MS = 500

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Passa por todas as conexões ativas e força a sincronização de investimentos,
 * que já registra o snapshot do dia (ver services/pluggyService.js#listarInvestimentos).
 * Roda sequencial, com uma pequena pausa entre conexões, pra não estourar rate limit do Pluggy.
 */
const executarSnapshotDiario = async () => {

    const conexoes = await conexaoDAO.listarTodasConexoesAtivas()
    let sucesso = 0
    let falhas = 0

    for (const conexao of conexoes) {
        const itemId = conexao.external_connection_id
        if (!itemId) continue

        try {
            await pluggyService.listarInvestimentos(itemId)
            sucesso += 1
        } catch (error) {
            falhas += 1
            console.error(`[snapshot-investimentos] Falha na conexão ${itemId}:`, error.message ?? error)
        }

        await esperar(PAUSA_ENTRE_CONEXOES_MS)
    }
}

// Todo dia às 06:00 (horário do servidor). Ajuste a expressão cron se quiser outro horário.
const agendar = () => {
    cron.schedule('0 6 * * *', () => {
        executarSnapshotDiario().catch((error) => {
            console.error('[snapshot-investimentos] Erro inesperado no job:', error)
        })
    })
}

module.exports = { agendar, executarSnapshotDiario }