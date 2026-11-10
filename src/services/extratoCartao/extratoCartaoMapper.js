/**
 * Regras do extrato do cartão. Só funções puras (sem rede), para ficarem testáveis.
 * Convenções do Pluggy usadas aqui (docs.pluggy.ai):
 *  - transação de cartão: `type` DEBIT = compra, CREDIT = pagamento/estorno/cashback;
 *    `amount` pode vir com sinal diferente conforme o conector, então usa-se `type` e |amount|;
 *  - `operationType` (cartão): PAGAMENTO, PAGAMENTO_FATURA, ESTORNO, CASHBACK, TARIFA...;
 *  - `creditCardMetadata`: installmentNumber, totalInstallments, billId;
 *  - `date` vem em UTC, muitas vezes como meia-noite (sem hora real).
 */

const DIA_MS = 86_400_000
const FUSO_BRASIL = 'America/Sao_Paulo'
const LIMITE_VALOR_ZERO = 0.005

// ---------------------------------------------------------------- datas

function dataISO10(valor) {
    if (typeof valor !== 'string') return null
    const partes = /^(\d{4}-\d{2}-\d{2})/.exec(valor)
    return partes ? partes[1] : null
}

/** Data de hoje (YYYY-MM-DD) no fuso de Brasília, independente do fuso do servidor. */
function hojeBrasil(agora = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: FUSO_BRASIL,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(agora)
}

function somarDias(iso10, dias) {
    const [ano, mes, dia] = iso10.split('-').map(Number)
    return new Date(Date.UTC(ano, mes - 1, dia) + dias * DIA_MS).toISOString().slice(0, 10)
}

function diasEntre(isoA, isoB) {
    const [anoA, mesA, diaA] = isoA.split('-').map(Number)
    const [anoB, mesB, diaB] = isoB.split('-').map(Number)
    return Math.round((Date.UTC(anoA, mesA - 1, diaA) - Date.UTC(anoB, mesB - 1, diaB)) / DIA_MS)
}

/**
 * O Pluggy manda muitas datas como `T00:00:00.000Z`, o que no Brasil viraria 21h do
 * dia anterior. Sem hora real, envia só a data (o front mostra o dia, sem horário).
 */
function normalizarDataTransacao(valor) {
    if (typeof valor !== 'string') return null
    if (/T00:00:00(\.0+)?Z$/.test(valor)) return valor.slice(0, 10)
    return valor
}

// ---------------------------------------------------------------- números e textos

function numeroOuNull(valor) {
    const numero = Number(valor)
    return valor === null || valor === undefined || !Number.isFinite(numero) ? null : numero
}

function arredondar(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100
}

function ultimosQuatroDigitos(numero) {
    const digitos = String(numero ?? '').replace(/\D/g, '')
    return digitos.length >= 4 ? digitos.slice(-4) : null
}

function semAcento(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

/** Chave estável de descrição: tira acento, parcela ("03/10"), números e pontuação. */
function normalizarDescricao(descricao) {
    return semAcento(descricao)
        .toLowerCase()
        .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, ' ')
        .replace(/[^a-z]+/g, ' ')
        .trim()
}

// ---------------------------------------------------------------- períodos (faturas)

/**
 * Monta a lista de períodos do cartão, do mais recente para o mais antigo.
 * O período é identificado pelo mês de VENCIMENTO da fatura (ex.: vence em 15/10 → "2026-10").
 * Vem de GET /bills; a fatura aberta, quando não consta em /bills, vem das datas da conta.
 */
function construirPeriodos(faturasPluggy, conta, hoje) {
    const periodos = []

    for (const fatura of faturasPluggy ?? []) {
        const vencimento = dataISO10(fatura.dueDate)
        if (!vencimento) continue

        const fechamento = dataISO10(fatura.billClosingDate)
        const valorTotal = numeroOuNull(fatura.totalAmount)
        const pago = (fatura.payments ?? []).reduce((soma, p) => soma + (numeroOuNull(p.amount) ?? 0), 0)
        const jaFechou = fechamento ? hoje > fechamento : hoje > vencimento

        let status = 'aberta'
        if (jaFechou) {
            const quitada = valorTotal === null || valorTotal <= 0 || pago + LIMITE_VALOR_ZERO >= valorTotal
            status = quitada ? 'paga' : 'fechada'
        }

        periodos.push({ mes: vencimento.slice(0, 7), billId: fatura.id ?? null, vencimento, fechamento, valorTotal, status })
    }

    const vencimentoAberto = dataISO10(conta?.creditData?.balanceDueDate)
    if (vencimentoAberto && !periodos.some((p) => p.mes === vencimentoAberto.slice(0, 7))) {
        const fechamento = dataISO10(conta?.creditData?.balanceCloseDate)
        periodos.push({
            mes: vencimentoAberto.slice(0, 7),
            billId: null,
            vencimento: vencimentoAberto,
            fechamento,
            valorTotal: null,
            status: fechamento && hoje > fechamento ? 'fechada' : 'aberta',
        })
    }

    const vistos = new Set()
    return periodos
        .sort((a, b) => b.mes.localeCompare(a.mes))
        .filter((p) => (vistos.has(p.mes) ? false : vistos.add(p.mes)))
}

