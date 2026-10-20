const express = require("express")
const router = express.Router()

const usuarioController = require("../controller/Usuario/usuarioController.js")

router.post("/criar-usuario", usuarioController.criarUsuario)
router.get("/usuario/:id_usuario", usuarioController.buscarUsuarioPorUsername)
router.get("/usuarios", usuarioController.buscarTodosUsuarios)
router.delete("/usuario-delete/:id_usuario", usuarioController.deletarUsuario)

module.exports = router
