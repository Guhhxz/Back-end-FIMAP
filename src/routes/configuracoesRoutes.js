const express = require("express")
const router = express.Router()

const configuracoesController = require("../controller/Configuracoes/ConfiguracoesController.js")

// router.post("/:idUsuario", configuracoesController.postConfiguracoesById)
router.get("/:idUsuario", configuracoesController.getConfiguracoesById)
router.patch("/:idUsuario", configuracoesController.updateConfiguracoesById)

module.exports = router