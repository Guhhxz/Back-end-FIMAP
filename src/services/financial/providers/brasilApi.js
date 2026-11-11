const { error } = require('../httpClient')
const v = require('../validation')
const { normalize } = require('../financialDataNormalizer')
function createBrasilApi(client) {
    async function taxas({ sigla } = {}) {
        const result = await client.get('brasilapi', '/api/taxas/v1', {}, { kind: 'rates' })
        if (!Array.isArray(result.data) || result.data.some(row => typeof row.nome !== 'string' || v.numeric(row.valor) === null)) throw error('RESPOSTA_INVALIDA')
        const rows = sigla ? result.data.filter(row => row.nome.toUpperCase() === sigla) : result.data
        if (!rows.length) throw error('DADOS_INDISPONIVEIS')
        return normalize('taxas', 'BrasilAPI', result, rows.map(row => ({ nome: row.nome, valor: row.valor, unidade: null })), { observacoes: ['Este endpoint não informa unidade nem data de referência. Confirme a série SGS antes de usar a taxa em cálculos.'] })
    }
    async function bancos({ codigo } = {}) {
        if (codigo !== undefined) v.integer(codigo, 'codigo', 0, 999)
        const result = await client.get('brasilapi', '/api/banks/v1' + (codigo === undefined ? '' : `/${codigo}`), {}, { kind: 'banks' })
        const rows = codigo === undefined ? result.data : [result.data]
        if (!Array.isArray(rows) || rows.some(row => typeof row.name !== 'string')) throw error('RESPOSTA_INVALIDA')
        return normalize('instituicao_financeira', 'BrasilAPI', result, rows.map(row => ({ codigo: row.code ?? null, nome: row.name, nomeCompleto: row.fullName || null, ispb: row.ispb || null })))
    }
    async function cadastro({ recurso }) {
        const paths = { moedas: '/api/cambio/v1/moedas', pix: '/api/pix/v1/participants', acoes: '/api/tickers/b3/acoes/v1' }
        if (!Object.hasOwn(paths, recurso)) throw error('RECURSO_INVALIDO')
        const result = await client.get('brasilapi', paths[recurso], {}, { kind: 'banks' })
        if (!Array.isArray(result.data)) throw error('RESPOSTA_INVALIDA')
        return normalize('cadastro_' + recurso, 'BrasilAPI', result, result.data.slice(0, 100), { observacoes: [`Primeiros ${Math.min(100, result.data.length)} de ${result.data.length} registros; lista pode ser parcial. Cadastro não é cotação.`] })
    }
    async function cambio({ moeda, data }) {
        v.text(moeda, 'moeda', /^[A-Z]{3}$/); v.date(data)
        const result = await client.get('brasilapi', `/api/cambio/v1/cotacao/${moeda}/${data}`, {}, { kind: 'history' })
        if (result.data.moeda !== moeda || !Array.isArray(result.data.cotacoes) || !result.data.cotacoes.length) throw error('RESPOSTA_INVALIDA')
        const rows = result.data.cotacoes
        const row = rows.findLast(item => /fechamento/i.test(item.tipo_boletim)) || rows.at(-1)
        return normalize('cotacao_ptax', 'BrasilAPI / Banco Central', result, { moeda, moedaDestino: 'BRL', compra: v.requiredNumber(row.cotacao_compra), venda: v.requiredNumber(row.cotacao_venda), boletim: row.tipo_boletim || null }, { dataReferencia: result.data.data, unidade: `BRL por ${moeda}`, maxAgeDays: 7 })
    }
    async function fipe({ recurso = 'preco', tipo = 'carros', codigoFipe, marca, modelo, ano }) {
        if (!['carros', 'motos', 'caminhoes'].includes(tipo)) throw error('TIPO_VEICULO_INVALIDO')
        let path
        if (recurso === 'preco') { v.text(codigoFipe, 'codigoFipe', /^\d{6}-\d$/); path = `/api/fipe/preco/v1/${codigoFipe}` }
        else if (recurso === 'marcas') path = `/api/fipe/marcas/v1/${tipo}`
        else {
            v.integer(marca, 'marca', 1, 99999)
            path = `/api/fipe/veiculos/v1/${tipo}/${marca}`
            if (recurso === 'anos' || recurso === 'detalhes') {
                v.integer(modelo, 'modelo', 1, 999999)
                path = `/api/fipe/anos/v1/${tipo}/${marca}/${modelo}`
            }
            if (recurso === 'detalhes') { v.text(ano, 'ano', /^\d{4,5}-\d$/); path = `/api/fipe/detalhes/v1/${tipo}/${marca}/${modelo}/${ano}` }
            if (!['modelos', 'anos', 'detalhes'].includes(recurso)) throw error('RECURSO_INVALIDO')
        }
        const result = await client.get('brasilapi', path, {}, { kind: 'fipe' })
        if (!result.data || typeof result.data !== 'object') throw error('RESPOSTA_INVALIDA')
        const rows = Array.isArray(result.data) ? result.data : [result.data]
        return normalize('fipe_' + recurso, 'BrasilAPI / FIPE', result, rows.slice(0, 100), { unidade: recurso === 'preco' || recurso === 'detalhes' ? 'BRL (valor formatado pelo provedor)' : null, observacoes: ['Preço de referência, não oferta de venda. Confira ano, versão, combustível e mês de referência em cada registro. Lista limitada a 100 itens.'] })
    }
    return { taxas, bancos, cadastro, cambio, fipe }
}
module.exports = { createBrasilApi }
