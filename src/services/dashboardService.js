const pluggyService = require("./pluggyService.js")

const numero = (valor) => {
    const resultado = Number(valor)
    return Number.isFinite(resultado) ? resultado : 0
}

const numeroDisponivel = (objeto, campos) => {
    for (const campo of campos) {
        const valor = objeto?.[campo]

        if (valor !== undefined && valor !== null && valor !== "") {
            const resultado = Number(valor)

            if (Number.isFinite(resultado)) {
                return resultado
            }
        }
    }

    return null
}

const obterDataTransacao = (transacao) =>
    transacao.data ??
    transacao.date ??
    transacao.dataTransacao ??
    null

const DESLOCAMENTO_BRASILIA_MS = -3 * 60 * 60 * 1000
const DIA_MS = 24 * 60 * 60 * 1000

const paraBrasilia = (data) =>
    new Date(data.getTime() + DESLOCAMENTO_BRASILIA_MS)

const obterDataBrasilia = (transacao) => {
    const original = obterDataTransacao(transacao)

    if (!original) {
        return null
    }

    const data = new Date(original)

    return Number.isNaN(data.getTime()) ? null : paraBrasilia(data)
}

const inicioDoDia = (dataBrasilia) =>
    new Date(Date.UTC(
        dataBrasilia.getUTCFullYear(),
        dataBrasilia.getUTCMonth(),
        dataBrasilia.getUTCDate()
    ))

const inicioDoMes = (dataBrasilia, deslocamentoMeses = 0) =>
    new Date(Date.UTC(
        dataBrasilia.getUTCFullYear(),
        dataBrasilia.getUTCMonth() + deslocamentoMeses,
        1
    ))

const doisDigitos = (valor) => String(valor).padStart(2, "0")

const obterTipoTransacao = (transacao) => {
    const valor = numero(transacao.valor)

    if (valor > 0) {
        return "receita"
    }

    if (valor < 0) {
        return "despesa"
    }

    return null
}

const obterValorAbsoluto = (transacao) =>
    Math.abs(numero(transacao.valor))

const obterVariacaoPercentual = (atual, anterior) => {
    if (anterior === null || anterior === undefined || anterior === 0) {
        return null
    }

    return Number(
        (((atual - anterior) / Math.abs(anterior)) * 100).toFixed(2)
    )
}

const somarValores = (itens, campo) =>
    itens.reduce((total, item) => total + numero(item[campo]), 0)

const buscarDadosFinanceiros = async (itemId) => {
    const [
        contasResultado,
        cartoesResultado,
        investimentosResultado,
        emprestimosResultado,
        transacoesResultado,
    ] = await Promise.all([
        pluggyService.listarContas(itemId),
        pluggyService.listarCartoes(itemId),
        pluggyService.listarInvestimentos(itemId),
        pluggyService.listarEmprestimos(itemId),
        pluggyService.listarTransacoes(itemId),
    ])

    return {
        contasResultado,
        cartoesResultado,
        investimentosResultado,
        emprestimosResultado,
        transacoesResultado,
    }
}

const dadosEstaoSincronizando = (resultados) =>
    Object.values(resultados).some(
        (resultado) => resultado?.atualizando
    )

const normalizarDadosFinanceiros = (resultados) => ({
    contas: resultados.contasResultado?.contas ?? [],
    cartoes: resultados.cartoesResultado?.cartoes ?? [],
    investimentos:
        resultados.investimentosResultado?.investimentos ?? [],
    emprestimos: resultados.emprestimosResultado?.emprestimos ?? [],
    transacoes: resultados.transacoesResultado?.transacoes ?? [],
})

const calcularPatrimonio = ({
    contas,
    investimentos,
    emprestimos,
    cartoes,
}) => {
    const contasBancarias = contas.filter(
        (conta) => conta.tipo === "BANK"
    )

    const saldoContas = somarValores(contasBancarias, "saldo")
    const totalInvestido = somarValores(investimentos, "valor")
    const saldoDevedor = somarValores(emprestimos, "saldoDevedor")

    const faturaAberta = cartoes.reduce(
        (total, cartao) =>
            total +
            Math.abs(
                numeroDisponivel(cartao, [
                    "faturaAberta",
                    "faturaAtual",
                    "saldo",
                    "balance",
                ]) ?? 0
            ),
        0
    )

    return {
        saldoContas,
        totalInvestido,
        saldoDevedor,
        faturaAberta,
        patrimonioLiquido:
            saldoContas + totalInvestido - saldoDevedor - faturaAberta,
    }
}


