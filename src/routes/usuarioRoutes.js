const express = require("express")
const router = express.Router()

const usuarioController = require("../controller/Usuario/usuarioController.js")

// Cadastro: valida, cria o usuário, gera e envia o OTP (apaga a conta se falhar)
router.post("/criar-usuario", usuarioController.criarCodigoOTPUsuario)

// Atualizar usuário
router.patch("/usuario-update/:id_usuario", usuarioController.atualizarUsuario)

// Buscar usuários
router.get("/usuario/:username", usuarioController.buscarUsuarioPorUsername)
router.get("/usuarios", usuarioController.buscarTodosUsuarios)

// Deletar usuário
router.delete("/usuario-delete/:id_usuario", usuarioController.deletarUsuario)

module.exports = router

// Base: http://localhost:8080/v1/openfinance/usuario