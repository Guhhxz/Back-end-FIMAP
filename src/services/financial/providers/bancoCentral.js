const { error } = require('../httpClient')
const v = require('../validation')
const { normalize } = require('../financialDataNormalizer')
// Unidades e periodicidades são explícitas: DI diária não é taxa anual.
const SERIES = {
    11: { nome: 'Selic efetiva diária', unidade: '% ao dia', periodicidade: 'diaria' },
    432: { nome: 'Meta Selic', unidade: '% ao ano', periodicidade: 'diaria' },
    12: { nome: 'CDI / DI diário', unidade: '% ao dia', periodicidade: 'diaria' },
    433: { nome: 'IPCA', unidade: '% no mês', periodicidade: 'mensal' },
    189: { nome: 'IGP-M', unidade: '% no mês', periodicidade: 'mensal' },
    21082: { nome: 'Inadimplência da carteira de crédito - Total', unidade: '% da carteira com atraso superior a 90 dias', periodicidade: 'mensal' }
}
function createBancoCentral(client) {
    async function serie({ codigo, inicio, fim }) {
        if (!Object.hasOwn(SERIES, codigo)) throw error('SERIE_NAO_PERMITIDA')
        const meta = SERIES[codigo]
        const today = new Date().toISOString().slice(0, 10)
        fim = fim || today
        inicio = inicio || new Date(Date.parse(fim) - (meta.periodicidade === 'diaria' ? 15 : 400) * 86400000).toISOString().slice(0, 10)
        v.period(inicio, fim, 3650)
        const br = d => d.split('-').reverse().join('/')
        const result = await client.get('bcb', `/dados/serie/bcdata.sgs.${codigo}/dados`, { formato: 'json', dataInicial: br(inicio), dataFinal: br(fim) }, { kind: inicio === today ? 'rates' : 'history', validate(data) { if (!Array.isArray(data) || !data.length) throw error('DADOS_INDISPONIVEIS') } })
        const pontos = result.data.map(row => {
            if (typeof row.valor !== 'string' || !/^-?\d+(\.\d+)?$/.test(row.valor)) throw error('RESPOSTA_INVALIDA')
            return { data: v.brDate(row.data), valor: v.requiredNumber(Number(row.valor)) }
        }).sort((a, b) => a.data.localeCompare(b.data))
        return normalize('serie_economica', 'Banco Central / SGS', result, { codigo: Number(codigo), ...meta, pontos }, { dataReferencia: pontos.at(-1).data, unidade: meta.unidade, maxAgeDays: meta.periodicidade === 'diaria' ? 7 : 65 })
    }
    async function ptax({ moeda, data }) {
        v.text(moeda, 'moeda', /^[A-Z]{3}$/); v.date(data)
        const [year, month, day] = data.split('-')
        const result = await client.get('olinda', '/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)', { '@moeda': `'${moeda}'`, '@dataCotacao': `'${month}-${day}-${year}'`, '$format': 'json', '$top': 20 }, { kind: 'history' })
        if (!Array.isArray(result.data.value) || !result.data.value.length) throw error('DADOS_INDISPONIVEIS')
        const rows = result.data.value
        // Fechamento é preferido; nunca renomear boletim intermediário como PTAX final.
        const row = rows.findLast(item => /fechamento/i.test(item.tipoBoletim)) || rows.at(-1)
        return normalize('cotacao_ptax', 'Banco Central / PTAX', result, { moeda, moedaDestino: 'BRL', compra: v.requiredNumber(row.cotacaoCompra), venda: v.requiredNumber(row.cotacaoVenda), boletim: row.tipoBoletim || null, horarioLocal: row.dataHoraCotacao || null }, { dataReferencia: row.dataHoraCotacao?.slice(0, 10), unidade: `BRL por ${moeda}`, maxAgeDays: 7, observacoes: ['Taxa de referência; não é oferta de câmbio ao consumidor. Horário do boletim em Brasília.'] })
    }
    async function modalidades() {
        const result = await client.get('olinda', '/olinda/servico/taxaJuros/versao/v2/odata/ParametrosConsulta', { '$format': 'json', '$top': 200 }, { kind: 'banks' })
        if (!Array.isArray(result.data.value)) throw error('RESPOSTA_INVALIDA')
        return normalize('modalidades_credito', 'Banco Central / Taxas de juros', result, result.data.value.map(row => ({ codigo: row.codigoModalidade, nome: row.modalidade, segmento: row.codigoSegmento, tipo: row.tipoModalidade })))
    }
    async function credito({ codigoModalidade, segmento = '1', mensal = false }) {
        v.text(codigoModalidade, 'codigoModalidade', /^\d{1,6}$/)
        v.text(segmento, 'segmento', /^[12]$/)
        const catalog = await modalidades()
        const mode = catalog.dados.find(row => row.codigo === codigoModalidade && row.segmento === segmento && row.tipo === (mensal ? 'M' : 'D'))
        if (!mode) throw error('MODALIDADE_NAO_DISPONIVEL')
        const resource = mensal ? 'TaxasJurosMensalPorMes' : 'TaxasJurosDiariaPorInicioPeriodo'
        const result = await client.get('olinda', `/olinda/servico/taxaJuros/versao/v2/odata/${resource}`, { '$format': 'json', '$top': 100, '$orderby': mensal ? 'anoMes desc,Posicao asc' : 'InicioPeriodo desc,Posicao asc', '$filter': mensal ? `Modalidade eq '${String(mode.nome).replace(/'/g, "''")}'` : `codigoModalidade eq '${codigoModalidade}' and codigoSegmento eq '${segmento}'` }, { kind: 'rates' })
        if (!Array.isArray(result.data.value) || !result.data.value.length) throw error('DADOS_INDISPONIVEIS')
        const rows = result.data.value
        const reference = mensal ? rows[0].anoMes : rows[0].InicioPeriodo
        const current = rows.filter(row => (mensal ? row.anoMes : row.InicioPeriodo) === reference)
        return normalize('taxas_credito', 'Banco Central / Taxas de juros', result, { modalidade: mode.nome, segmento, limitadoA: 100, instituicoes: current.map(row => ({ instituicao: row.InstituicaoFinanceira, taxaMensalPercentual: v.numeric(row.TaxaJurosAoMes), taxaAnualPercentual: v.numeric(row.TaxaJurosAoAno), inicioPeriodo: row.InicioPeriodo || row.anoMes, fimPeriodo: row.FimPeriodo || null })) }, { dataReferencia: mensal ? reference + '-01' : reference, unidade: '% ao mês e % ao ano, em campos separados', maxAgeDays: mensal ? 65 : 20, observacoes: ['Taxas médias divulgadas por instituição. Não são ofertas personalizadas nem CET. Resultado limitado às primeiras 100 linhas, sem garantia de cobrir todas as instituições.'] })
    }
    return { serie, ptax, modalidades, credito }
}
module.exports = { createBancoCentral, SERIES }