const calcularCartoes = (cartoes) => {
    const limiteTotal = cartoes.reduce(
        (total, cartao) =>
            total +
            (numeroDisponivel(cartao, [
                "limite",
                "limiteTotal",
                "creditLimit",
            ]) ?? 0),
        0
    )

    const limiteDisponivel = cartoes.reduce(
        (total, cartao) =>
            total +
            (numeroDisponivel(cartao, [
                "limiteDisponivel",
                "availableCreditLimit",
            ]) ?? 0),
        0
    )

    const faturaAberta = cartoes.reduce(
        (total, cartao) =>
            total +
            Math.abs(
                numeroDisponivel(cartao, [
                    "faturaAberta",
                    "faturaAtual",
                    "saldo",
                    "balance",
                ]) ?? 0
            ),
        0
    )

    return {
        quantidade: cartoes.length,
        limiteTotal,
        limiteDisponivel,
        faturaAberta,
        percentualDisponivel:
            limiteTotal > 0
                ? Number(
                    ((limiteDisponivel / limiteTotal) * 100).toFixed(2)
                )
                : null,
    }
}


const somarTransacoes = (transacoes, tipo, inicio, fim) =>
    transacoes.reduce((total, transacao) => {
        const data = obterDataBrasilia(transacao)

        if (!data || obterTipoTransacao(transacao) !== tipo) {
            return total
        }

        if (data < inicio || data >= fim) {
            return total
        }

        return total + obterValorAbsoluto(transacao)
    }, 0)

const calcularMovimentacaoMensal = (transacoes, agora = new Date()) => {
    const agoraBrasilia = paraBrasilia(agora)

    const inicioAtual = inicioDoMes(agoraBrasilia)
    const inicioProximo = inicioDoMes(agoraBrasilia, 1)
    const inicioAnterior = inicioDoMes(agoraBrasilia, -1)

    const receitasAtual = somarTransacoes(
        transacoes, "receita", inicioAtual, inicioProximo
    )

    const receitasAnterior = somarTransacoes(
        transacoes, "receita", inicioAnterior, inicioAtual
    )

    const despesasAtual = somarTransacoes(
        transacoes, "despesa", inicioAtual, inicioProximo
    )

    const despesasAnterior = somarTransacoes(
        transacoes, "despesa", inicioAnterior, inicioAtual
    )

    return {
        receitas: {
            mesAtual: receitasAtual,
            mesAnterior: receitasAnterior,
            variacaoPercentual: obterVariacaoPercentual(
                receitasAtual, receitasAnterior
            ),
        },

        despesas: {
            mesAtual: despesasAtual,
            mesAnterior: despesasAnterior,
            variacaoPercentual: obterVariacaoPercentual(
                despesasAtual, despesasAnterior
            ),
        },
    }
}


const calcularInvestimentos = (investimentos) => {
    const porCategoria = investimentos.reduce(
        (resultado, investimento) => {
            const categoria =
                investimento.tipo ??
                investimento.subtipo ??
                "Outros"

            resultado[categoria] =
                (resultado[categoria] ?? 0) +
                numero(investimento.valor)

            return resultado
        },
        {}
    )

    return {
        quantidade: investimentos.length,
        valorAtual: somarValores(investimentos, "valor"),
        porCategoria,
        rentabilidadeAnualPercentual: null,
    }
}


const calcularEmprestimos = (emprestimos) => ({
    quantidade: emprestimos.length,

    saldoDevedor: somarValores(emprestimos, "saldoDevedor"),

    parcelasMensais: emprestimos.reduce(
        (total, emprestimo) =>
            total +
            (numeroDisponivel(emprestimo, [
                "parcelaMensal",
                "valorParcela",
                "installmentAmount",
            ]) ?? 0),
        0
    ),
})


const calcularNucleoFinanceiro = (contas) => {
    const contasBancarias = contas.filter(
        (conta) => conta.tipo === "BANK"
    )

    const instituicoes = [
        ...new Set(
            contasBancarias
                .map((conta) =>
                    conta.instituicao ??
                    conta.nomeInstituicao ??
                    conta.banco
                )
                .filter(Boolean)
        ),
    ]

    return {
        quantidadeContas: contasBancarias.length,
        instituicoes,
    }
}

