
const pluggy = require("../config/pluggy")
const conexaoDAO = require("../../model/DAO/OpenFinance/conexaoOpenFinanceDAO.js")
const MS_DIA = 24 * 60 * 60 * 1000
const MAXIMO_CATEGORIAS_PADRAO = 4

const numeroOuNull = (...valores) => {
    for (const valor of valores) {
        if (valor === undefined || valor === null || valor === "") {
            continue
        }

        const numero = Number(valor)

        if (Number.isFinite(numero)) {
            return numero
        }
    }

    return null
}

const diasAte = (data) => {
    if (!data) return null

    const dataAlvo = new Date(data)

    if (Number.isNaN(dataAlvo.getTime())) return null

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    dataAlvo.setHours(0, 0, 0, 0)

    return Math.ceil(
        (dataAlvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    )
}

const obterResultados = (resposta) => {
    if (Array.isArray(resposta)) return resposta
    return resposta?.results ?? []
}

const verificarSincronizacao = async (itemId) => {
    const item = await pluggy.fetchItem(itemId)
    return item.status === "UPDATING"
}

const criarConnectToken = async (clientUserId) => {
    const connectToken = await pluggy.createConnectToken(undefined, {
        clientUserId,
    })

    return connectToken.accessToken
}

// ============================================
// CONTAS
// ============================================

const listarContas = async (itemId) => {
    if (await verificarSincronizacao(itemId)) {
        return {
            atualizando: true,
            contas: [],
        }
    }

    const resposta = await pluggy.fetchAccounts(itemId)

    const contas = obterResultados(resposta).map((conta) => ({
        id: conta.id,
        nome: conta.name,
        tipo: conta.type,
        subtipo: conta.subtype,
        saldo: numeroOuNull(conta.balance) ?? 0,
        moeda: conta.currencyCode,

        instituicao:
            conta.institution?.name ??
            conta.institutionName ??
            conta.item?.institution?.name ??
            null,
            
        limite: numeroOuNull(
            conta.creditData?.creditLimit,
            conta.creditLimit
        ),

        limiteDisponivel: numeroOuNull(
            conta.creditData?.availableCreditLimit,
            conta.availableCreditLimit
        ),

        dataVencimentoFatura:
            conta.creditData?.balanceDueDate ?? null,

        dataFechamentoFatura:
            conta.creditData?.balanceCloseDate ?? null,
    }))

    return {
        atualizando: false,
        total: contas.length,
        contas,
    }
}

const buscarSaldo = async (itemId) => {
    const resultado = await listarContas(itemId)

    if (resultado.atualizando) return resultado

    const contasBancarias = resultado.contas.filter(
        (conta) => conta.tipo === "BANK"
    )

    const saldoTotal = contasBancarias.reduce(
        (total, conta) => total + (Number(conta.saldo) || 0),
        0
    )

    return {
        atualizando: false,
        saldoTotal,
        contas: contasBancarias,
    }
}

// ============================================
// CARTÕES
// ============================================

const listarCartoes = async (itemId) => {
    const resultado = await listarContas(itemId)

    if (resultado.atualizando) {
        return {
            atualizando: true,
            cartoes: [],
        }
    }

    const cartoes = resultado.contas
        .filter((conta) => conta.tipo === "CREDIT")
        .map((conta) => ({
            ...conta,
            faturaAberta: conta.saldo,

            diasParaFechamento: diasAte(
                conta.dataFechamentoFatura
            ),

            diasParaVencimento: diasAte(
                conta.dataVencimentoFatura
            ),
        }))

    return {
        atualizando: false,
        total: cartoes.length,
        cartoes,
    }
}

const erroHttp = (status, mensagem) => Object.assign(new Error(mensagem), { status })

const paraData = (valor) => {
    if (!valor) return null

    const data = new Date(valor)
    return Number.isNaN(data.getTime()) ? null : data.toISOString().slice(0, 10)
}

const dataUtc = (iso) => new Date(`${iso}T00:00:00Z`)

const somarMeses = (data, meses) => {
    const alvo = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + meses, 1))
    const ultimoDia = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate()

    alvo.setUTCDate(Math.min(data.getUTCDate(), ultimoDia))
    return alvo
}

