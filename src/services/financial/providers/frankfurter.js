const { error } = require('../httpClient')
const v = require('../validation')
const { normalize } = require('../financialDataNormalizer')
function createFrankfurter(client) {
    async function cambio({ base, destino, data, inicio, fim }) {
        v.text(base, 'base', /^[A-Z]{3}$/); v.text(destino, 'destino', /^[A-Z]{3}$/)
        if (data) v.date(data)
        if (inicio || fim) { v.period(inicio, fim, 366); if (data) throw error('PERIODO_INVALIDO') }
        const result = await client.get('frankfurter', inicio ? '/v2/rates' : `/v2/rate/${base}/${destino}`, inicio ? { base, quotes: destino, from: inicio, to: fim } : { date: data }, { kind: inicio || data ? 'history' : 'quote' })
        const rows = Array.isArray(result.data) ? result.data : [result.data]
        if (!rows.length) throw error('DADOS_INDISPONIVEIS')
        const pontos = rows.map(row => {
            if (String(row.base).toUpperCase() !== base || String(row.quote).toUpperCase() !== destino) throw error('RESPOSTA_INVALIDA')
            return { data: v.date(row.date), valor: v.requiredNumber(row.rate) }
        }).sort((a, b) => a.data.localeCompare(b.data))
        return normalize('cambio_referencia', 'Frankfurter (taxa combinada de fontes oficiais)', result, { base, destino, pontos }, { dataReferencia: pontos.at(-1).data, unidade: `${destino} por ${base}`, maxAgeDays: 7, observacoes: ['Referência diária, não cotação intradiária nem preço de compra/venda ao consumidor.'] })
    }
    return { cambio }
}
module.exports = { createFrankfurter }
