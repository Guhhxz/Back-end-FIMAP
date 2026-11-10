const BASE_URL = process.env.PLUGGY_API_URL || 'https://api.pluggy.ai'
const TIMEOUT_MS = 20_000
const API_KEY_VALIDADE_MS = 110 * 60 * 1000 // a chave vale 2h; renova com folga
const MAX_PAGINAS = 20

class PluggyError extends Error {
    constructor(mensagem, { status = 502, codigo = 'PLUGGY_ERRO' } = {}) {
        super(mensagem)
        this.name = 'PluggyError'
        this.status = status
        this.codigo = codigo
    }
}

let apiKeyEmCache = { valor: null, expiraEm: 0 }
let apiKeyPendente = null

async function obterApiKey() {
    if (apiKeyEmCache.valor && Date.now() < apiKeyEmCache.expiraEm) {
        return apiKeyEmCache.valor
    }
    // evita várias requisições simultâneas a POST /auth (ele tem rate limit próprio)
    if (apiKeyPendente) return apiKeyPendente

    apiKeyPendente = (async () => {
        const clientId = process.env.CLIENT_ID
        const clientSecret = process.env.CLIENT_SECRET
        if (!clientId || !clientSecret) {
            throw new PluggyError('Credenciais do Pluggy não configuradas.', {
                status: 500,
                codigo: 'PLUGGY_CREDENCIAIS_AUSENTES',
            })
        }

        const resposta = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, clientSecret }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        })
        if (!resposta.ok) {
            throw new PluggyError('Falha ao autenticar no Pluggy.', {
                status: 502,
                codigo: 'PLUGGY_AUTH_FALHOU',
            })
        }

        const { apiKey } = await resposta.json()
        apiKeyEmCache = { valor: apiKey, expiraEm: Date.now() + API_KEY_VALIDADE_MS }
        return apiKey
    })().finally(() => {
        apiKeyPendente = null
    })

    return apiKeyPendente
}

/**
 * GET autenticado. `caminho` pode já conter query string (usado no `next` do cursor).
 * Se o Pluggy responder 401/403, renova a API key e tenta uma única vez de novo.
 */
async function pluggyGet(caminho, params, tentativa = 0) {
    const url = new URL(`${BASE_URL}${caminho}`)
    for (const [chave, valor] of Object.entries(params ?? {})) {
        if (valor !== undefined && valor !== null) url.searchParams.set(chave, String(valor))
    }

    const resposta = await fetch(url, {
        headers: { 'X-API-KEY': await obterApiKey(), Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if ((resposta.status === 401 || resposta.status === 403) && tentativa === 0) {
        apiKeyEmCache = { valor: null, expiraEm: 0 }
        return pluggyGet(caminho, params, 1)
    }

    if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}))
        throw new PluggyError(corpo.message || `Pluggy respondeu ${resposta.status}.`, {
            status: resposta.status === 404 ? 404 : 502,
            codigo: corpo.codeDescription || 'PLUGGY_ERRO',
        })
    }

    return resposta.json()
}

async function listarContasCartao(itemId) {
    const corpo = await pluggyGet('/accounts', { itemId, type: 'CREDIT' })
    return (corpo.results ?? []).filter((conta) => conta.type === 'CREDIT')
}

async function listarFaturas(accountId) {
    const corpo = await pluggyGet('/bills', { accountId, pageSize: 500 })
    return corpo.results ?? []
}

/** Nome da instituição (conector) do item, ou null se não vier. */
async function buscarNomeInstituicao(itemId) {
    const item = await pluggyGet(`/items/${encodeURIComponent(itemId)}`)
    return item.connector?.name ?? null
}

/**
 * Transações do cartão via GET /v2/transactions, seguindo o cursor `next`
 * (query string pronta, que se anexa ao caminho como está).
 */
async function listarTransacoes(accountId, { dateFrom, dateTo }) {
    const resultados = []
    let proxima = null

    for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
        const corpo = proxima
            ? await pluggyGet(`/v2/transactions${proxima}`)
            : await pluggyGet('/v2/transactions', { accountId, dateFrom, dateTo })

        resultados.push(...(corpo.results ?? []))
        proxima = corpo.next
        if (!proxima) break
    }

    return resultados
}

/** Todas as categorias do Pluggy (traduções em pt e categoria-pai). */
async function listarCategorias() {
    const categorias = []
    let total = Infinity

    for (let pagina = 1; pagina <= MAX_PAGINAS && categorias.length < total; pagina++) {
        const corpo = await pluggyGet('/categories', { page: pagina })
        const resultados = corpo.results ?? []
        if (resultados.length === 0) break

        categorias.push(...resultados)
        total = typeof corpo.total === 'number' ? corpo.total : categorias.length
    }

    return categorias
}

module.exports = {
    PluggyError,
    listarContasCartao,
    listarFaturas,
    buscarNomeInstituicao,
    listarTransacoes,
    listarCategorias,
}