const express = require("express");
const router = express.Router();
const postController = require("../controller/Post/postController.js");
const curtirPostController = require("../controller/Post/curtirPostController.js");

// Criar
router.post("/criar", postController.criarPost);                                          

// Buscar (rotas fixas primeiro, por id por último)
router.get("/buscar/post/:id_usuario", postController.listarPostsPorUsuario);     
router.get(":id_usuario", postController.listarPostsInativos); 
router.get("/buscar/:id_post", postController.buscarPostPorId);

// Atualizar e deletar
router.patch("/atualizar/:id_post", postController.atualizarPost);                       
router.patch("/deletar/:id_post", postController.deletarPost);                            


module.exports = router
