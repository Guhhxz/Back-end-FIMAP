const express = require("express");
const router = express.Router();
const postController = require("../controller/Post/postControlller.js");
const curtirPostController = require("../controller/Post/curtirPostController.js");

// Criar
router.post("/criar", postController.CriarPost);                                          

// Buscar (rotas fixas primeiro, por id por último)
router.get("/buscar/usuario/:id_usuario", postController.ListarTodosPostsPorUsuario);     
router.get("/buscar/ativos/:id_usuario", postController.ListarPostsAtivosPorUsuario);       
router.get("/buscar/post-inativo/:id_usuario", postController.ListarPostsInativosPorUsuario); 
router.get("/buscar/:id_post", postController.BuscarPostPorId);

// Atualizar e deletar
router.patch("/atualizar/:id_post", postController.AtualizarPost);                       
router.delete("/deletar/:id_post", postController.ApagarPost);                            

module.exports = router;