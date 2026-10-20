const express = require("express")
const router = express.Router()

const openFinanceController = require("../controller/OpenFinance/openFinanceController.js")
const usuarioController = require("../controller/Usuario/usuarioController.js")

router.post("/connect-token", openFinanceController.gerarConnectToken)
router.get("/saldo/:itemId", openFinanceController.obterSaldo)

router.post("/criar-usuario", usuarioController.criarUsuario)
router.get("/usuario/:id_usuario", usuarioController.buscarUsuarioPorUsername)
router.get("/usuarios", usuarioController.buscarTodosUsuarios)
router.delete("/usuario-delete/:id_usuario", usuarioController.deletarUsuario)

module.exports = router
