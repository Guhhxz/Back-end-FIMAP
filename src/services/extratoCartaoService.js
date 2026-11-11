// Reaproveita a checagem de sincronização que você já usa em listarContas.
// Ela precisa estar exportada pelo pluggyService (ajuste o caminho se o arquivo for outro).
const { verificarSincronizacao } = require('./pluggyService.js')

const pluggyApi = require('./extratoCartao/pluggyApi')
const mapper = require('./extratoCartao/extratoCartaoMapper')

const LIMITE_PERIODOS = 6
const TTL_CONTA_E_FATURAS_MS = 60_000
const TTL_TRANSACOES_MS = 30_000
const TTL_CATEGORIAS_MS = 24 * 60 * 60 * 1000
const MAX_ENTRADAS_CACHE = 200

class ErroExtrato extends Error {
    constructor(status, codigo, mensagem) {
        super(mensagem)
        this.name = 'ErroExtrato'
        this.status = status
        this.codigo = codigo
    }
}

// Cache em memória, só para trocar de aba de mês sem bater no Pluggy toda vez.
// (O Pluggy recomenda copiar os dados para o seu banco via webhooks; ver observações.)
const cache = new Map()

function comCache(chave, ttlMs, buscar) {
    const existente = cache.get(chave)
    if (existente && existente.expiraEm > Date.now()) return existente.promessa

    const promessa = buscar().catch((erro) => {
        cache.delete(chave)
        throw erro
    })
    cache.set(chave, { expiraEm: Date.now() + ttlMs, promessa })

    if (cache.size > MAX_ENTRADAS_CACHE) cache.delete(cache.keys().next().value)
    return promessa
}

/**
 * Extrato de uma fatura do cartão.
 * @param {string} itemId   conexão (item) do Pluggy
 * @param {string} cartaoId id da conta de cartão no Pluggy
 * @param {string} [mesSolicitado] AAAA-MM (mês de vencimento); sem ele, usa a fatura atual
 */
const obterExtratoCartao = async (itemId, cartaoId, mesSolicitado) => {
    if (await verificarSincronizacao(itemId)) {
        return { atualizando: true }
    }

    // O cartão precisa pertencer ao item informado (evita ler a conta de outra conexão).
    const contas = await comCache(`contas:${itemId}`, TTL_CONTA_E_FATURAS_MS, () =>
        pluggyApi.listarContasCartao(itemId),
    )
    const conta = contas.find((c) => c.id === cartaoId)
    if (!conta) {
        throw new ErroExtrato(404, 'CARTAO_NAO_ENCONTRADO', 'Cartão não encontrado para esta conexão.')
    }

    const [faturas, categorias, instituicao] = await Promise.all([
        comCache(`faturas:${cartaoId}`, TTL_CONTA_E_FATURAS_MS, () => pluggyApi.listarFaturas(cartaoId)),
        comCache('categorias', TTL_CATEGORIAS_MS, () => pluggyApi.listarCategorias()),
        comCache(`instituicao:${itemId}`, TTL_CATEGORIAS_MS, () =>
            pluggyApi.buscarNomeInstituicao(itemId).catch(() => null),
        ),
    ])

    const hoje = mapper.hojeBrasil()
    const todosPeriodos = mapper.construirPeriodos(faturas, conta, hoje)
    const periodosVisiveis = todosPeriodos.slice(0, LIMITE_PERIODOS)

    if (periodosVisiveis.length === 0) {
        throw new ErroExtrato(404, 'FATURA_INDISPONIVEL', 'Nenhuma fatura encontrada para este cartão.')
    }

    const periodo = mesSolicitado
        ? periodosVisiveis.find((p) => p.mes === mesSolicitado)
        : mapper.escolherPeriodoPadrao(periodosVisiveis)
    if (!periodo) {
        throw new ErroExtrato(404, 'PERIODO_NAO_ENCONTRADO', 'Não há fatura para o mês informado.')
    }

    const indice = todosPeriodos.indexOf(periodo)
    const fechamentoAnterior = todosPeriodos[indice + 1]?.fechamento ?? null
    const janela = mapper.janelaDeBusca(periodo, fechamentoAnterior)

    const transacoes = await comCache(
        `transacoes:${cartaoId}:${janela.dateFrom}:${janela.dateTo}`,
        TTL_TRANSACOES_MS,
        () => pluggyApi.listarTransacoes(cartaoId, janela),
    )

    const classificadas = transacoes.map((tx) => ({ tx, classe: mapper.classificarTransacao(tx) }))
    const doPeriodo = classificadas.filter(({ tx, classe }) =>
        mapper.pertenceAoPeriodo(tx, classe, periodo, fechamentoAnterior),
    )
    const historico = classificadas.filter((item) => !doPeriodo.includes(item))

    const indiceCategorias = mapper.indexarCategorias(categorias)
    const lancamentos = mapper.ordenarPorDataDesc(
        mapper.marcarRecorrentes(
            doPeriodo.map(({ tx, classe }) => mapper.mapearLancamento(tx, classe, indiceCategorias)),
            historico,
        ),
    )

    return {
        atualizando: false,
        cartao: {
            id: conta.id,
            nome: conta.name,
            finalNumero: mapper.ultimosQuatroDigitos(conta.number),
            instituicao: conta.institution?.name ?? instituicao,
            // O Pluggy não informa se o cartão é físico ou virtual.
            tipo: null,
        },
        fatura: {
            valorTotal: periodo.valorTotal ?? mapper.somarFatura(lancamentos),
            vencimento: periodo.vencimento,
            status: periodo.status,
        },
        periodos: periodosVisiveis.map((p) => p.mes),
        periodoSelecionado: periodo.mes,
        lancamentos,
    }
}

module.exports = { obterExtratoCartao, ErroExtrato }