const express = require("express")
const router = express.Router()

const badgeController = require("../controller/Badge/BadgeController.js")
const badgeUserController = require("../controller/BadgeUser/badgeUserController.js")

// Rotas para badge-usuario
router.post("/badge-usuario", badgeUserController.AtrelarBadgeUsuario)
router.get("/badge-usuario/:id_usuario", badgeUserController.BuscarBadgesUsuario)
router.delete("/badge-usuario", badgeUserController.RemoverBadgeUsuario)

router.post("/criar-badge", badgeController.criarBadge)
router.patch("/badge-update/:id_badge", badgeController.atualizarBadge)
router.get("/badges", badgeController.buscarTodasBadges)
router.delete("/badge-delete/:id_badge", badgeController.deletarBadge)

module.exports = router  