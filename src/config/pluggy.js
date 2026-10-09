const pluggy = require("../config/pluggy")

async function criarConnectToken(clientUserId) {
    const connectToken = await pluggy.createConnectToken({
        clientUserId
    })

    return connectToken.accessToken
}

module.exports = {
    criarConnectToken
}