/** Período padrão: a fatura aberta mais recente; se não houver, a mais recente. */
function escolherPeriodoPadrao(periodos) {
    return periodos.find((p) => p.status === 'aberta') ?? periodos[0] ?? null
}

/**
 * Intervalo de datas a pedir ao Pluggy para montar um período. Além do próprio ciclo,
 * traz ~35 dias do ciclo anterior (histórico usado para inferir lançamentos recorrentes).
 */
function janelaDeBusca(periodo, fechamentoAnterior) {
    const inicioDoCiclo = fechamentoAnterior ?? somarDias(periodo.fechamento ?? periodo.vencimento, -40)
    return {
        dateFrom: somarDias(inicioDoCiclo, -35),
        dateTo: somarDias(periodo.vencimento, 3),
    }
}

// ---------------------------------------------------------------- transações

/** 'compra' | 'pagamento' | 'estorno' */
function classificarTransacao(tx) {
    const operacao = String(tx.operationType ?? '').toUpperCase()
    const credito = tx.type ? tx.type === 'CREDIT' : Number(tx.amount) < 0

    if (operacao === 'PAGAMENTO_FATURA' || operacao === 'PAGAMENTO') return 'pagamento'
    if (!credito) return 'compra'
    if (operacao === 'ESTORNO' || operacao === 'CASHBACK') return 'estorno'
    return /pagamento|pgto/i.test(semAcento(tx.description)) ? 'pagamento' : 'estorno'
}

function dentroDoCiclo(dataTransacao, fechamentoAnterior, fechamento) {
    if (!dataTransacao) return false
    if (fechamentoAnterior && dataTransacao <= fechamentoAnterior) return false
    if (fechamento && dataTransacao > fechamento) return false
    return true
}

/**
 * Compras/estornos: pelo `billId` quando o Pluggy informa; senão pela data, dentro do ciclo
 * (fechamento anterior, fechamento]. Pagamentos de fatura: sempre pela data, porque o
 * pagamento da fatura anterior feito neste ciclo aparece no extrato do mês (como no design).
 */
function pertenceAoPeriodo(tx, classe, periodo, fechamentoAnterior) {
    const data = dataISO10(tx.date)
    const billId = tx.creditCardMetadata?.billId

    if (classe !== 'pagamento' && billId) return billId === periodo.billId
    return dentroDoCiclo(data, fechamentoAnterior, periodo.fechamento)
}

// ---------------------------------------------------------------- categorias

/** Índice id → categoria, a partir de GET /categories. */
function indexarCategorias(categorias) {
    const indice = new Map()
    for (const c of categorias ?? []) {
        indice.set(String(c.id), {
            descricao: c.description ?? null,
            traduzida: c.descriptionTranslated ?? null,
            pai: c.parentDescription ?? null,
            paiTraduzida: c.parentDescriptionTranslated ?? c.parentDescription ?? null,
        })
    }
    return indice
}

// Casa primeiro pela subcategoria (específica) e depois pela categoria-pai. Nomes em inglês,
// como documentados em docs.pluggy.ai/docs/transaction-categories.
const REGRAS_SUBCATEGORIA = [
    { nomes: ['groceries'], categoria: 'Alimentação', icone: 'supermercado' },
    { nomes: ['eating out', 'food delivery'], categoria: 'Alimentação', icone: 'restaurante' },
    { nomes: ['taxi and ride-hailing', 'public transportation', 'car rental', 'bicycle'], categoria: 'Transporte', icone: 'transporte' },
    { nomes: ['video streaming'], categoria: 'Assinatura', icone: 'streaming' },
    { nomes: ['music streaming', 'gaming'], categoria: 'Assinatura', icone: 'assinatura' },
    { nomes: ['pharmacy'], categoria: 'Farmácia & Saúde', icone: 'farmacia' },
    { nomes: ['clothing'], categoria: 'Compras & Vestuário', icone: 'vestuario' },
]

const REGRAS_CATEGORIA_PAI = [
    { nomes: ['groceries', 'food and drinks'], categoria: 'Alimentação', icone: null },
    { nomes: ['transportation'], categoria: 'Transporte', icone: 'transporte' },
    { nomes: ['digital services'], categoria: 'Assinatura', icone: 'assinatura' },
    { nomes: ['healthcare'], categoria: 'Farmácia & Saúde', icone: null },
    { nomes: ['shopping'], categoria: 'Compras & Vestuário', icone: null },
]

