const { PluggyClient } = require("pluggy-sdk")

let clientePluggy

const obterCliente = () => {
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
        throw new Error("Pluggy não configurado. Defina CLIENT_ID e CLIENT_SECRET no arquivo .env.")
    }

    if (!clientePluggy) {
        clientePluggy = new PluggyClient({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        })
    }

    return clientePluggy
}

// Inicializa o SDK somente quando uma rota realmente usar a Pluggy.
module.exports = new Proxy({}, {
    get(_alvo, propriedade) {
        const cliente = obterCliente()
        const valor = cliente[propriedade]
        return typeof valor === "function" ? valor.bind(cliente) : valor
    }
})
