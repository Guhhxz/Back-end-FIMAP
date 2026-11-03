const GEOAPIFY_BASE_URL = 'https://api.geoapify.com'
const TIMEOUT_MS = 10000

const categorias = [
    { categoria: 'sport.fitness', termos: ['academia', 'academias', 'ginásio', 'ginasio'] },
    { categoria: 'commercial.supermarket', termos: ['mercado', 'mercados', 'supermercado', 'supermercados'] },
    { categoria: 'commercial.shopping_mall', termos: ['shopping', 'shopping center', 'shopping centers', 'shopping mall', 'shoppings'] },
    { categoria: 'commercial.clothing', termos: ['loja de roupa', 'lojas de roupa', 'loja de roupas', 'lojas de roupas', 'roupa', 'roupas'] },
    { categoria: 'commercial', termos: ['loja', 'lojas', 'comércio', 'comercio'] }
]

const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const identificarCategoria = (mensagem) => {
    const texto = normalizar(mensagem)
    return categorias.find(({ termos }) => termos.some((termoOriginal) => {
        const termo = normalizar(termoOriginal)
        const padrao = new RegExp(`(^|\\W)${termo}($|\\W)`)
        return padrao.test(texto)
    }))
}

const identificarLocal = (mensagem) => {
    const texto = mensagem.trim()
    const perto = texto.match(/\b(?:perto\s+de|pr[oó]xim[oa]s?\s+(?:de|a)|nas\s+proximidades\s+de)\s+(.+?)\s*[?.!,;]*$/i)
    const em = texto.match(/\b(?:em|no|na|nos|nas)\s+(.+?)\s*[?.!,;]*$/i)
    const local = (perto?.[1] || em?.[1] || '').trim()
    if (!local || /^(mim|me|mim aqui|aqui|perto daqui)$/i.test(normalizar(local))) return null
    return local.replace(/\s+(?:por exemplo|por favor|pra mim)$/i, '').replace(/\s+/g, ' ')
}

const respostaLugares = async (mensagem, apiKey = process.env.GEOAPIFY_API_KEY) => {
    const categoria = identificarCategoria(mensagem)
    if (!categoria) return null

    const local = identificarLocal(mensagem)
    if (!local) {
        return 'Para procurar estabelecimentos reais, me diga a cidade e o estado ou bairro. Não tenho acesso automático à localização do seu dispositivo.'
    }
    if (!apiKey) {
        return 'A busca de estabelecimentos ainda não está configurada no servidor. Configure GEOAPIFY_API_KEY para consultar lugares reais.'
    }

    const controlador = new AbortController()
    const timeout = setTimeout(() => controlador.abort(), TIMEOUT_MS)
    try {
        const geocodeUrl = new URL('/v1/geocode/search', GEOAPIFY_BASE_URL)
        geocodeUrl.search = new URLSearchParams({
            text: `${local}, Brasil`,
            filter: 'countrycode:br',
            format: 'json',
            limit: '1',
            apiKey
        }).toString()
        const geocodeResponse = await fetch(geocodeUrl, { signal: controlador.signal })
        if (!geocodeResponse.ok) throw new Error(`Geocoding respondeu ${geocodeResponse.status}`)
        const geocodeData = await geocodeResponse.json()
        const localEncontrado = geocodeData.results?.[0]
        if (!localEncontrado || !Number.isFinite(localEncontrado.lat) || !Number.isFinite(localEncontrado.lon)) {
            return `Não encontrei a região “${local}” no Brasil. Confira o nome da cidade, estado ou bairro e tente novamente.`
        }

        const placesUrl = new URL('/v2/places', GEOAPIFY_BASE_URL)
        placesUrl.search = new URLSearchParams({
            categories: categoria.categoria,
            filter: localEncontrado.place_id
                ? `place:${localEncontrado.place_id}`
                : `circle:${localEncontrado.lon},${localEncontrado.lat},10000`,
            bias: `proximity:${localEncontrado.lon},${localEncontrado.lat}`,
            limit: '10',
            lang: 'pt',
            apiKey
        }).toString()
        const placesResponse = await fetch(placesUrl, { signal: controlador.signal })
        if (!placesResponse.ok) throw new Error(`Places respondeu ${placesResponse.status}`)
        const placesData = await placesResponse.json()
        const lugares = (placesData.features || []).map(({ properties = {} }) => properties)
            .filter((lugar) => lugar.name && (lugar.formatted || lugar.address_line1))
        if (!lugares.length) {
            return `Não encontrei ${categoria.termos[0]} cadastrada(o) na região de ${local}. A base pode não ter todos os estabelecimentos locais.`
        }

        const nomeLocal = [localEncontrado.city, localEncontrado.state]
            .filter(Boolean).join(', ') || localEncontrado.formatted || local
        const linhas = lugares.map((lugar, indice) => {
            const endereco = lugar.formatted || [lugar.address_line1, lugar.address_line2].filter(Boolean).join(', ')
            const distancia = Number.isFinite(lugar.distance)
                ? ` — ${lugar.distance >= 1000 ? `${(lugar.distance / 1000).toFixed(1)} km` : `${Math.round(lugar.distance)} m`} do centro da região`
                : ''
            return `${indice + 1}. **${lugar.name}** — ${endereco}${distancia}`
        })
        return `Encontrei estes estabelecimentos em ${nomeLocal}:\n\n${linhas.join('\n')}\n\nFonte: Geoapify e OpenStreetMap. A cobertura dos dados pode variar por região.`
    } catch (error) {
        console.error('Erro ao consultar lugares na Geoapify:', error.message)
        return 'Não consegui consultar os estabelecimentos agora. Tente novamente em instantes.'
    } finally {
        clearTimeout(timeout)
    }
}

module.exports = { respostaLugares }
