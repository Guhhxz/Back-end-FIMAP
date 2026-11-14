// services/cdiService.js
//
// Ponto único pra resolver "nome do banco" -> "% do CDI do CDB desse banco".
// Ordem de busca: 1) Meelion MCP (gratuito, JSON-RPC) → 2) tabela local de fallback.
// O controller não muda nada, ele só chama `resolverPercentualCdi`.
//
// ⚠️ mcp.meelion.com não está acessível no ambiente onde eu testei esse código, então
// o parsing de `get_financial_indicators` abaixo é defensivo (tenta vários formatos de
// campo plausíveis) e não foi validado contra uma resposta real. Rodar o curl do README
// do Meelion MCP e comparar com o `console.warn` que aparece se o CDI não for encontrado.

const MEELION_MCP_URL = 'https://mcp.meelion.com/'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutos

let cacheCdiAtual = null // { valor, expiraEm }
const cacheInvestimentosPorBanco = new Map() // chaveNormalizada -> { percentual, expiraEm }

async function chamarFerramentaMeelion(nomeFerramenta, args) {
    const resposta = await fetch(MEELION_MCP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: { name: nomeFerramenta, arguments: args }
        })
    })

    const dados = await resposta.json()

    if (dados.error) {
        throw new Error(`Meelion MCP (${nomeFerramenta}): ${dados.error.message}`)
    }

    // O conteúdo estruturado da tool normalmente vem em result.structuredContent (padrão MCP).
    return dados.result?.structuredContent ?? dados.result ?? null
}

// Procura o indicador de CDI/DI numa resposta cujo esquema exato não está confirmado.
function extrairValorCdi(dados) {
    const indicadores = dados?.indicators ?? dados?.indicadores ?? []

    const cdi = indicadores.find((item) => {
        const chave = String(item.slug ?? item.id ?? item.nome ?? item.name ?? '').toLowerCase()
        return chave === 'cdi' || chave === 'di'
    })

    if (!cdi) return null

    const valor = Number(cdi.valor ?? cdi.value ?? cdi.rate ?? cdi.taxa)
    return Number.isNaN(valor) ? null : valor
}

async function obterCdiAtual() {
    const agora = Date.now()
    if (cacheCdiAtual && agora < cacheCdiAtual.expiraEm) {
        return cacheCdiAtual.valor
    }

    const dados = await chamarFerramentaMeelion('get_financial_indicators', {})
    const valor = extrairValorCdi(dados)

    if (valor === null) {
        console.warn(
            'Não consegui achar o valor do CDI na resposta do Meelion MCP (get_financial_indicators). ' +
            'Rode o curl de exemplo do README e confira o campo certo — resposta recebida:',
            JSON.stringify(dados)
        )
        return null
    }

    cacheCdiAtual = { valor, expiraEm: agora + CACHE_TTL_MS }
    return valor
}

// Busca o melhor CDB indexado a CDI daquele banco e expressa a taxa como fração do CDI
// atual (ex.: 1.05 = 105% do CDI), no mesmo formato que o resto do app já espera.
async function buscarMelhorCdbDoBanco(nomeInstituicao) {
    const chave = nomeInstituicao.trim().toLowerCase()
    const agora = Date.now()

    const cacheado = cacheInvestimentosPorBanco.get(chave)
    if (cacheado && agora < cacheado.expiraEm) {
        return cacheado.percentual
    }

    const cdiAtual = await obterCdiAtual()
    if (cdiAtual === null) return null

    const dados = await chamarFerramentaMeelion('get_best_investments', {
        investment_types: 'CDB',
        distributors: nomeInstituicao,
        limit: 5
    })

    const investimentos = dados?.investments ?? []

    // Só nos interessam os pós-fixados atrelados a CDI/DI (não há enum oficial de
    // financialIndex na doc, então o filtro é por substring).
    const candidatosCdi = investimentos.filter((inv) =>
        String(inv.financialIndex ?? '').toUpperCase().includes('CDI') ||
        String(inv.financialIndex ?? '').toUpperCase().includes('DI')
    )

    const percentual = candidatosCdi.length === 0
        ? null
        : candidatosCdi.reduce((atual, inv) => (inv.grossAnnualRate > atual.grossAnnualRate ? inv : atual)).grossAnnualRate / cdiAtual

    cacheInvestimentosPorBanco.set(chave, { percentual, expiraEm: agora + CACHE_TTL_MS })
    return percentual
}

async function buscarNaApiExterna(nomeInstituicao) {
    try {
        return await buscarMelhorCdbDoBanco(nomeInstituicao)
    } catch (error) {
        console.error('Erro ao consultar Meelion MCP:', error)
        return null
    }
}

// ⚠️ Tabela de fallback — só entra em cena quando o Meelion não tem título CDI do banco
// (ex.: "Pluggy Bank", que é instituição de sandbox) ou se o MCP estiver fora do ar.
// Valores aproximados, não vieram de nenhuma fonte real.
const TABELA_LOCAL = {
    'nubank': 1.00,
    'inter': 1.00,
    'c6': 1.00,
    'picpay': 1.00,
    'will': 0.99,
    'next': 0.95,
    'original': 0.98,
    'pluggy': 1.00, // instituição de sandbox/teste do Pluggy
}

function normalizar(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\b(banco|bank|financeira|s\.?a\.?)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

async function resolverPercentualCdi(nomeInstituicao) {
    if (!nomeInstituicao) return null

    try {
        const percentualExterno = await buscarNaApiExterna(nomeInstituicao)
        if (percentualExterno !== null) return percentualExterno
    } catch (error) {
        console.error('Erro ao resolver CDI via Meelion MCP:', error)
    }

    const chaveBusca = normalizar(nomeInstituicao)
    const chaveEncontrada = Object.keys(TABELA_LOCAL).find((chave) => chaveBusca.includes(chave))

    return chaveEncontrada ? TABELA_LOCAL[chaveEncontrada] : null
}

module.exports = { resolverPercentualCdi }
