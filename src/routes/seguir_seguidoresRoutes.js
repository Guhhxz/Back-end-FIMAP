const seguir_seguidoresContorller  = require("../controller/Seguir_Seguidores/seguir_seguidoresController.js")
const express = require("express")
const router = express.Router()


// Cadastro e autenticação por OTP
router.post("/seguir", seguir_seguidoresContorller.seguir)


// Buscar usuários
router.get("/listar/seguidores/:id_usuario", seguir_seguidoresContorller.listarSeguidores)
router.get("/listar/seguindo/:id_usuario", seguir_seguidoresContorller.listarSeguindo)

// Deletar usuário
router.delete("/unfollow", seguir_seguidoresContorller.deixarDeSeguir)

module.exports = router

