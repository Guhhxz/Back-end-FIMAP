const express = require("express")
const router = express.Router()

const configuracoesController = require("../controller/Configuracoes/ConfiguracoesController.js")

router.get("/:id_usuario", configuracoesController.getConfiguracoesById)
router.patch("/:idusuario", configuracoesController.updateConfiguracoesById)

module.exports = router 