const cicloFaturaAtual = (dataFechamento, agora = new Date()) => {
    const hoje = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()))

    if (!dataFechamento) {
        const inicio = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1))
        return { inicio: paraData(inicio), fim: paraData(hoje) }
    }

    const base = dataUtc(dataFechamento)
    let meses = 0
    let fim = base

    while (fim < hoje) {
        meses += 1
        fim = somarMeses(base, meses)
    }

    // Fechamento anterior calculado a partir da data original (não da já ajustada
    // para o fim do mês), senão fechamento dia 31 renderia ciclo errado em fevereiro.
    const fechamentoAnterior = somarMeses(base, meses - 1)
    const inicio = new Date(fechamentoAnterior.getTime() + MS_DIA)
    return { inicio: paraData(inicio), fim: paraData(fim) }
}

const buscarCartao = async (itemId, cartaoId) => {
    let conta

    try {
        conta = await pluggy.fetchAccount(cartaoId)
    } catch (error) {
        console.error('Erro ao buscar conta no Pluggy:', error)
        throw erroHttp(404, 'Cartão não encontrado.')
    }

    const ehCartao = conta?.type === 'CREDIT' && conta?.subtype === 'CREDIT_CARD'

    if (!conta || conta.itemId !== itemId || !ehCartao) {
        throw erroHttp(404, 'Cartão não encontrado.')
    }

    return conta
}

const buscarFaturaAtual = async (cartaoId, dataVencimento) => {
    try {
        const resposta = await pluggy.fetchCreditCardBills(cartaoId)
        const faturas = obterResultados(resposta)

        if (faturas.length === 0) return null

        const doVencimento = faturas.find((f) => paraData(f.dueDate) === dataVencimento)
        if (doVencimento) return doVencimento

        return [...faturas].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))[0]
    } catch (error) {
        console.warn('Faturas indisponíveis para este cartão, usando o saldo da conta:', error?.message ?? error)
        return null
    }
}

const mapearTransacao = (t) => {
    const valor = numeroOuNull(t.amount) ?? 0
    const meta = t.creditCardMetadata ?? {}
    const totalParcelas = numeroOuNull(meta.totalInstallments)

    return {
        id: t.id,
        estabelecimento: t.merchant?.name ?? t.description,
        descricao: t.description,
        categoria: t.category ?? 'Outros',
        categoriaId: t.categoryId ?? null,
        // No cartão, amount positivo é compra e negativo é crédito (pagamento/estorno).
        valor: Math.abs(valor),
        tipo: valor >= 0 ? 'COMPRA' : 'CREDITO',
        moeda: t.currencyCode ?? 'BRL',
        data: t.date ? new Date(t.date).toISOString() : null,
        dataCompra: paraData(meta.purchaseDate),
        pendente: t.status === 'PENDING',
        parcelas:
            totalParcelas && totalParcelas > 1
                ? { numero: numeroOuNull(meta.installmentNumber), total: totalParcelas }
                : null,
        faturaId: meta.billId ?? null,
    }
}

const ordenarPorDataDesc = (a, b) => new Date(b.data ?? 0) - new Date(a.data ?? 0)

