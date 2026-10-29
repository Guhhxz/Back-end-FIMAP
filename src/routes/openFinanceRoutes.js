const express = require("express")
const router = express.Router()

const openFinanceController = require("../controller/OpenFinance/openFinanceController.js")

router.post("/connect-token", openFinanceController.gerarConnectToken)

// -------------------- OBTER DADOS -------------------- 
router.get("/financeiro/contas/:itemId", openFinanceController.obterContas)
router.get("/financeiro/cartoes/:itemId", openFinanceController.obterCartoes)
router.get("/financeiro/investimentos/:itemId", openFinanceController.obterInvestimentos)
router.get("/financeiro/emprestimos/:itemId", openFinanceController.obterEmprestimos)
router.get("/financeiro/transacoes/:itemId", openFinanceController.obterTransacoes)
router.get("/financeiro/saldo/:itemId", openFinanceController.obterSaldo)
router.get("/financeiro/resumo", openFinanceController.obterResumosBancario)


module.exports = router
