const express = require("express")
const router = express.Router()

const openFinanceController = require("../controller/OpenFinance/openFinanceController.js")
const contasRendimentoController = require("../controller/OpenFinance/ContasRendimentoController.js")
const extratoCartaoController = require("../controller/OpenFinance/extratoCartaoController.js")

router.post("/connect-token", openFinanceController.gerarConnectToken)

// -------------------- CONEXÕES -------------------- 
router.post("/conexoes/:idUsuario", openFinanceController.adicionarConexao)
router.get("/conexoes/:idUsuario", openFinanceController.listarConexoes)
router.get("/contas-rendimento", contasRendimentoController.listarContasRendimento)
router.delete("/conexoes/:id_usuario/:id", openFinanceController.deletarConexao)

// -------------------- OBTER DADOS -------------------- 
router.get("/financeiro/contas/:itemId", openFinanceController.obterContas)
router.get("/financeiro/cartoes/:itemId", openFinanceController.obterCartoes)
router.get("/financeiro/investimentos/:itemId", openFinanceController.obterInvestimentos)
router.get("/financeiro/emprestimos/:itemId", openFinanceController.obterEmprestimos)
router.get("/financeiro/transacoes/:itemId", openFinanceController.obterTransacoes)
router.get("/financeiro/saldo/:itemId", openFinanceController.obterSaldo)
router.get("/financeiro/resumo", openFinanceController.obterResumosBancario)
router.get("/financeiro/cartoes/:cartaoId/fatura", openFinanceController.obterFaturaCartao)
router.get("/financeiro/cartoes/:cartaoId/gastos-por-categoria", openFinanceController.obterGastosCartao)
router.get("/financeiro/cartoes/:cartaoId/transacoes", openFinanceController.obterTransacoesCartao)
router.get("/financeiro/cartoes/:cartaoId/extrato", extratoCartaoController.obterExtratoCartao)
router.get("/financeiro/investimentos/:itemId/evolucao", openFinanceController.obterEvolucaoInvestimentos)
router.get("/financeiro/emprestimos/:itemId/:emprestimoId/detalhe", openFinanceController.obterDetalheEmprestimo)

//CDI PUT
router.put('/contas-rendimento/:id', contasRendimentoController.atualizarCdiManual)


module.exports = router
