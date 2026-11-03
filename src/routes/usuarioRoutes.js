const express = require("express")
const router = express.Router()

const usuarioController = require("../controller/Usuario/usuarioController.js")
const dispositivoController = require("../controller/dispositivos/dispositivosController.js")


// Cadastro e autenticação por OTP
router.post("/criar-usuario", usuarioController.criarCodigoOTPUsuario)
router.post("/codigo-otp/senha/:id_usuario", usuarioController.solicitarOTPAlteracaoSenha)
router.post("/alterar/senha/:id_usuario", usuarioController.alterarSenhaComOTP)
router.post("/login", usuarioController.login)
router.post("/consultar/otp/:id_usuario", usuarioController.validarCodigoOTP)

// Atualizar usuário
router.patch("/usuario-update/:id_usuario", usuarioController.atualizarUsuario)

// Buscar usuários
router.get("/usuario/:username", usuarioController.buscarUsuarioPorUsername)
router.get("/usuario/id/:id_usuario", usuarioController.buscarUsuarioPorId)
router.get("/usuario/email/:email", usuarioController.buscarUsuarioPorEmail)
router.get("/usuarios", usuarioController.buscarTodosUsuarios)
router.get("/otp/codigos", usuarioController.buscarTodosCodigos)
router.get("todos/dispositivos", dispositivoController.buscarTodosDispositivos)
// Deletar usuário
router.delete("/usuario-delete/:id_usuario", usuarioController.deletarUsuario)

module.exports = router

// Base: http://localhost:8080/v1/openfinance/usuario