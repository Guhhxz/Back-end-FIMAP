const express = require("express")
const router = express.Router()

const configuracoesController = require("../controller/Configuracoes/ConfiguracoesController.js")

router.get("/:id_usuario", configuracoesController.getConfiguracoes)
router.patch("/:idusuario", configuracoesController.updateConfiguracoes)

module.exports = router 