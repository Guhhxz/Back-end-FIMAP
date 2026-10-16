const express = require("express")
const router = express.Router()

const openFinanceController = require("../controller/openFinanceController.js")

router.post("/connect-token", openFinanceController.gerarConnectToken)
router.get("/saldo/:itemId", openFinanceController.obterSaldo)

module.exports = router