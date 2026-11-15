// GET /v1/simulacoes/indicadores → { cdi, ipca, poupanca } em % ao ano (números, corpo cru)
// Fonte: API de séries temporais (SGS) do Banco Central, com cache em memória.
const BCB_URL = (serie) =>
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`

const SERIES = {
    cdi: 4389, // CDI anualizado (base 252), % a.a.
    ipca: 13522, // IPCA acumulado em 12 meses, %
    poupanca: 195 // Poupança (depósitos desde 04/05/2012): rentabilidade no período (mensal), %
}

const TTL_MS = 60 * 60 * 1000 // 1 h
const TIMEOUT_MS = 5000

const arredondar = (valor) => Math.round(valor * 100) / 100
// Poupança vem como taxa mensal (0,5% + TR); o front espera % a.a. (0,5% a.m. ≈ 6,17% a.a.)
const mensalParaAnual = (mensal) => arredondar(((1 + mensal / 100) ** 12 - 1) * 100)

let cache = null // { dados, expiraEm }
let emAndamento = null

const buscarUltimoValor = async (serie) => {
    const resposta = await fetch(BCB_URL(serie), { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!resposta.ok) throw new Error(`BCB SGS ${serie}: HTTP ${resposta.status}`)

    const [ultimo] = await resposta.json()
    // o SGS devolve o valor como string com ponto decimal
    const valor = Number(ultimo?.valor)
    if (!Number.isFinite(valor)) throw new Error(`BCB SGS ${serie}: valor inválido`)
    return valor
}

const atualizar = async () => {
    const [cdi, ipca, poupancaMensal] = await Promise.all([
        buscarUltimoValor(SERIES.cdi),
        buscarUltimoValor(SERIES.ipca),
        buscarUltimoValor(SERIES.poupanca)
    ])
    const dados = {
        cdi: arredondar(cdi),
        ipca: arredondar(ipca),
        poupanca: mensalParaAnual(poupancaMensal)
    }
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
}

module.exports = { consultarIndicadores, _limparCache }
