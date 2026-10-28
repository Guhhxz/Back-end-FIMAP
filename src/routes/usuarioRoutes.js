
const express = require("express")
const router = express.Router()

const usuarioController = require("../controller/Usuario/usuarioController.js")

// Cadastro e verificação por e-mail
router.post("/criar-usuario", usuarioController.criarUsuario)
router.post("/solicitar-otp", usuarioController.solicitarOTP)
router.post("/verificar-otp", usuarioController.verificarOTP)

// Atualizar usuário
router.patch("/usuario-update/:id_usuario", usuarioController.atualizarUsuario)

// Buscar usuários
router.get("/usuario/:username", usuarioController.buscarUsuarioPorUsername)
router.get("/usuarios", usuarioController.buscarTodosUsuarios)

// Deletar usuário
router.delete("/usuario-delete/:id_usuario", usuarioController.deletarUsuario)

module.exports = router

// Base: http://localhost:8080/v1/openfinance/usuario