const obterFaturaCartao = async (itemId, cartaoId) => {
    if (await verificarSincronizacao(itemId)) {
        return { atualizando: true }
    }

    const conta = await buscarCartao(itemId, cartaoId)
    const credito = conta.creditData ?? {}

    const limiteTotal = numeroOuNull(credito.creditLimit)
    const limiteDisponivel = numeroOuNull(credito.availableCreditLimit)
    const vencimento = paraData(credito.balanceDueDate)
    const fechamento = paraData(credito.balanceCloseDate)

    const fatura = await buscarFaturaAtual(cartaoId, vencimento)
    const saldoEmAberto = Math.abs(numeroOuNull(conta.balance) ?? 0)
    const hoje = paraData(new Date())

    return {
        atualizando: false,
        fatura: {
            valorFatura: fatura ? numeroOuNull(fatura.totalAmount) ?? saldoEmAberto : saldoEmAberto,
            origemValor: fatura ? 'FATURA' : 'SALDO',
            saldoEmAberto,
            moeda: conta.currencyCode ?? 'BRL',
            vencimento,
            fechamento,
            status: fechamento && fechamento <= hoje ? 'FECHADA' : 'ABERTA',
            diasParaVencimento: diasAte(vencimento),
            diasParaFechamento: diasAte(fechamento),
            valorMinimo: numeroOuNull(fatura?.minimumPaymentAmount, credito.minimumPayment),
            permiteParcelamento: fatura?.allowsInstallments ?? null,
            limiteTotal,
            limiteDisponivel,
            limiteUtilizado:
                limiteTotal !== null && limiteDisponivel !== null ? limiteTotal - limiteDisponivel : null,
            bandeira: credito.brand ?? null,
        },
    }
}

const obterGastosCartaoPorCategoria = async (itemId, cartaoId, maximo = MAXIMO_CATEGORIAS_PADRAO) => {
    if (await verificarSincronizacao(itemId)) {
        return { atualizando: true }
    }

    const conta = await buscarCartao(itemId, cartaoId)
    const periodo = cicloFaturaAtual(paraData(conta.creditData?.balanceCloseDate))

    const todas = await pluggy.fetchAllTransactions(cartaoId, { dateFrom: periodo.inicio })

    const compras = todas
        .map(mapearTransacao)
        .filter((t) => t.tipo === 'COMPRA')
        .filter((t) => {
            const dia = t.data?.slice(0, 10)
            return dia && dia >= periodo.inicio && dia <= periodo.fim
        })

    const porCategoria = new Map()

    for (const compra of compras) {
        const chave = compra.categoriaId ?? compra.categoria
        const atual = porCategoria.get(chave)

        if (atual) atual.valor += compra.valor
        else porCategoria.set(chave, { categoriaId: compra.categoriaId ?? 'outros', nome: compra.categoria, valor: compra.valor })
    }

    const ordenadas = [...porCategoria.values()]
        .map((c) => ({ ...c, valor: Math.round(c.valor * 100) / 100 }))
        .sort((a, b) => b.valor - a.valor)

    // Mantém as (maximo - 1) maiores e junta o resto em "Outros".
    let categorias = ordenadas
    if (ordenadas.length > maximo) {
        const principais = ordenadas.slice(0, maximo - 1)
        const resto = ordenadas.slice(maximo - 1)

        categorias = [
            ...principais,
            {
                categoriaId: 'outros',
                nome: 'Outros',
                valor: Math.round(resto.reduce((soma, c) => soma + c.valor, 0) * 100) / 100,
            },
        ]
    }

    return {
        atualizando: false,
        periodo,
        total: Math.round(compras.reduce((soma, c) => soma + c.valor, 0) * 100) / 100,
        categorias,
    }
}

const listarTransacoesCartao = async (itemId, cartaoId, limite = 20) => {
    if (await verificarSincronizacao(itemId)) {
        return { atualizando: true }
    }

    const conta = await buscarCartao(itemId, cartaoId)
    const ciclo = cicloFaturaAtual(paraData(conta.creditData?.balanceCloseDate))
    const desde = paraData(somarMeses(dataUtc(ciclo.inicio), -1))

    const todas = await pluggy.fetchAllTransactions(cartaoId, { dateFrom: desde })
    const transacoes = todas.map(mapearTransacao).sort(ordenarPorDataDesc)

    return {
        atualizando: false,
        total: transacoes.length,
        limite,
        desde,
        transacoes: transacoes.slice(0, limite),
    }
}

// ============================================
// INVESTIMENTOS
// ============================================

