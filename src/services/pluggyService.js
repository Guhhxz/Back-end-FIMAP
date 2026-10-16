const pluggy = require("../config/pluggy")

async function criarConnectToken(clientUserId) {
    const connectToken = await pluggy.createConnectToken(undefined, {
        clientUserId
    })

    return connectToken.accessToken
}

async function buscarSaldo(itemId) {
    const item = await pluggy.fetchItem(itemId)

    // Logo após conectar, o item pode ainda estar sincronizando
    if (item.status === "UPDATING") {
        return { atualizando: true }
    }

    const contas = await pluggy.fetchAccounts(itemId)

    const listaContas = contas.results.map((conta) => ({
        id: conta.id,
        nome: conta.name,
        tipo: conta.type,          // BANK (conta) ou CREDIT (cartão)
        subtipo: conta.subtype,
        saldo: conta.balance,
        moeda: conta.currencyCode
    }))

    const saldoTotal = listaContas
        .filter((conta) => conta.tipo === "BANK")
        .reduce((total, conta) => total + conta.saldo, 0)

    return { atualizando: false, saldoTotal, contas: listaContas }
}

module.exports = { criarConnectToken, buscarSaldo }