const obterTimestamp = (transacao) => {
    const tempo = new Date(obterDataTransacao(transacao)).getTime()

    return Number.isNaN(tempo) ? 0 : tempo
}

const obterUltimasTransacoes = (transacoes, quantidade = 5) =>
    [...transacoes]
        .sort((a, b) => obterTimestamp(b) - obterTimestamp(a))
        .slice(0, quantidade)


const PERIODOS = ["dia", "semana", "mes"]

const calcularEvolucao = (transacoes, periodo, agora = new Date()) => {
    const agoraBrasilia = paraBrasilia(agora)
    const hoje = inicioDoDia(agoraBrasilia)

    let quantidade
    let inicio
    let fim
    let obterIndice
    let obterRotulo

    if (periodo === "dia") {
        quantidade = 24
        inicio = hoje
        fim = new Date(hoje.getTime() + DIA_MS)
        obterIndice = (data) => data.getUTCHours()
        obterRotulo = (indice) => `${doisDigitos(indice)}:00`
    } else if (periodo === "semana") {
        quantidade = 7
        inicio = new Date(hoje.getTime() - 6 * DIA_MS)
        fim = new Date(hoje.getTime() + DIA_MS)
        obterIndice = (data) =>
            Math.floor((inicioDoDia(data) - inicio) / DIA_MS)
        obterRotulo = (indice) => {
            const dia = new Date(inicio.getTime() + indice * DIA_MS)

            return `${doisDigitos(dia.getUTCDate())}/${doisDigitos(
                dia.getUTCMonth() + 1
            )}`
        }
    } else {
        quantidade = new Date(Date.UTC(
            agoraBrasilia.getUTCFullYear(),
            agoraBrasilia.getUTCMonth() + 1,
            0
        )).getUTCDate()
        inicio = inicioDoMes(agoraBrasilia)
        fim = inicioDoMes(agoraBrasilia, 1)
        obterIndice = (data) => data.getUTCDate() - 1
        obterRotulo = (indice) => doisDigitos(indice + 1)
    }

    const dados = Array.from({ length: quantidade }, (_, indice) => ({
        periodo: obterRotulo(indice),
        receitas: 0,
        despesas: 0,
    }))

    for (const transacao of transacoes) {
        const data = obterDataBrasilia(transacao)

        if (!data || data < inicio || data >= fim) {
            continue
        }

        const indice = obterIndice(data)

        if (indice < 0 || indice >= quantidade) {
            continue
        }

        const tipo = obterTipoTransacao(transacao)
        const valor = obterValorAbsoluto(transacao)

        if (tipo === "receita") {
            dados[indice].receitas += valor
        } else if (tipo === "despesa") {
            dados[indice].despesas += valor
        }
    }

    return dados
}


const criarResumoBancario = async (itemId, periodoSolicitado = "mes") => {
    const periodo = PERIODOS.includes(periodoSolicitado)
        ? periodoSolicitado
        : "mes"

    const resultados = await buscarDadosFinanceiros(itemId)

    if (dadosEstaoSincronizando(resultados)) {
        return {
            atualizando: true,
            mensagem: "Os dados financeiros ainda estão sincronizando.",
        }
    }

    const dados = normalizarDadosFinanceiros(resultados)

    const contasBancarias = dados.contas.filter(
        (conta) => conta.tipo === "BANK"
    )

    const patrimonio = calcularPatrimonio(dados)
    const movimentacao = calcularMovimentacaoMensal(dados.transacoes)

    return {
        atualizando: false,

        patrimonio,

        receitas: movimentacao.receitas,
        despesas: movimentacao.despesas,

        cartoes: calcularCartoes(dados.cartoes),

        investimentos: calcularInvestimentos(dados.investimentos),

        emprestimos: calcularEmprestimos(dados.emprestimos),

        evolucao: {
            periodo,
            dados: calcularEvolucao(dados.transacoes, periodo),
        },

        nucleoFinanceiro: calcularNucleoFinanceiro(dados.contas),

        resumo: {
            quantidadeContas: contasBancarias.length,
            quantidadeCartoes: dados.cartoes.length,
            quantidadeInvestimentos: dados.investimentos.length,
            quantidadeEmprestimos: dados.emprestimos.length,
        },

        ultimasTransacoes: obterUltimasTransacoes(dados.transacoes),
    }
}


module.exports = {
    criarResumoBancario,
    // Expostos para teste
    calcularMovimentacaoMensal,
    calcularEvolucao,
    obterTipoTransacao,
}