const listarInvestimentos = async (itemId) => {
    if (await verificarSincronizacao(itemId)) {
        return {
            atualizando: true,
            investimentos: [],
        }
    }

    const resposta = await pluggy.fetchInvestments(itemId)

    const investimentos = obterResultados(resposta).map(
        (investimento) => ({
            id: investimento.id,
            nome: investimento.name,
            tipo: investimento.type,
            subtipo: investimento.subtype,
            valor: numeroOuNull(
                investimento.value,
                investimento.balance,
                investimento.amount
            ) ?? 0,
            moeda: investimento.currencyCode,
            instituicao:
                investimento.institution?.name ??
                investimento.institutionName ??
                null,
        })
    )

    return {
        atualizando: false,
        total: investimentos.length,
        investimentos,
    }
}

// ============================================
// EMPRÉSTIMOS
// ============================================

const listarEmprestimos = async (itemId) => {
    if (await verificarSincronizacao(itemId)) {
        return {
            atualizando: true,
            emprestimos: [],
        }
    }

    const resposta = await pluggy.fetchLoans(itemId)

    const emprestimos = obterResultados(resposta).map(
        (emprestimo) => {
            const pagamentos = emprestimo.payments ?? {}
            const parcelas = emprestimo.installments ?? {}

            return {
                id: emprestimo.id,
                nome: emprestimo.productName,
                tipo: emprestimo.type,
                modalidade: emprestimo.kind,

                valorContratado: numeroOuNull(
                    emprestimo.contractAmount
                ),

                saldoDevedor: numeroOuNull(
                    pagamentos.contractOutstandingBalance,
                    emprestimo.contractOutstandingBalance,
                    emprestimo.outstandingBalance
                ),

                moeda: emprestimo.currencyCode,
                vencimento: emprestimo.dueDate ?? null,

                parcelasPagas: numeroOuNull(
                    parcelas.paidInstallments
                ),

                parcelasRestantes: numeroOuNull(
                    parcelas.dueInstallments
                ),

                parcelaMensal: numeroOuNull(
                    emprestimo.installmentAmount,
                    emprestimo.installmentValue,
                    pagamentos.installmentAmount,
                    pagamentos.installmentValue
                ),

                status: emprestimo.status ?? null,
            }
        }
    )

    return {
        atualizando: false,
        total: emprestimos.length,
        emprestimos,
    }
}

// ============================================
// TRANSAÇÕES
// ============================================

const listarTransacoes = async (itemId) => {
    const resultadoContas = await listarContas(itemId)

    if (resultadoContas.atualizando) {
        return {
            atualizando: true,
            transacoes: [],
        }
    }

    const contas = resultadoContas.contas ?? []

    const resultados = await Promise.all(
        contas.map(async (conta) => {
            const resposta =
                await pluggy.fetchAllTransactions(conta.id)

            return obterResultados(resposta).map((transacao) => ({
                id: transacao.id,
                contaId: conta.id,
                contaNome: conta.nome,
                descricao: transacao.description,
                valor: numeroOuNull(transacao.amount) ?? 0,
                data: transacao.date,
                tipo: transacao.type ?? null,
                categoria: transacao.category ?? transacao.merchant?.category ?? null,
                status: transacao.status ?? null,
                moeda: transacao.currencyCode ?? conta.moeda,

                
                instituicao: conta.instituicao,
            }))
        })
    )

    const transacoes = resultados
        .flat()
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        )

    return {
        atualizando: false,
        total: transacoes.length,
        transacoes,
    }
}

// ============================================
// CONEXÕES
// ============================================

const adicionarConexao = async (conexao) => {
    try {
        const resultado = await conexaoDAO.criarConexao(conexao)
        return resultado
    } catch (error) {
        console.error("Erro ao adicionar conexão:", error)
        return false
    }
}

const listarConexoesPorUsuario = async (idUsuario) => {
    try {
        const conexoes = await conexaoDAO.listarConexoesPorUsuario(idUsuario)
        return conexoes
    } catch (error) {
        console.error("Erro ao listar conexões:", error)
        return []
    }
}

module.exports = {
    criarConnectToken,
    buscarSaldo,
    listarContas,
    listarCartoes,
    listarInvestimentos,
    listarEmprestimos,
    listarTransacoes,
    adicionarConexao,
    listarConexoesPorUsuario,
    obterFaturaCartao,
    obterGastosCartaoPorCategoria,
    listarTransacoesCartao,
    verificarSincronizacao
}
