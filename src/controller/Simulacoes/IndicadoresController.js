// GET /v1/simulacoes/indicadores → { cdi, ipca, poupanca } em % ao ano (números, corpo cru)
// Fonte: API de séries temporais (SGS) do Banco Central, com cache em memória.
const BCB_URL = (serie, burlarCache = false) =>
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json` +
    (burlarCache ? `&_=${Date.now()}` : '')

const SERIES = {
    cdi: 4389, // CDI anualizado (base 252), % a.a.
    ipca: 13522, // IPCA acumulado em 12 meses, %
    poupanca: 195, // Poupança (depósitos desde 04/05/2012): rentabilidade no período (mensal), %
    selic: 432 // meta Selic, % a.a. — só para estimar a poupança se a série 195 falhar
}

const TTL_MS = 60 * 60 * 1000 // 1 h
const TIMEOUT_MS = 5000

const arredondar = (valor) => Math.round(valor * 100) / 100
// Poupança vem como taxa mensal (0,5% + TR); o front espera % a.a. (0,5% a.m. ≈ 6,17% a.a.)
const mensalParaAnual = (mensal) => arredondar(((1 + mensal / 100) ** 12 - 1) * 100)

let cache = null // { dados, expiraEm }
let emAndamento = null

// último valor lido de cada série (reaproveitado se o BCB/CDN responder 304)
const ultimosValores = new Map()

const requisitar = (serie, burlarCache = false) =>
    fetch(BCB_URL(serie, burlarCache), {
        // evita respostas condicionais/cacheadas por intermediários
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS)
    })

const buscarUltimoValor = async (serie) => {
    let resposta = await requisitar(serie)
    // 304 não traz corpo: tenta uma vez de novo e, se persistir, usa o último valor conhecido
    if (resposta.status === 304) resposta = await requisitar(serie, true)
    if (resposta.status === 304 && ultimosValores.has(serie)) return ultimosValores.get(serie)
    if (!resposta.ok) {
        throw new Error(
            `BCB SGS ${serie}: HTTP ${resposta.status} ${resposta.statusText} (${resposta.url})`
        )
    }

    const [ultimo] = await resposta.json()
    // o SGS devolve o valor como string com ponto decimal
    const valor = Number(ultimo?.valor)
    if (!Number.isFinite(valor)) throw new Error(`BCB SGS ${serie}: valor inválido`)
    ultimosValores.set(serie, valor)
    return valor
}

// Poupança: série 195; se falhar, aplica a regra oficial sobre a Selic (≤ 8,5% → 70% da Selic;
// acima → 0,5% a.m. + TR, aqui sem a TR, que é ~0).
const buscarPoupancaAnual = async () => {
    try {
        return mensalParaAnual(await buscarUltimoValor(SERIES.poupanca))
    } catch (error) {
        console.error('Poupança (série 195) indisponível, estimando pela Selic:', error.message)
        const selic = await buscarUltimoValor(SERIES.selic)
        return selic > 8.5 ? mensalParaAnual(0.5) : arredondar(selic * 0.7)
    }
}

const atualizar = async () => {
    const [cdi, ipca, poupanca] = await Promise.all([
        buscarUltimoValor(SERIES.cdi),
        buscarUltimoValor(SERIES.ipca),
        buscarPoupancaAnual()
    ])
    const dados = { cdi: arredondar(cdi), ipca: arredondar(ipca), poupanca }
    cache = { dados, expiraEm: Date.now() + TTL_MS }
    return dados
}

const obterIndicadores = async () => {
    if (cache && cache.expiraEm > Date.now()) return cache.dados

    // várias requisições simultâneas compartilham a mesma consulta ao BCB
    emAndamento ??= atualizar().finally(() => {
        emAndamento = null
    })

    try {
        return await emAndamento
    } catch (error) {
        // BCB fora do ar: serve o último valor conhecido, mesmo vencido
        if (cache) return cache.dados
        throw error
    }
}

const consultarIndicadores = async (req, res) => {
    try {
        return res.status(200).json(await obterIndicadores())
    } catch (error) {
        console.error('Erro ao consultar indicadores:', error)
        return res
            .status(502)
            .json({ sucesso: false, mensagem: 'Indicadores indisponíveis no momento.' })
    }
}

// exposto só para testes
const _limparCache = () => {
    cache = null
    emAndamento = null
    ultimosValores.clear()
}

module.exports = { consultarIndicadores, _limparCache }