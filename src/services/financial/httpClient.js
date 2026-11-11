// Somente dados públicos de mercado entram no cache; nunca histórico do usuário.
const caches = new WeakMap()
const consumption = new WeakMap()
const ORIGINS = new Set(['https://brasilapi.com.br', 'https://brapi.dev', 'https://api.hgbrasil.com', 'https://api.bcb.gov.br', 'https://olinda.bcb.gov.br', 'https://api.frankfurter.dev'])
const error = (code, status = null) => Object.assign(new Error(code), { code, status })
const setting = (env, name, fallback, max) => {
    const value = Number(env[name])
    return env[name] !== undefined && Number.isFinite(value) && value >= 0 ? Math.min(value, max) : fallback
}
const sleep = (ms, signal) => new Promise((resolve, reject) => {
    signal?.throwIfAborted()
    const onAbort = () => { clearTimeout(timer); reject(signal.reason) }
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve() }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
})
async function readJson(response, maxBytes = 1000000) {
    if (!response.body || Number(response.headers.get('content-length')) > maxBytes) throw error('RESPOSTA_INVALIDA')
    const reader = response.body.getReader()
    let bytes = 0
    let text = ''
    const decoder = new TextDecoder()
    try {
        while (true) {
            const { value, done } = await reader.read()
            if (done) break
            bytes += value.byteLength
            if (bytes > maxBytes) throw error('RESPOSTA_GRANDE')
            text += decoder.decode(value, { stream: true })
        }
        text += decoder.decode()
        try { return JSON.parse(text) } catch { throw error('RESPOSTA_INVALIDA') }
    } finally { await reader.cancel().catch(() => {}) }
}
function createClient(env = {}, { fetchImpl = fetch, signal, now = () => Date.now() } = {}) {
    if (!caches.has(env)) caches.set(env, new Map())
    const cache = caches.get(env)
    if (!consumption.has(env)) consumption.set(env, { active: 0, day: '', requests: 0 })
    const usage = consumption.get(env)
    const stats = { requests: 0, cacheHits: 0, retries: 0, failures: 0 }
    const ttlFor = (kind) => setting(env, `FINANCIAL_TTL_${kind.toUpperCase()}`, { quote: 60, rates: 3600, history: 21600, banks: 86400, fipe: 86400 }[kind] || 300, 604800)
    const maxRequests = setting(env, 'FINANCIAL_MAX_HTTP_CALLS', 8, 12)
    const retries = setting(env, 'FINANCIAL_HTTP_RETRIES', 1, 2)
    async function get(provider, path, query = {}, { headers = {}, kind = 'quote', validate = () => {}, ttl = ttlFor(kind) } = {}) {
        signal?.throwIfAborted()
        const base = { brasilapi: 'https://brasilapi.com.br', brapi: 'https://brapi.dev', hgbrasil: 'https://api.hgbrasil.com', bcb: 'https://api.bcb.gov.br', olinda: 'https://olinda.bcb.gov.br', frankfurter: 'https://api.frankfurter.dev' }[provider]
        if (!base || !path.startsWith('/') || path.startsWith('//') || path.includes('..') || path.includes('://')) throw error('URL_NAO_PERMITIDA')
        const url = new URL(path, base)
        if (!ORIGINS.has(url.origin) || url.origin !== base) throw error('URL_NAO_PERMITIDA')
        for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
        // A chave só existe na URL interna; nunca é retornada ou registrada.
        const cacheKey = `${provider}:${path}:${JSON.stringify(Object.entries(query).filter(([key]) => key !== 'key').sort())}`
        const cached = cache.get(cacheKey)
        if (cached && cached.expires > now()) {
            stats.cacheHits++
            return { ...cached.value, cache: true }
        }
        if (cached) cache.delete(cacheKey)
        for (let attempt = 0; attempt <= retries; attempt++) {
            signal?.throwIfAborted()
            if (stats.requests >= maxRequests) throw error('LIMITE_CONSULTAS')
            stats.requests++
            let response
            if (usage.active >= setting(env, 'FINANCIAL_MAX_CONCURRENT', 4, 8)) throw error('CONCORRENCIA_EXCEDIDA')
            const day = new Date(now()).toISOString().slice(0, 10)
            if (usage.day !== day) { usage.day = day; usage.requests = 0 }
            if (usage.requests >= setting(env, 'FINANCIAL_MAX_DAILY_HTTP', 100, 100000)) throw error('ORCAMENTO_DIARIO_EXCEDIDO')
            usage.active++; usage.requests++
            try {
                const timeout = AbortSignal.timeout(Math.max(100, setting(env, 'FINANCIAL_HTTP_TIMEOUT_MS', 6000, 15000)))
                response = await fetchImpl(url.href, { headers: { Accept: 'application/json', ...headers }, redirect: 'error', signal: signal ? AbortSignal.any([signal, timeout]) : timeout })
                if (!response.ok) {
                    const status = response.status
                    await response.body?.cancel().catch(() => {})
                    throw error(({ 400: 'PARAMETROS_PROVEDOR', 401: 'AUTENTICACAO', 403: 'PLANO_OU_PERMISSAO', 404: 'NAO_ENCONTRADO', 429: 'COTA_EXCEDIDA' })[status] || 'PROVEDOR_INDISPONIVEL', status)
                }
                const data = await readJson(response)
                validate(data)
                const value = { data, consultadoEm: new Date(now()).toISOString(), cache: false }
                if (ttl > 0) {
                    if (cache.size >= 200) cache.delete(cache.keys().next().value)
                    cache.set(cacheKey, { expires: now() + ttl * 1000, value })
                }
                return value
            } catch (cause) {
                signal?.throwIfAborted()
                const safeError = cause.code && typeof cause.code === 'string' ? cause : error('PROVEDOR_INDISPONIVEL')
                const transient = !cause.status || cause.status >= 500 || cause.status === 429
                if (!transient || ['RESPOSTA_INVALIDA', 'RESPOSTA_GRANDE', 'AUTENTICACAO', 'PLANO_OU_PERMISSAO'].includes(safeError.code) || attempt === retries) {
                    stats.failures++
                    throw safeError
                }
                const retryAfter = response?.headers.get('retry-after')
                const wait = retryAfter ? (/^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - now()) : 200 * 2 ** attempt
                // Não esperar longas janelas nem contornar uma cota esgotada.
                if (wait > 2000) { stats.failures++; throw safeError }
                stats.retries++
                await sleep(Math.max(100, Number.isFinite(wait) ? wait : 200), signal)
            } finally { usage.active-- }
        }
    }
    return { get, stats, ttlFor }
}
module.exports = { createClient, error, setting }
