const express = require("express");
const router = express.Router();
const postController = require("../controller/Comunidade/Post/postController.js");


// Criar
router.post("/criar", postController.criarPost);                                          

// Buscar (rotas fixas primeiro, por id por último)
router.get("/buscar/post/:id_usuario", postController.listarPostsPorUsuario);     
router.get(":id_usuario", postController.listarPostsInativos); 
router.get("/buscar/:id_post", postController.buscarPostPorId);

// Atualizar e deletar
router.patch("/atualizar/:id_post", postController.atualizarPost);                       
router.patch("/deletar/:id_post", postController.deletarPost);         


// comentarios

const comentarioController = require('../../src/controller/Comunidade/Comentario/comentarioController.js');

router.post("/comentar", comentarioController.criarComentario)

// Atualizar usuário
router.patch("/update-comentario/:id_comentario", comentarioController.atualizarComentario)

// Buscar usuários
router.get("/buscar-comentarios/post/:id_post", comentarioController.listarComentariosPorPost)
router.get("/buscar-comentario/:id_comentario", comentarioController.buscarComentarioPorId)
router.get("/buscar-comentario/usuario/:id-usuario", comentarioController.listarComentariosPorUsuario)
// Deletar usuário
router.delete("/deletar-comentario/:id_comentario", comentarioController.deletarComentario)


module.exports = router
