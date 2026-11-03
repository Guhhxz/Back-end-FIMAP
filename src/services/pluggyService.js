
const pluggy = require("../config/pluggy")
const conexaoDAO = require("../../model/DAO/OpenFinance/conexaoOpenFinanceDAO.js")

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

// ============================================
// FATURAS
// ============================================

const listarFaturas = async (itemId) => {
    const resultado = await listarCartoes(itemId)

    if (resultado.atualizando) {
        return {
            atualizando: true,
            cartoes: [],
        }
    }

    const cartoes = await Promise.all(
        resultado.cartoes.map(async (cartao) => {
            let faturas = []

            try {
                const resposta = await pluggy.fetchCreditCardBills(cartao.id)

                faturas = obterResultados(resposta)
                    .map((fatura) => ({
                        id: fatura.id,
                        vencimento: fatura.dueDate ?? null,
                        diasParaVencimento: diasAte(fatura.dueDate),
                        valorTotal: numeroOuNull(fatura.totalAmount) ?? 0,
                        moeda: fatura.totalAmountCurrencyCode ?? cartao.moeda,
                        pagamentoMinimo: numeroOuNull(fatura.minimumPaymentAmount),
                        permiteParcelamento: fatura.allowsInstallments ?? null,
                        encargos: fatura.financeCharges ?? [],
                    }))
                    .sort(
                        (a, b) =>
                            new Date(b.vencimento).getTime() -
                            new Date(a.vencimento).getTime()
                    )
            } catch (error) {
                // Falha em um cartão não derruba os demais
                console.error(`Erro ao buscar faturas do cartão ${cartao.id}:`, error)
            }

            return {
                cartaoId: cartao.id,
                cartaoNome: cartao.nome,
                instituicao: cartao.instituicao,
                faturaAberta: cartao.faturaAberta,
                limite: cartao.limite,
                limiteDisponivel: cartao.limiteDisponivel,
                dataFechamentoFatura: cartao.dataFechamentoFatura,
                dataVencimentoFatura: cartao.dataVencimentoFatura,
                faturas,
            }
        })
    )

    return {
        atualizando: false,
        total: cartoes.length,
        cartoes,
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
// ATIVOS (contas bancárias + investimentos)
// ============================================

const listarAtivos = async (itemId) => {
    const [saldo, investimentos] = await Promise.all([
        buscarSaldo(itemId),
        listarInvestimentos(itemId),
    ])

    if (saldo.atualizando || investimentos.atualizando) {
        return { atualizando: true }
    }

    const totalInvestido = investimentos.investimentos.reduce(
        (total, item) => total + (Number(item.valor) || 0),
        0
    )

    return {
        atualizando: false,
        patrimonioTotal: saldo.saldoTotal + totalInvestido,
        saldoContas: saldo.saldoTotal,
        totalInvestido,
        contas: saldo.contas,
        investimentos: investimentos.investimentos,
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
    listarFaturas,
    listarAtivos
}
