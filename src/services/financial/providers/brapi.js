const { error } = require('../httpClient')
const v = require('../validation')
const { normalize } = require('../financialDataNormalizer')
const TEST_SYMBOLS = new Set(['PETR4', 'MGLU3', 'VALE3', 'ITUB4'])
function createBrapi(client, env) {
    function auth(symbol, resource) {
        if (!env.BRAPI_TOKEN && (resource !== 'quote' || !TEST_SYMBOLS.has(symbol))) throw error('CHAVE_AUSENTE')
        return env.BRAPI_TOKEN ? { Authorization: `Bearer ${env.BRAPI_TOKEN}` } : {}
    }
    async function acao({ simbolo, recurso = 'quote', inicio, fim }) {
        v.text(simbolo, 'simbolo', /^[A-Z][A-Z0-9]{3,9}$/)
        if (!['quote', 'historical', 'dividends', 'statistics', 'financial-data', 'balance-sheet', 'income-statement'].includes(recurso)) throw error('RECURSO_INVALIDO')
        if (inicio || fim) v.period(inicio, fim, 366)
        const headers = auth(simbolo, recurso)
        const params = { symbols: simbolo }
        if (recurso !== 'quote') {
            if (inicio) { params.startDate = inicio; params.endDate = fim }
            if (recurso === 'historical') { params.range = inicio ? undefined : '1mo'; params.interval = '1d'; params.sortOrder = 'asc' }
            if (['statistics', 'financial-data', 'balance-sheet', 'income-statement'].includes(recurso)) { params.period = 'annual'; params.mode = 'current' }
        }
        const result = await client.get('brapi', `/api/v2/stocks/${recurso}`, params, { headers, kind: recurso === 'quote' ? 'quote' : 'history', validate(data) { if (data?.error) throw error('ERRO_PROVEDOR') } })
        if (!Array.isArray(result.data.results)) throw error('RESPOSTA_INVALIDA')
        const item = result.data.results.find(row => row.requestedSymbol === simbolo || row.symbol === simbolo)
        if (!item?.data || item.error) throw error('DADOS_INDISPONIVEIS')
        const data = item.data
        const identity = { solicitado: simbolo, ativo: item.symbol, tickerAlterado: item.changed === true }
        if (recurso === 'quote') return normalize('cotacao_ativo', 'brapi', result, { ...identity, valor: v.requiredNumber(data.regularMarketPrice), moeda: typeof data.currency === 'string' ? data.currency : null, variacaoPercentual: v.numeric(data.regularMarketChangePercent) }, { dataReferencia: data.regularMarketTime, unidade: data.currency || null, maxAgeDays: 5, observacoes: ['Cotação sujeita ao atraso do plano e ao horário do mercado.'] })
        let dados, reference = null
        if (recurso === 'historical') {
            if (!Array.isArray(data.historicalDataPrice)) throw error('RESPOSTA_INVALIDA')
            const rows = data.historicalDataPrice
            dados = { ...identity, intervalo: data.usedInterval || null, totalPontos: rows.length, pontos: rows.slice(-260).map(row => ({ data: Number.isFinite(row.date) ? new Date(row.date * 1000).toISOString() : null, fechamento: v.numeric(row.close), fechamentoAjustado: v.numeric(row.adjustedClose), volume: v.numeric(row.volume) })) }
            reference = dados.pontos.at(-1)?.data
        } else if (recurso === 'dividends') {
            if (!Array.isArray(data.cashDividends)) throw error('RESPOSTA_INVALIDA')
            dados = { ...identity, eventos: data.cashDividends.slice(0, 60).map(row => ({ dataPagamento: v.isoDate(row.paymentDate), dataEx: v.isoDate(row.exDate), valorPorAcao: v.numeric(row.rate), tipo: typeof row.label === 'string' ? row.label.slice(0, 40) : null })) }
        } else {
            // Somente números e datas conhecidas são transmitidos; nada de resposta bruta.
            const fields = ['enterpriseValue', 'profitMargins', 'bookValue', 'priceToBook', 'trailingEps', 'beta', 'totalCash', 'totalDebt', 'totalRevenue', 'ebitda', 'returnOnAssets', 'returnOnEquity', 'freeCashflow', 'operatingCashflow', 'netIncome', 'netIncomeToCommon', 'totalAssets', 'totalLiab', 'cash', 'totalCurrentAssets', 'totalStockholderEquity', 'totalLiabilitiesNetMinorityInterest', 'stockholdersEquity', 'grossProfit', 'operatingIncome', 'basicEPS', 'dilutedEPS']
            const sourceRows = Array.isArray(data) ? data : [data]
            const demonstrativos = sourceRows.slice(0, 5).map(row => ({
                data: v.isoDate(row.endDate) || v.isoDate(row.mostRecentQuarter),
                indicadores: Object.fromEntries(fields.filter(key => Object.hasOwn(row, key)).map(key => [key, v.numeric(row[key])]))
            }))
            if (!demonstrativos.some(row => Object.keys(row.indicadores).length)) throw error('DADOS_INDISPONIVEIS')
            dados = { ...identity, demonstrativos }
            reference = demonstrativos[0].data
        }
        return normalize('ativo_' + recurso, 'brapi', result, dados, { dataReferencia: reference, observacoes: ['Consulte a unidade de cada indicador; razões como ROE e margens podem ser frações, não pontos percentuais. Resultados podem ser parciais e dependem do plano.'] })
    }
    async function cripto({ simbolo, moeda = 'BRL' }) {
        v.text(simbolo, 'simbolo', /^[A-Z0-9]{2,10}$/); v.text(moeda, 'moeda', /^[A-Z]{3}$/)
        if (!env.BRAPI_TOKEN) throw error('CHAVE_AUSENTE')
        const result = await client.get('brapi', '/api/v2/crypto', { coin: simbolo, currency: moeda }, { headers: { Authorization: `Bearer ${env.BRAPI_TOKEN}` } })
        const coin = result.data.coins?.find(row => row.coin === simbolo)
        if (!coin || coin.currency !== moeda) throw error('DADOS_INDISPONIVEIS')
        return normalize('cotacao_cripto', 'brapi', result, { ativo: simbolo, moeda, valor: v.requiredNumber(coin.regularMarketPrice), variacaoPercentual: v.numeric(coin.regularMarketChangePercent) }, { dataReferencia: coin.regularMarketTime, unidade: moeda, maxAgeDays: 1 })
    }
    return { acao, cripto }
}
module.exports = { createBrapi }
