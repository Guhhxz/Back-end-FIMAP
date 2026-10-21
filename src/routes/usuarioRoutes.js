const express = require("express")
const router = express.Router()

const usuarioController = require("../controller/Usuario/usuarioController.js")

router.post("/criar-usuario", usuarioController.criarUsuario)
router.patch("/usuario-update/:id_usuario", usuarioController.atualizarUsuario)
router.get("/usuario/:username", usuarioController.buscarUsuarioPorUsername)
router.get("/usuarios", usuarioController.buscarTodosUsuarios)
router.delete("/usuario-delete/:id_usuario", usuarioController.deletarUsuario)

module.exports = router


//http://localhost:8080/v1/openfinance/usuario/{a rota aq}