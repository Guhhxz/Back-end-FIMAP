const v = require('./validation')
const { error } = require('./httpClient')
const money = value => { if (!Number.isFinite(value) || Math.abs(value) > 1e15) throw error('RESULTADO_FORA_DO_LIMITE'); return Math.round((value + Number.EPSILON) * 100) / 100 }
function investment({ capital, taxaPercentual, periodos, aporte = 0 }) {
    v.number(capital, 'capital', 0, 1e10); v.number(taxaPercentual, 'taxaPercentual', -99, 100)
    v.integer(periodos, 'periodos', 1, 1200); v.number(aporte, 'aporte', 0, 1e8)
    const rate = taxaPercentual / 100
    const growth = Math.pow(1 + rate, periodos)
    const final = capital * growth + aporte * (rate === 0 ? periodos : Math.expm1(periodos * Math.log1p(rate)) / rate)
    const invested = capital + aporte * periodos
    return { valorFinalBruto: money(final), totalAportado: money(invested), rendimentoBruto: money(final - invested), premissas: ['Taxa constante por período, com capitalização composta.', 'Aportes no fim de cada período; taxa e prazo devem usar a mesma unidade.', 'Sem impostos, inflação ou custos. Projeção, não garantia.'] }
}
function netReturn({ capital, valorFinalBruto, aliquotaIRPercentual, aliquotaIOFPercentual = 0, custos = 0 }) {
    v.number(capital, 'capital', 0, 1e10); v.number(valorFinalBruto, 'valorFinalBruto', 0, 1e13)
    v.number(aliquotaIRPercentual, 'aliquotaIRPercentual', 0, 100); v.number(aliquotaIOFPercentual, 'aliquotaIOFPercentual', 0, 100); v.number(custos, 'custos', 0, 1e10)
    const gain = Math.max(0, valorFinalBruto - capital)
    const iof = gain * aliquotaIOFPercentual / 100
    const ir = (gain - iof) * aliquotaIRPercentual / 100
    return { valorFinalLiquido: money(valorFinalBruto - iof - ir - custos), rendimentoLiquido: money(valorFinalBruto - iof - ir - custos - capital), impostoRenda: money(ir), iof: money(iof), custos, premissas: ['Simulação de aplicação única sem aportes, com IR sobre ganho após IOF.', 'Alíquotas fornecidas explicitamente; confirmar produto, prazo e tributação aplicável. Não determina tributos legalmente devidos.'] }
}
function returnRate({ capital, valorFinal, inflacaoPercentual }) {
    v.number(capital, 'capital', 0.01, 1e10); v.number(valorFinal, 'valorFinal', 0, 1e13)
    const ratio = valorFinal / capital
    if (inflacaoPercentual !== undefined) v.number(inflacaoPercentual, 'inflacaoPercentual', -99, 10000)
    return { ganho: money(valorFinal - capital), rentabilidadePercentual: (ratio - 1) * 100, rentabilidadeRealPercentual: inflacaoPercentual === undefined ? null : (ratio / (1 + inflacaoPercentual / 100) - 1) * 100, premissas: ['Capital inicial único, sem fluxos intermediários. Inflação e rentabilidade referentes ao mesmo período.'] }
}
function financing({ principal, taxaMensalPercentual, meses, custosIniciais = 0 }, system) {
    v.number(principal, 'principal', 0.01, 1e10); v.number(taxaMensalPercentual, 'taxaMensalPercentual', 0, 100)
    v.integer(meses, 'meses', 1, 600); v.number(custosIniciais, 'custosIniciais', 0, 1e10)
    const rate = taxaMensalPercentual / 100
    const payment = rate === 0 ? principal / meses : principal * rate / -Math.expm1(-meses * Math.log1p(rate))
    let balance = principal, total = custosIniciais, totalInterest = 0
    const rows = []
    for (let index = 1; index <= meses; index++) {
        const interest = balance * rate
        const amortization = index === meses ? balance : system === 'SAC' ? principal / meses : payment - interest
        const amount = interest + amortization
        balance = Math.max(0, balance - amortization)
        total += amount; totalInterest += interest
        rows.push({ mes: index, prestacao: money(amount), juros: money(interest), amortizacao: money(amortization), saldo: money(balance) })
    }
    return { sistema: system, totalPago: money(total), totalJuros: money(totalInterest), primeiraPrestacao: rows[0].prestacao, ultimaPrestacao: rows.at(-1).prestacao, cronograma: rows.length <= 24 ? rows : [...rows.slice(0, 12), ...rows.slice(-12)], cronogramaParcial: rows.length > 24, premissas: ['Taxa mensal constante, parcelas mensais, primeira parcela após um mês.', 'Custos iniciais pagos à vista. IOF, seguro, tarifas e indexação só estão incluídos se informados nos custos; resultado não é CET.'] }
}
function goal({ meta, inicial = 0, meses, taxaMensalPercentual = 0 }) {
    v.number(meta, 'meta', 0, 1e12); v.number(inicial, 'inicial', 0, 1e10)
    v.integer(meses, 'meses', 1, 1200); v.number(taxaMensalPercentual, 'taxaMensalPercentual', 0, 100)
    const rate = taxaMensalPercentual / 100
    const growth = (1 + rate) ** meses
    const factor = rate === 0 ? meses : Math.expm1(meses * Math.log1p(rate)) / rate
    return { aporteMensal: money(Math.max(0, (meta - inicial * growth) / factor)), meta, meses, premissas: ['Aportes ao fim do mês; taxa constante; sem impostos, custos ou inflação.'] }
}
function loanCost({ valorRecebido, parcela, meses, custosIniciais = 0 }) {
    v.number(valorRecebido, 'valorRecebido', 0.01, 1e10); v.number(parcela, 'parcela', 0.01, 1e10)
    v.integer(meses, 'meses', 1, 600); v.number(custosIniciais, 'custosIniciais', 0, valorRecebido - 0.01)
    const net = valorRecebido - custosIniciais
    const present = rate => rate === 0 ? parcela * meses : parcela * -Math.expm1(-meses * Math.log1p(rate)) / rate
    if (parcela * meses < net) throw error('FLUXO_NAO_SUPORTADO')
    let low = 0, high = 1
    while (present(high) > net && high < 1024) high *= 2
    if (present(high) > net) throw error('RESULTADO_FORA_DO_LIMITE')
    for (let i = 0; i < 160; i++) { const middle = (low + high) / 2; if (present(middle) > net) low = middle; else high = middle }
    const rate = (low + high) / 2
    return { taxaEfetivaMensalPercentual: rate * 100, taxaEfetivaAnualPercentual: ((1 + rate) ** 12 - 1) * 100, totalPago: money(parcela * meses + custosIniciais), custoTotal: money(parcela * meses + custosIniciais - valorRecebido), premissas: ['Parcelas iguais mensais a partir do próximo mês. Taxa implícita dos fluxos informados; não substitui CET contratual nem inclui custos omitidos.'] }
}
function compare({ capital, meses, taxaMensalAPercentual, taxaMensalBPercentual }) {
    return { alternativaA: investment({ capital, periodos: meses, taxaPercentual: taxaMensalAPercentual }), alternativaB: investment({ capital, periodos: meses, taxaPercentual: taxaMensalBPercentual }), premissas: ['Comparação bruta de taxas constantes mensais; não avalia risco, liquidez, tributação ou adequação do produto.'] }
}
module.exports = { investment, netReturn, returnRate, financing, goal, loanCost, compare, money }
