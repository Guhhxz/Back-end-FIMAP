const express = require("express")
const router = express.Router()

const openFinanceController = require("../../src/controller/openFinanceController.js")

router.post(
    "/connect-token",
    openFinanceController.gerarConnectToken
)

module.exports = router
