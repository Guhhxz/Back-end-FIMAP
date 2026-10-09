const pluggyConfig = require("../config/pluggy.js")

async function gerarConnectToken(req, res) {
    try {
        const { clientUserId } = req.body

        if (!clientUserId || typeof clientUserId !== "string") {
            return res.status(400).json({
                erro: "Informe um clientUserId válido."
            })
        }

        const accessToken = await pluggyConfig.criarConnectToken(
            clientUserId
        )

        return res.status(200).json({ accessToken })
    } catch (error) {
        console.error("Erro ao gerar Connect Token:", error.message)

        return res.status(500).json({
            erro: "Erro ao gerar o Connect Token."
        })
    }
}

module.exports = { gerarConnectToken }
