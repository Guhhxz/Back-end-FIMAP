const express = require("express")
const router = express.Router()

const denunciaController = require("../controller/Comunidade/Denuncia/denunciaController.js")

// Criar denúncia
router.post("/criar", denunciaController.criarDenuncia)

// Buscar denúncias
router.get("/buscar/:id_denuncia", denunciaController.buscarDenunciaPorId)
router.get("/listar", denunciaController.listarTodasDenuncias)
router.get("/listar/post/:id_post", denunciaController.listarDenunciasPorPost)
router.get("/listar/usuario/:id_usuario", denunciaController.listarDenunciasPorUsuario)
router.get("/listar/categoria/:id_categoria", denunciaController.listarDenunciasPorCategoria)

// Listar categorias de denúncia
router.get("/categorias", denunciaController.ListarCategoriasDenuncia)

// Atualizar denúncia
router.patch("/atualizar/:id_denuncia", denunciaController.atualizarDenuncia)

// Deletar denúncia
router.delete("/deletar/:id_denuncia", denunciaController.deletarDenuncia)

module.exports = router