const REGEX_COMBUSTIVEL = /\b(posto|shell|ipiranga|petrobras|combust)/i

function traduzirCategoria(tx, indiceCategorias) {
    const info = indiceCategorias.get(String(tx.categoryId)) ?? null
    const sub = (info?.descricao ?? tx.category ?? '').toLowerCase()
    const pai = (info?.pai ?? '').toLowerCase()

    const regra =
        REGRAS_SUBCATEGORIA.find((r) => r.nomes.includes(sub)) ??
        REGRAS_CATEGORIA_PAI.find((r) => r.nomes.includes(pai) || r.nomes.includes(sub))

    let categoria = regra?.categoria ?? info?.paiTraduzida ?? info?.traduzida ?? tx.category ?? 'Outros'
    let icone = regra?.icone ?? null

    if (REGEX_COMBUSTIVEL.test(semAcento(tx.description))) {
        icone = 'combustivel'
        if (categoria === 'Outros') categoria = 'Transporte'
    }
    return { categoria, icone }
}

// ---------------------------------------------------------------- lançamentos

function mapearLancamento(tx, classe, indiceCategorias) {
    const meta = tx.creditCardMetadata ?? {}
    const totalParcelas = numeroOuNull(meta.totalInstallments)
    const parcelada = totalParcelas !== null && totalParcelas > 1

    const base = {
        id: String(tx.id),
        data: normalizarDataTransacao(tx.date),
        valor: arredondar(Math.abs(Number(tx.amount) || 0)),
        tipo: classe,
        modalidade: classe === 'compra' ? 'credito' : null,
        parcelaAtual: parcelada ? numeroOuNull(meta.installmentNumber) : null,
        totalParcelas: parcelada ? totalParcelas : null,
        status: tx.status === 'PENDING' ? 'pendente' : 'confirmado',
    }

    if (classe === 'pagamento') {
        return { ...base, descricao: 'Pagamento de Fatura Anterior', categoria: 'Pagamento', icone: null }
    }
    const { categoria, icone } = traduzirCategoria(tx, indiceCategorias)
    return { ...base, descricao: String(tx.description ?? 'Lançamento'), categoria, icone }
}

/**
 * O Pluggy não marca recorrência. Heurística: compra à vista cuja mesma descrição e
 * mesmo valor já apareceu ~1 mês antes (ou depois) nas transações buscadas.
 * O período mais antigo disponível, sem histórico, não é marcado.
 */
function marcarRecorrentes(lancamentos, historico) {
    const candidatos = historico
        .filter(({ classe }) => classe === 'compra')
        .map(({ tx }) => ({
            chave: `${normalizarDescricao(tx.description)}|${arredondar(Math.abs(Number(tx.amount) || 0)).toFixed(2)}`,
            data: dataISO10(tx.date),
        }))
        .filter((c) => c.data)

    return lancamentos.map((lancamento) => {
        const aVista = !lancamento.totalParcelas
        const data = dataISO10(lancamento.data)
        if (lancamento.tipo !== 'compra' || !aVista || !data) return lancamento

        const chave = `${normalizarDescricao(lancamento.descricao)}|${lancamento.valor.toFixed(2)}`
        const repetiu = candidatos.some((c) => {
            if (c.chave !== chave) return false
            const distancia = Math.abs(diasEntre(data, c.data))
            return distancia >= 26 && distancia <= 35
        })
        return repetiu ? { ...lancamento, modalidade: 'recorrente' } : lancamento
    })
}

function ordenarPorDataDesc(lancamentos) {
    return [...lancamentos].sort((a, b) => String(b.data).localeCompare(String(a.data)))
}

/** Total da fatura calculado pelos lançamentos (compras − estornos); pagamentos ficam de fora. */
function somarFatura(lancamentos) {
    const total = lancamentos.reduce((soma, l) => {
        if (l.tipo === 'compra') return soma + l.valor
        if (l.tipo === 'estorno') return soma - l.valor
        return soma
    }, 0)
    return arredondar(Math.max(0, total))
}

module.exports = {
    dataISO10,
    hojeBrasil,
    somarDias,
    numeroOuNull,
    ultimosQuatroDigitos,
    normalizarDescricao,
    normalizarDataTransacao,
    construirPeriodos,
    escolherPeriodoPadrao,
    janelaDeBusca,
    classificarTransacao,
    pertenceAoPeriodo,
    indexarCategorias,
    traduzirCategoria,
    mapearLancamento,
    marcarRecorrentes,
    ordenarPorDataDesc,
    somarFatura,
}